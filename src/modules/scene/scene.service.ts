import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SceneDeviceOrm } from 'src/typeorm/scene-device.entity';
import { SceneOrm } from 'src/typeorm/scene.entity';
import { State } from 'src/commons/enums/state.enum';
import { In, Repository } from 'typeorm';
import { CreateSceneDto } from './dto/create-scene.dto';
import { UpdateSceneDto } from './dto/update-scene.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENT_DEVICE_UPDATE_STATE } from 'src/utils/constants';
import { DeviceToggle } from 'src/commons/types/device-toggle.type';
import { ActionOrm } from 'src/typeorm/action.entity';
import { Scene } from './entities/scene.entity';

@Injectable()
export class SceneService {
  constructor(
    @InjectRepository(ActionOrm)
    private actionRepository: Repository<ActionOrm>,
    @InjectRepository(SceneOrm) private sceneRepository: Repository<SceneOrm>,
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    @InjectRepository(SceneDeviceOrm)
    private sceneDeviceRepository: Repository<SceneDeviceOrm>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
    const scene = await this.sceneRepository.findOne({
      where: { id },
      relations: { sceneDevice: true },
    });

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
    // Create scene, save scene and get saved entity
    const scene = this.sceneRepository.create({ name: createSceneDto.name });

    // Get actions
    const actions = await this.actionRepository.find({
      where: {
        id: In(createSceneDto.actions),
      },
    });

    // Add actions to the scene
    scene.actions = actions;

    await this.sceneRepository.save(scene);

    // Iterate the device of Create Scene Dto
    createSceneDto.devices.forEach((deviceDto) => {
      // Find the device by id from server
      this.deviceRepository
        .findOneBy({ id: deviceDto.id })
        .then((device) => {
          const sceneDevice = this.sceneDeviceRepository.create({
            state: deviceDto.state,
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

  async findAll() {
    const scenes = await this.sceneRepository.find({
      relations: {
        sceneDevice: {
          device: true,
        },
        actions: {
          suis: {
            device: true,
          },
        },
      },
    });

    return scenes;

    return scenes.map((x) => new Scene(x));
  }

  async findOne(id: number) {
    const scene = await this.sceneRepository.findOne({
      where: { id },
      relations: {
        sceneDevice: {
          device: true,
        },
        actions: {
          suis: {
            device: true,
          },
        },
      },
    });

    return scene;
    return new Scene(scene);
  }

  async update(id: number, updateSceneDto: UpdateSceneDto) {
    // Get scene
    const scene = await this.sceneRepository.findOne({
      where: { id },
      relations: { actions: true },
    });

    // Update name
    scene.name = updateSceneDto.name;

    // Update actions
    // Get actions
    const actions = await this.actionRepository.find({
      where: {
        id: In(updateSceneDto.actions),
      },
    });

    // Add actions to the scene
    scene.actions = actions;

    await this.sceneRepository.save(scene);

    // Get scene device (intermediate table)
    const sceneDevices = await this.sceneDeviceRepository.find({
      where: { sceneId: id },
    });

    // Change status if there is changes
    const updated: SceneDeviceOrm[] = [];

    sceneDevices.forEach((x) => {
      const index = updateSceneDto.devices.findIndex(
        (y) => y.id === x.deviceId,
      );

      if (index > -1) {
        if (x.state !== updateSceneDto.devices[index].state) {
          x.state = x.state === State.Off ? State.On : State.Off;
          updated.push(x);
        }
      }
    });

    if (updated.length > 0) {
      await this.sceneDeviceRepository.save(updated);
    }

    // Find deleted device
    const toDelete = sceneDevices.filter((x) => {
      return updateSceneDto.devices.findIndex((y) => y.id === x.deviceId) < 0;
    });

    await this.sceneDeviceRepository.remove(toDelete);

    // Create new device
    const toAdd = updateSceneDto.devices.filter((x) => {
      return sceneDevices.findIndex((y) => y.deviceId === x.id) < 0;
    });

    const sceneDeviceCreated: SceneDeviceOrm[] = [];

    toAdd.forEach((x) => {
      const sceneDevice = this.sceneDeviceRepository.create({
        deviceId: x.id,
        sceneId: id,
        state: x.state ? State.On : State.Off,
      });

      sceneDeviceCreated.push(sceneDevice);
    });

    const updatedScene =
      await this.sceneDeviceRepository.save(sceneDeviceCreated);

    return this.sceneRepository.find({
      where: { id },
      relations: {
        actions: true,
        sceneDevice: true,
      },
    });
  }

  remove(id: number) {
    return this.sceneRepository.delete(id);
  }
}
