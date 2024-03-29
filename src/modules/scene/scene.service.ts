import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SceneDeviceOrm } from 'src/typeorm/scene-device.entity';
import { SceneOrm } from 'src/typeorm/scene.entity';
import { State } from 'src/utils/enums/state.enum';
import { In, Repository } from 'typeorm';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { UpdateStateSceneDto } from './dto/update-state-scene.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_DEVICE_UPDATE_STATE } from 'src/utils/constants';
import { DeviceToggle } from 'src/utils/types/device-toggle.type';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';
import { ActionOrm } from 'src/typeorm/action.entity';

@Injectable()
export class SceneService {
  constructor(
    @InjectRepository(ActionOrm) private actionRepository: Repository<ActionOrm>,
    @InjectRepository(SceneActionOrm) private sceneActionRepository: Repository<SceneActionOrm>,
    @InjectRepository(SceneOrm) private sceneRepository: Repository<SceneOrm>,
    @InjectRepository(DeviceOrm) private deviceRepository: Repository<DeviceOrm>,
    @InjectRepository(SceneDeviceOrm) private sceneDeviceRepository: Repository<SceneDeviceOrm>,
    private readonly eventEmitter: EventEmitter2
  ) { }


  /**
   * The function to trigger and activate all the light / fan from scene
   * @date 3/21/2024 - 7:07:42 AM
   *
   * @async
   * @param {number} id
   * @returns {unknown}
   */
  async triggerScene(id: number) {
    // Get a scene from database based on scene id
    const scene = await this.sceneRepository.findOne({ where: { id }, relations: { sceneDevice: true } });

    // Get device id
    const deviceIdList = scene.sceneDevice.map((x) => {
      return x.deviceId;
    });

    // Get devices from database to change device state
    const devices = await this.deviceRepository.find({
      where: { id: In(deviceIdList) },
    });

    // Update device state according to scene state
    // Note: The actual state is in device table !!!
    for (let index = 0; index < devices.length; index++) {
      devices[index].state =
        scene.sceneDevice[
          scene.sceneDevice.findIndex(
            (x) => x.deviceId === devices[index].id
          )
        ].state;
    }

    await this.deviceRepository.save(devices);

    // Update client to change the state
    scene.sceneDevice.forEach((x) => {
      const data: DeviceToggle = {
        deviceId: x.deviceId,
        state: x.state,
      };

      this.eventEmitter.emit(EVENT_DEVICE_UPDATE_STATE, data);
    });

    return { status: HttpStatus.OK, message: 'Success' };
  }

  async create(createSceneDto: CreateSceneDto) {
    // Save scene
    const scene = this.sceneRepository.create({ name: createSceneDto.name });
    await this.sceneRepository.save(scene);

    createSceneDto.data.forEach((data) => {
      this.deviceRepository
        .findOneBy({ id: data.device.id })
        .then((device) => {
          const sceneDevice = this.sceneDeviceRepository.create({
            state: data.status ? State.On : State.Off,
            device,
            scene,
          });

          this.sceneDeviceRepository
            .save(sceneDevice)
            .then()
            .catch((error) => {
              console.log('error saved: ', error);
            });
        })
        .catch((error) => {
          console.log('error find: ', error);
        });
    });
  }

  findAll() {
    return this.sceneRepository.find({
      relations: {
        sceneDevice: {
          device: true,
        },
        sceneAction: {
          action: {
            device: true
          }
        } 
      },
    });
  }

  findOne(id: number) {
    return this.sceneRepository.findOne({
      where: { id },
      relations: {
        sceneDevice: {
          device: true,
        },
        sceneAction: {
          action: {
            device: true,
          }
        },
      },
    });
  }

  async update(id: number, updateSceneDto: UpdateSceneDto) {
    // Get scene
    const scene = await this.sceneRepository.findOne({
      where: { id },
      relations: { sceneAction: true }
    })

    scene.name = updateSceneDto.name;
    await this.sceneRepository.save(scene);

    // Get scene device (intermediate table)
    const sceneDevices = await this.sceneDeviceRepository.find({
      where: { sceneId: id },
    });

    // Change status if there is changes
    const updated: SceneDeviceOrm[] = [];

    sceneDevices.forEach((x) => {
      const idx = updateSceneDto.data.findIndex(
        (y) => y.device.id === x.deviceId
      );

      if (idx > -1) {
        if (
          x.state !== (updateSceneDto.data[idx].status ? State.On : State.Off)
        ) {
          x.state = x.state === State.Off ? State.On : State.Off;
          updated.push(x);
        }
      }
    });

    if (updated.length > 0) {
      this.sceneDeviceRepository.save(updated);
    }

    // Find deleted device
    const deleted = sceneDevices.filter((x) => {
      return (
        updateSceneDto.data.findIndex((y) => y.device.id === x.deviceId) < 0
      );
    });

    await this.sceneDeviceRepository.remove(deleted);

    // Create new device
    const added = updateSceneDto.data.filter((x) => {
      return sceneDevices.findIndex((y) => y.deviceId === x.device.id) < 0;
    });

    const sceneDeviceCreated: SceneDeviceOrm[] = [];

    added.forEach((x) => {
      const sceneDevice = this.sceneDeviceRepository.create({
        deviceId: x.device.id,
        sceneId: sceneDevices[0].sceneId,
        state: x.status ? State.On : State.Off,
      });

      sceneDeviceCreated.push(sceneDevice);
    });

    const actions = await this.actionRepository.find({
      where: { id: In(updateSceneDto.actions) },
      relations: { device: true }
    });

    const updatedScene = this.sceneDeviceRepository.save(sceneDeviceCreated);

    if (scene.sceneAction.length === 0) {
      actions.forEach(async (action) => {
        const sceneAction = new SceneActionOrm();
        sceneAction.action = action;
        sceneAction.scene = scene;
        await this.sceneActionRepository.save(sceneAction);
      })
    } else {
      /**
       * This section need to be update
       * current implementation is not optimise
       * and just quick solution
       */
      // Clear previous selected action
      scene.sceneAction.forEach(async (sceneAction) => {
        await this.sceneActionRepository.remove(sceneAction);
      })

      // Add updated scene action
      actions.forEach(async (action) => {
        const sceneAction = new SceneActionOrm();
        sceneAction.action = action;
        sceneAction.scene = scene;
        const hehe = await this.sceneActionRepository.save(sceneAction);
      })
    }

    return this.sceneDeviceRepository.find({
      where: { sceneId: id },
    });
  }

  remove(id: number) {
    return this.sceneRepository.delete(id);
  }
}
