import { ActionOrm } from '../../typeorm/action.entity';
import { CreateSwitchDto } from './dto/create-switch.dto';
import { MqttService } from '../mqtt/mqtt.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { DeviceType } from 'src/utils/enums/device-type.enum';
import { Repository, In } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateStateDto } from './dto/state.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UpdateSwitchDto } from './dto/update-switch.dto';
import { State } from 'src/utils/enums/state.enum';
import {
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_SWITCH_RELOAD,
  WS_DEVICE,
} from 'src/utils/constants';
import { DeviceToggle } from 'src/utils/types/device-toggle.type';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    @InjectRepository(ActionOrm)
    private actionRepository: Repository<ActionOrm>,
    private readonly mqttService: MqttService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(SelectedActionOrm)
    private selectedActionRepository: Repository<SelectedActionOrm>
  ) {}

  create(createDeviceDto: CreateDeviceDto) {
    return this.deviceRepository.save({
      name: createDeviceDto.name,
      type: createDeviceDto.type,
      topic: createDeviceDto.topic,
      remark: createDeviceDto.remark,
    });
  }

  async createSwitch(createSwitchDto: CreateSwitchDto) {
    const suis = this.deviceRepository.create({
      name: createSwitchDto.name,
      type: createSwitchDto.type,
      topic: createSwitchDto.topic,
      remark: createSwitchDto.remark,
    });

    const suisOutput = await this.deviceRepository.save(suis);

    createSwitchDto.action.forEach(async (action) => {
      const switchInfo = this.actionRepository.create({
        key: action.key,
        value: action.value,
      });

      switchInfo.device = suis;

      await this.actionRepository.save(switchInfo);
    });

    this.eventEmitter.emit(EVENT_SWITCH_RELOAD);

    return suisOutput;
  }

  findAll(type: DeviceType) {
    if (type !== undefined) {
      return this.deviceRepository.find({
        where: {
          type: type,
        },
        relations: {
          action: true,
        },
      });
    }

    return this.deviceRepository.find({
      relations: { action: true },
    });
  }

  findOne(id: number) {
    return this.deviceRepository.findOne({
      where: { id },
      relations: {
        action: true,
        selectedAction: {
          action: {
            device: true,
          },
        },
      },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: { selectedAction: true },
    });

    if (updateDeviceDto.name) {
      device.name = updateDeviceDto.name;
    }

    if (updateDeviceDto.topic) {
      device.topic = updateDeviceDto.topic;
    }

    if (updateDeviceDto.remark) {
      device.remark = updateDeviceDto.remark;
    }

    const actions = await this.actionRepository.find({
      where: { id: In(updateDeviceDto.actions) },
      relations: { device: true },
    });

    const updatedDevice = await this.deviceRepository.save(device);

    if (device.selectedAction.length === 0) {
      actions.forEach(async (action) => {
        const selectedAction = new SelectedActionOrm();
        selectedAction.action = action;
        selectedAction.device = device;
        await this.selectedActionRepository.save(selectedAction);
      });
    } else {
      /**
       * This section need to be update
       * current implementation is not optimise
       * and just quick solution
       */
      // Clear previous selected action
      device.selectedAction.forEach(async (x) => {
        await this.selectedActionRepository.remove(x);
      });

      // Add updated selected action
      actions.forEach(async (action) => {
        const selectedAction = new SelectedActionOrm();
        selectedAction.action = action;
        selectedAction.device = device;
        await this.selectedActionRepository.save(selectedAction);
      });
    }

    return updatedDevice;
  }

  async updateSwitch(id: number, updateSwitchDto: UpdateSwitchDto) {
    const suis = await this.deviceRepository.findOne({
      where: { id },
      relations: { action: true },
    });

    if (updateSwitchDto.name) {
      suis.name = updateSwitchDto.name;
    }

    if (updateSwitchDto.topic) {
      suis.topic = updateSwitchDto.topic;
    }

    if (updateSwitchDto.remark) {
      suis.remark = updateSwitchDto.remark;
    }

    /**
     * Delete action
     */
    const toDeleteAction = suis.action.filter((action) => {
      return updateSwitchDto.action.find((element) => element.id === action.id)
        ? false
        : true;
    });

    toDeleteAction.forEach(async (action) => {
      await this.actionRepository.delete(action.id);
    });

    /**
     * Add new action
     */
    updateSwitchDto.action.forEach((action) => {
      if (action.id === undefined) {
        const newAction = this.actionRepository.create({
          key: action.key,
          value: action.value,
        });
        suis.action.push(newAction);
      }
    });

    const updatedSuis = await this.deviceRepository.save(suis);

    this.eventEmitter.emit(EVENT_SWITCH_RELOAD);

    return updatedSuis;
  }

  async remove(id: number) {
    return this.deviceRepository.delete(id);
  }

  async updateState(id: number, updateStateDto: UpdateStateDto) {
    const device = await this.deviceRepository.findOneBy({ id });
    device.state = updateStateDto.state;

    if (device.topic) {
      const state = device.state === State.Off ? '0' : '1';
      this.mqttService.publish(device.topic, state);
    }

    const saved = await this.deviceRepository.save(device);

    // Broadcast state change to all connected client
    this.eventEmitter.emit(WS_DEVICE, device);

    return saved;
  }

  findAllAction() {
    return this.actionRepository.find();
  }

  @OnEvent(EVENT_DEVICE_UPDATE_STATE)
  async onDeviceUpdateState(data: DeviceToggle) {
    this.updateState(data.deviceId, { state: data.state });
  }
}
