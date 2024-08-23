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
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateStateDto } from './dto/state.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UpdateSwitchDto } from './dto/update-switch.dto';
import { State } from 'src/commons/enums/state.enum';
import {
  EVENT_CONTACT_RELOAD,
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_SWITCH_RELOAD,
  WS_DEVICE,
} from 'src/utils/constants';
import { DeviceToggle } from 'src/commons/types/device-toggle.type';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { CreateContactDto } from './dto/create-contact-sensor.dto';
import { ContactSensorOrm } from 'src/typeorm/contact-sensor.entity';
import { ContactEntity } from './entities/contact.entity';
import { SuisEntity } from './entities/suis.entity';
import { UpdateContactDto } from './dto/update-contact.dto';
import { LightEntity } from './entities/light.entity';
import { ActionEntity } from './entities/action.entity';
import { CreateRpiDto } from './dto/create-rpi.dto';
import { RpiOrm } from 'src/typeorm/rpi.entity';
import { RpiEntity } from './entities/rpi.entity';
import { UpdateRpiDto } from './dto/update-rpi.dto';
import { CreateFanDto } from './dto/create-fan.dto';
import { CreateLightDto } from './dto/create-light.dto';
import { FanOrm } from 'src/typeorm/fan.entity';
import { UpdateFanDto } from './dto/update-fan.dto';
import { defaultIfEmpty } from 'rxjs';
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
    @InjectRepository(RpiOrm)
    private rpiRepository: Repository<RpiOrm>,
    @InjectRepository(FanOrm)
    private fanRepository: Repository<FanOrm>,
    @InjectRepository(LightOrm)
    private lightRepository: Repository<LightOrm>,
    @InjectRepository(SuisOrm)
    private suisRepository: Repository<SuisOrm>,
  ) {}

  async createRpi(createRpiDto: CreateRpiDto) {
    /*
    // Create common device
    const deviceEntity = this.deviceRepository.create({
      name: createRpiDto.name,
      remark: createRpiDto.remark || '',
      topic: createRpiDto.topic,
      type: DeviceType.Rpi,
    });

    // Create rpi
    const rpiEntity = this.rpiRepository.create({
      on: createRpiDto.on,
      off: createRpiDto.off,
      device: deviceEntity,
    });

    // Save entity and cascade
    await this.rpiRepository.save(rpiEntity);

    return this.deviceRepository.find({ relations: { rpi: true } });
    */
  }

  createLight(createLightDto: CreateLightDto) {
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
          fan: { actions: { suis: { device: true } } },
          light: { actions: { suis: { device: true } } },
          suis: { actions: true },
        },
      });

      return output;
    } else {
      const output = await this.deviceRepository.find({
        relations: {
          fan: { actions: { suis: { device: true } } },
          light: { actions: { suis: { device: true } } },
          suis: { actions: true },
        },
      });

      return output;
    }
  }

  async findOne(id: number) {
    const output = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        fan: { actions: { suis: { device: true } } },
        light: { actions: { suis: { device: true } } },
        suis: {
          actions: true,
        },
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
    console.log(updateSwitchDto);
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

  async updateRpi(id: number, updateRpiDto: UpdateRpiDto) {
    /*
    // Find device
    const device = await this.deviceRepository.findOne({
      where: { id: id },
      relations: {
        rpi: true,
      },
    });

    // Throw if not found
    if (device === null) {
      throw new HttpException(
        `Device Id ${id} not found`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Update if found
    if (updateRpiDto.name) {
      device.name = updateRpiDto.name;
    }

    if (updateRpiDto.remark) {
      device.remark = updateRpiDto.remark;
    }

    if (updateRpiDto.topic) {
      device.topic = updateRpiDto.topic;
    }

    await this.deviceRepository.save(device);

    // Find rpi
    const rpi = await this.rpiRepository.findOne({
      where: { id: device.rpi.id },
    });

    if (rpi === null) {
      throw new BadRequestException(`Rpi Id ${device.id} not found`);
    }

    if (rpi) {
      if (updateRpiDto.off) {
        rpi.off = updateRpiDto.off;
      }

      if (updateRpiDto.on) {
        rpi.on = updateRpiDto.on;
      }

      await this.rpiRepository.save(rpi);
    }

    return this.deviceRepository.findOne({
      where: { id },
      relations: { rpi: true },
    });
    */
  }

  async remove(id: number) {
    return this.deviceRepository.delete(id);
  }

  async updateState(id: number, updateStateDto: UpdateStateDto) {
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        light: true,
        fan: true,
        suis: true,
      },
    });

    if (device.type === DeviceType.Light) {
      device.light.state = updateStateDto.state;

      if (device.light.topic) {
        const state = device.light.state === State.Off ? '0' : '1';
        this.mqttService.publish(device.light.topic, state);

        await this.activityLogRepository.save({
          level: 'log',
          message: `${device.name} ${device.light.state}`,
        });
      }
    } else if (device.type === DeviceType.Fan) {
      device.fan.state = updateStateDto.state;

      if (device.fan.topic) {
        const state = device.fan.state === State.Off ? '0' : '1';
        this.mqttService.publish(device.fan.topic, state);

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
