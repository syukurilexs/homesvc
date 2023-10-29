import { Injectable } from '@nestjs/common';
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

@Injectable()
export class SceneService {
  constructor(
    @InjectRepository(SceneOrm) private sceneRepository: Repository<SceneOrm>,
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    @InjectRepository(SceneDeviceOrm)
    private sceneDeviceRepository: Repository<SceneDeviceOrm>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async updateState(id: string, updateSceneState: UpdateStateSceneDto) {
    // Get device id
    const deviceIdList = updateSceneState.sceneDevice.map((x) => {
      return x.deviceId;
    });

    // Get devices from database
    const devices = await this.deviceRepository.find({
      where: { id: In(deviceIdList) },
    });

    // Update device state according to scene state
    for (let index = 0; index < devices.length; index++) {
      devices[index].state =
        updateSceneState.sceneDevice[
          updateSceneState.sceneDevice.findIndex(
            (x) => x.deviceId === devices[index].id
          )
        ].state;
    }

    await this.deviceRepository.save(devices);

    // Update client to change the state
    updateSceneState.sceneDevice.forEach((x) => {
      const data: DeviceToggle = {
        deviceId: x.deviceId,
        state: x.state,
      };

      this.eventEmitter.emit(EVENT_DEVICE_UPDATE_STATE, data);
    });

    return updateSceneState;
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
      },
    });
  }

  async update(id: number, updateSceneDto: UpdateSceneDto) {
    // Get scene
    const scene = await this.sceneRepository.findOne({
      where: {id}
    })

    scene.name = updateSceneDto.name;
    await this.sceneRepository.save(scene);

    // Get scene device (intermediate table)
    const output = await this.sceneDeviceRepository.find({
      where: { sceneId: id },
    });

    // Change status if there is changes
    const updated: SceneDeviceOrm[] = [];

    output.forEach((x) => {
      const idx = updateSceneDto.data.findIndex(
        (y) => y.device.id === x.deviceId
      );

      if (idx > 0) {
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
    const deleted = output.filter((x) => {
      return (
        updateSceneDto.data.findIndex((y) => y.device.id === x.deviceId) < 0
      );
    });

    await this.sceneDeviceRepository.remove(deleted);

    // Create new device
    const added = updateSceneDto.data.filter((x) => {
      return output.findIndex((y) => y.deviceId === x.device.id) < 0;
    });

    const sceneDeviceCreated: SceneDeviceOrm[] = [];

    added.forEach((x) => {
      const sceneDevice = this.sceneDeviceRepository.create({
        deviceId: x.device.id,
        sceneId: output[0].sceneId,
        state: x.status ? State.On : State.Off,
      });

      sceneDeviceCreated.push(sceneDevice);
    });

    this.sceneDeviceRepository.save(sceneDeviceCreated);

    return this.sceneDeviceRepository.find({
      where: { sceneId: id },
    });
  }

  remove(id: number) {
    return this.sceneRepository.delete(id);
  }
}
