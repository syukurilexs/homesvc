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
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
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
    private selectedActionRepository: Repository<SelectedActionOrm>,
    @InjectRepository(ActivityLogOrm)
    private activityLogRepository: Repository<ActivityLogOrm>,
    @InjectRepository(ContactSensorOrm)
    private contactSensorRepository: Repository<ContactSensorOrm>,
    @InjectRepository(RpiOrm)
    private rpiRepository: Repository<RpiOrm>,
  ) {}

  async createRpi(createRpiDto: CreateRpiDto) {
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
  }

  /**
   * Creating device (Light & Fan)
   * @date 4/9/2024 - 10:43:50 AM
   *
   * @async
   * @param {CreateDeviceDto} createDeviceDto
   * @returns {unknown}
   */
  async create(createDeviceDto: CreateDeviceDto) {
    const deviceEntity = this.deviceRepository.create({
      name: createDeviceDto.name,
      type: createDeviceDto.type,
      topic: createDeviceDto.topic,
      remark: createDeviceDto.remark,
    });

    // Get action from Action Table based on selected action from input DTO
    const foundAction = await this.actionRepository.find({
      where: { id: In(createDeviceDto.actions) },
    });

    // Save device to server and get return saved device with id
    const savedDevice = await this.deviceRepository.save(deviceEntity);

    // Maps device and action to intermediate table (SelectedAction Table)
    foundAction.forEach(async (action) => {
      // Create selected device and maps saved device with found action
      const selectedActionEntity = new SelectedActionOrm();
      selectedActionEntity.device = savedDevice;
      selectedActionEntity.action = action;

      // Insert selected action into intermediate table
      await this.selectedActionRepository.save(selectedActionEntity);
    });

    return savedDevice;
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

  /**
   * Create Contact Sensor
   * @date 3/31/2024 - 5:50:50 PM
   *
   * @async
   * @param {CreateContactDto} createContactSensorDto
   * @returns {unknown}
   */
  async createContactSensor(createContactSensorDto: CreateContactDto) {
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
  }

  async findAll(type: DeviceType) {
    if (type !== undefined) {
      const output = await this.deviceRepository.find({
        where: {
          type: type,
        },
        relations: {
          action: true,
          selectedAction: {
            action: {
              device: true,
            },
          },
          rpi: true,
        },
      });

      return output.map((x) => this.mapDevice(x));
    } else {
      const output = await this.deviceRepository.find({
        relations: {
          action: true,
          selectedAction: { action: { device: true } },
          rpi: true,
        },
      });

      return output.map((x) => this.mapDevice(x));
    }
  }

  async findOne(id: number) {
    const output = await this.deviceRepository.findOne({
      where: { id },
      relations: {
        action: true,
        selectedAction: {
          action: {
            device: true,
          },
        },
        contactSensor: true,
        rpi: true,
      },
    });

    if (output === null) {
      throw new HttpException(
        `Contact sensor with id ${id} is not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return this.mapDevice(output);
  }

  mapDevice(input: DeviceOrm) {
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

  async updateRpi(id: number, updateRpiDto: UpdateRpiDto) {
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

      await this.activityLogRepository.save({
        level: 'log',
        message: `${device.name} ${device.state}`,
      });
    }

    const saved = await this.deviceRepository.save(device);

    // Broadcast state change to all connected client
    this.eventEmitter.emit(WS_DEVICE, device);

    return saved;
  }

  async findAllAction() {
    const action = await this.actionRepository.find({
      relations: {
        device: true,
      },
    });

    return action.map((x) => {
      return new ActionEntity({
        id: x.id,
        key: x.key,
        value: x.value,
        name: x.device.name,
      });
    });
  }

  @OnEvent(EVENT_DEVICE_UPDATE_STATE)
  async onDeviceUpdateState(data: DeviceToggle) {
    this.updateState(data.deviceId, { state: data.state });
  }
}
