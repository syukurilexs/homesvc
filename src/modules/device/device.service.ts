import { ActionOrm } from '../../typeorm/action.entity';
import { CreateSwitchDto } from './dto/create-switch.dto';
import { MqttService } from '../mqtt/mqtt.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { DeviceType } from 'src/commons/enums/device-type.enum';
import { Repository, In } from 'typeorm';
import { UpdateStateDto } from './dto/state.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UpdateSwitchDto } from './dto/update-switch.dto';
import { State } from 'src/commons/enums/state.enum';
import {
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_SWITCH_RELOAD,
  WS_DEVICE,
} from 'src/utils/constants';
import { DeviceToggle } from 'src/commons/types/device-toggle.type';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { CreateContactDto } from './dto/create-contact-sensor.dto';
import { ContactSensorOrm } from 'src/typeorm/contact-sensor.entity';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateActuatorDto } from './dto/create-actuator.dto';
import { ActuatorOrm } from 'src/typeorm/actuator.entity';
import { UpdateActuatorDto } from './dto/update-actuator.dto';
import { CreateFanDto } from './dto/create-fan.dto';
import { CreateLightDto } from './dto/create-light.dto';
import { FanOrm } from 'src/typeorm/fan.entity';
import { UpdateFanDto } from './dto/update-fan.dto';
import { LightOrm } from 'src/typeorm/light.entity';
import { UpdateLightDto } from './dto/update-light.dto';
import { SuisOrm } from 'src/typeorm/suis.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    @InjectRepository(ActionOrm)
    private actionRepository: Repository<ActionOrm>,
    private readonly mqttService: MqttService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(ActivityLogOrm)
    private activityLogRepository: Repository<ActivityLogOrm>,
    @InjectRepository(ContactSensorOrm)
    private contactSensorRepository: Repository<ContactSensorOrm>,
    @InjectRepository(ActuatorOrm)
    private actuatorRepository: Repository<ActuatorOrm>,
    @InjectRepository(FanOrm)
    private fanRepository: Repository<FanOrm>,
    @InjectRepository(LightOrm)
    private lightRepository: Repository<LightOrm>,
    @InjectRepository(SuisOrm)
    private suisRepository: Repository<SuisOrm>,
  ) {}

  async createActuator(createActuatorDto: CreateActuatorDto) {
    // Create common device
    const deviceEntity = this.deviceRepository.create({
      name: createActuatorDto.name,
      remark: createActuatorDto.remark || '',
      type: DeviceType.Actuator,
    });

    // Create actuator
    const actuatorEntity = this.actuatorRepository.create({
      key: createActuatorDto.key,
      on: createActuatorDto.on,
      off: createActuatorDto.off,
      topic: createActuatorDto.topic,
      device: deviceEntity,
    });

    // Save entity and cascade
    await this.actuatorRepository.save(actuatorEntity);

    return this.deviceRepository.find({ relations: { actuator: true } });
  }

  async createLight(createLightDto: CreateLightDto) {
    // Create common device
    const deviceEntity = this.deviceRepository.create({
      name: createLightDto.name,
      type: DeviceType.Light,
      remark: createLightDto.remark,
    });

    // Create light entity
    const lightEntity = this.lightRepository.create({
      topic: createLightDto.topic,
    });
    deviceEntity.light = lightEntity;

    // Get actuator
    if (createLightDto.actuator && createLightDto.actuator > -1) {
      const actuator = await this.deviceRepository.findOneBy({
        id: createLightDto.actuator,
      });
      if (actuator) {
        lightEntity.deviceActuator = actuator;
      }
    }

    // Save device and cascade to light
    return this.deviceRepository.save(deviceEntity);
  }
  /**
   * Creating device (Light & Fan)
   * @date 4/9/2024 - 10:43:50 AM
   *
   * @async
   * @param {CreateDeviceDto} createFanDto
   * @returns {unknown}
   */
  async createFan(createFanDto: CreateFanDto) {
    // Create common device
    const deviceEntity = this.deviceRepository.create({
      name: createFanDto.name,
      type: DeviceType.Fan,
      remark: createFanDto.remark,
    });

    // Create fan entity
    const fanEntity = this.fanRepository.create({
      actions: [],
      topic: createFanDto.topic,
    });
    deviceEntity.fan = fanEntity;

    // Get actuator
    if (createFanDto.actuator && createFanDto.actuator > -1) {
      const actuator = await this.deviceRepository.findOneBy({
        id: createFanDto.actuator,
      });
      if (actuator) {
        fanEntity.deviceActuator = actuator;
      }
    }

    // Get action from Action Table based on selected action from input DTO
    const foundAction = await this.actionRepository.find({
      where: { id: In(createFanDto.actions) },
    });

    deviceEntity.fan.actions.push(...foundAction);

    // Save device to server and get return saved device with id
    const savedDevice = await this.deviceRepository.save(deviceEntity);

    return savedDevice;
  }

  async createSwitch(createSwitchDto: CreateSwitchDto) {
    // Create device
    const deviceEntity = this.deviceRepository.create({
      name: createSwitchDto.name,
      type: DeviceType.Switch,
      remark: createSwitchDto.remark,
    });

    // Create suis
    const suisEntity = this.suisRepository.create({
      actions: [],
      topic: createSwitchDto.topic,
    });

    // Create action and push to suis
    createSwitchDto.action.forEach(async (action) => {
      const switchInfo = this.actionRepository.create({
        key: action.key,
        value: action.value,
      });

      suisEntity.actions.push(switchInfo);
    });

    deviceEntity.suis = suisEntity;

    // Save device together with cascade suis and action
    const suisOutput = await this.deviceRepository.save(deviceEntity);

    this.eventEmitter.emit(EVENT_SWITCH_RELOAD);

    return suisOutput;
  }

  /**
   * Create Contact Sensor
   * @date 3/31/2024 - 5:50:50 PM
   *
   * @async
   * @param {CreateContactDto} createContactSensorDto
   * @returns {unknown}
   */
  async createContactSensor(createContactSensorDto: CreateContactDto) {
    /*
    // Create device
    const device = this.deviceRepository.create({
      name: createContactSensorDto.name,
      type: DeviceType.Contact,
      topic: createContactSensorDto.topic,
      remark: createContactSensorDto.remark,
    });

    // Create contact sensor with default value define in entity
    const contact = this.contactSensorRepository.create({});

    // Create relationship
    contact.device = device;
    contact.key = createContactSensorDto.key;

    // Save entity and cascade
    const saveContact = await this.contactSensorRepository.save(contact);

    // Reload contact to subscribe to mqtt to include recently added contact
    this.eventEmitter.emit(EVENT_CONTACT_RELOAD);

    return saveContact;
    */
  }

  async findAll(type: DeviceType) {
    if (type !== undefined) {
      const output = await this.deviceRepository.find({
        where: {
          type: type,
        },
        relations: {
          fan: {
            actions: { suis: { device: true } },
            deviceActuator: { actuator: true },
          },
          light: {
            actions: { suis: { device: true } },
            deviceActuator: { actuator: true },
          },
          suis: { actions: true },
          actuator: true,
        },
      });

      return output;
    } else {
      const output = await this.deviceRepository.find({
        relations: {
          fan: {
            actions: { suis: { device: true } },
            deviceActuator: { actuator: true },
          },
          light: {
            actions: { suis: { device: true } },
            deviceActuator: { actuator: true },
          },
          suis: { actions: true },
          actuator: true,
        },
      });

      return output;
    }
  }

  async findOne(id: number) {
    const output = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        fan: {
          actions: { suis: { device: true } },
          deviceActuator: { actuator: true },
        },
        light: {
          actions: { suis: { device: true } },
          deviceActuator: { actuator: true },
        },
        suis: {
          actions: true,
        },
        actuator: true,
      },
    });

    if (output === null) {
      throw new HttpException(
        `Contact sensor with id ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return output;
    return this.mapDevice(output);
  }

  mapDevice(input: DeviceOrm) {
    /*
    if (input.type === DeviceType.Contact) {
      return new ContactEntity({
        id: input.id,
        name: input.name,
        remark: input.remark,
        topic: input.topic,
        type: input.type,
        key: input.contactSensor.key,
      });
    } else if (input.type === DeviceType.Switch) {
      return new SuisEntity({
        id: input.id,
        name: input.name,
        remark: input.remark,
        topic: input.topic,
        type: input.type,
        action: input.action.map((x) => {
          return {
            key: x.key,
            value: x.value,
            id: x.id,
          };
        }),
      });
    } else if (
      input.type === DeviceType.Light ||
      input.type === DeviceType.Fan
    ) {
      return new LightEntity({
        id: input.id,
        name: input.name,
        remark: input.remark,
        topic: input.topic,
        type: input.type,
        state: input.state,
        selectedAction: input.selectedAction.map((x) => {
          return {
            id: x.action.id,
            key: x.action.key,
            value: x.action.value,
            name: x.action.device.name,
          };
        }),
      });
    } else if (input.type === DeviceType.Rpi) {
      return new RpiEntity({
        id: input.id,
        name: input.name,
        remark: input.remark,
        topic: input.topic,
        type: input.type,
        on: input.rpi.on,
        off: input.rpi.off,
      });
    }
      */
  }

  async updateLight(id: number, updateLightDto: UpdateLightDto) {
    // Get device and light
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: { light: true },
    });

    if (device === null) {
      throw new BadRequestException(`Light not found for id ${id}`);
    }

    // Name
    if (updateLightDto.name) {
      device.name = updateLightDto.name;
    }

    // Remark
    if (updateLightDto.remark) {
      device.remark = updateLightDto.remark;
    }

    // Topic
    if (updateLightDto.topic) {
      device.light.topic = updateLightDto.topic;
    }

    // Get action
    const actions = await this.actionRepository.find({
      where: { id: In(updateLightDto.actions) },
    });

    device.light.actions = actions;

    // Get actuator
    if (updateLightDto.actuator) {
      const actuator = await this.deviceRepository.findOne({
        where: {
          id: updateLightDto.actuator,
        },
      });

      device.light.deviceActuator = actuator;
    }
    return this.deviceRepository.save(device);
  }

  async updateFan(id: number, updateFanDto: UpdateFanDto) {
    // Get device and fan
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: { fan: { actions: true } },
    });

    if (device === null) {
      throw new BadRequestException(`Fan not found for id ${id}`);
    }

    // Name
    if (updateFanDto.name) {
      device.name = updateFanDto.name;
    }

    // Remark
    if (updateFanDto.remark) {
      device.remark = updateFanDto.remark;
    }

    // Topic
    if (updateFanDto.topic) {
      device.fan.topic = updateFanDto.topic;
    }

    // Get action
    const actions = await this.actionRepository.find({
      where: {
        id: In(updateFanDto.actions),
      },
    });
    device.fan.actions = actions;

    // Get actuator
    if (updateFanDto.actuator) {
      const actuator = await this.deviceRepository.findOne({
        where: {
          id: updateFanDto.actuator,
        },
      });

      device.fan.deviceActuator = actuator;
    }

    return this.deviceRepository.save(device);
  }

  /**
   * Use to update device table and also contact table
   * @date 4/8/2024 - 11:59:47 AM
   *
   * @async
   * @param {number} id Id of device
   * @param {UpdateDeviceDto} updateDeviceDto DTO object to update the value
   * @returns {unknown} Return saved device only
   */
  async updateContact(id: number, updateDeviceDto: UpdateContactDto) {
    /*
    // Get contact base on id
    const device = await this.deviceRepository.findOne({
      where: {
        id,
      },
      relations: {
        contactSensor: true,
      },
    });

    // If contact is not found, throw with status 404 (not found)
    if (device === null) {
      // To Do
      throw new HttpException(
        `Contact with id ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Update entity with new data from DTO
    device.name = updateDeviceDto.name;
    device.topic = updateDeviceDto.topic;
    device.remark = updateDeviceDto.remark;

    // Update contact table for key column
    if (device.contactSensor) {
      device.contactSensor.key = updateDeviceDto.key;
    }

    // Save to database (cascade)
    const savedContact = this.deviceRepository.save(device);

    // Reload contact to subscribe to mqtt for recent updated contact
    this.eventEmitter.emit(EVENT_CONTACT_RELOAD);

    return savedContact;
    */
  }

  async updateSwitch(id: number, updateSwitchDto: UpdateSwitchDto) {
    const deviceSuis = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        suis: {
          actions: true,
        },
      },
    });

    if (updateSwitchDto.name) {
      deviceSuis.name = updateSwitchDto.name;
    }

    if (updateSwitchDto.topic) {
      deviceSuis.suis.topic = updateSwitchDto.topic;
    }

    if (updateSwitchDto.remark) {
      deviceSuis.remark = updateSwitchDto.remark;
    }

    // Find and delete action
    const toDeleteAction = deviceSuis.suis.actions.filter(
      (action, indx, arr) => {
        const result = updateSwitchDto.action.find(
          (element) => element.id === action.id,
        )
          ? false
          : true;

        if (result) {
          arr.splice(indx, 1);
        }

        return result;
      },
    );

    // Add new action, when no id meaning it is new
    updateSwitchDto.action.forEach((action) => {
      if (action.id === undefined) {
        const newAction = this.actionRepository.create({
          key: action.key,
          value: action.value,
        });
        deviceSuis.suis.actions.push(newAction);
      }
    });

    // Save device suis and cascade update, insert, remove to suis & action
    const updatedSuis = await this.deviceRepository.save(deviceSuis);

    this.eventEmitter.emit(EVENT_SWITCH_RELOAD);

    return updatedSuis;
  }

  async updateActuator(id: number, updateActuatorDto: UpdateActuatorDto) {
    // Find device
    const device = await this.deviceRepository.findOne({
      where: { id: id },
      relations: {
        actuator: true,
      },
    });

    // Throw if not found
    if (device === null) {
      throw new HttpException(
        `Device Id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (updateActuatorDto.name) {
      device.name = updateActuatorDto.name;
    }

    if (updateActuatorDto.remark) {
      device.remark = updateActuatorDto.remark;
    }

    if (updateActuatorDto.topic) {
      device.actuator.topic = updateActuatorDto.topic;
    }

    if (updateActuatorDto.key) {
      device.actuator.key = updateActuatorDto.key;
    } else {
      device.actuator.key = '';
    }

    if (updateActuatorDto.off) {
      device.actuator.off = updateActuatorDto.off;
    }

    if (updateActuatorDto.on) {
      device.actuator.on = updateActuatorDto.on;
    }

    return await this.deviceRepository.save(device);
  }

  async remove(id: number) {
    return this.deviceRepository.delete(id);
  }

  async updateState(id: number, updateStateDto: UpdateStateDto) {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        light: { deviceActuator: { actuator: true } },
        fan: { deviceActuator: { actuator: true } },
        suis: true,
      },
    });

    if (device.type === DeviceType.Light) {
      device.light.state = updateStateDto.state;

      if (device.light.deviceActuator) {
        let message: string | Record<string, string>;
        const state =
          device.light.state === State.Off
            ? device.light.deviceActuator.actuator.off
            : device.light.deviceActuator.actuator.on;

        if (
          device.light.deviceActuator.actuator.key &&
          device.light.deviceActuator.actuator.key.length > 0
        ) {
          message = {};
          message[device.light.deviceActuator.actuator.key] = state;
        } else {
          message = state;
        }

        this.mqttService.publish(
          device.light.deviceActuator.actuator.topic,
          message,
        );

        await this.activityLogRepository.save({
          level: 'log',
          message: `${device.name} ${device.light.state}`,
        });
      }
    } else if (device.type === DeviceType.Fan) {
      device.fan.state = updateStateDto.state;

      if (device.fan.deviceActuator) {
        let message: string | Record<string, string>;
        const state =
          device.fan.state === State.Off
            ? device.fan.deviceActuator.actuator.off
            : device.fan.deviceActuator.actuator.on;

        if (
          device.fan.deviceActuator.actuator.key &&
          device.fan.deviceActuator.actuator.key.length > 0
        ) {
          message = {};
          message[device.fan.deviceActuator.actuator.key] = state;
        } else {
          message = state;
        }

        this.mqttService.publish(
          device.fan.deviceActuator.actuator.topic,
          message,
        );

        await this.activityLogRepository.save({
          level: 'log',
          message: `${device.name} ${device.fan.state}`,
        });
      }
    }

    const saved = await this.deviceRepository.save(device);

    // Broadcast state change to all connected client
    this.eventEmitter.emit(WS_DEVICE, device);

    return saved;
  }

  async findAllAction() {
    const action = await this.actionRepository.find({
      relations: {
        suis: {
          device: true,
        },
      },
    });

    return action;
  }

  @OnEvent(EVENT_DEVICE_UPDATE_STATE)
  async onDeviceUpdateState(data: DeviceToggle) {
    this.updateState(data.deviceId, { state: data.state });
  }
}
