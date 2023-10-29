import { Injectable } from '@nestjs/common';
import { CreateTimerDto } from './dto/create-timer.dto';
import { UpdateTimerDto } from './dto/update-timer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TimerOrm } from 'src/typeorm/timer.entity';
import { Repository } from 'typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EVENT_TASK_ADD,
  EVENT_TASK_DELETE,
  EVENT_TASK_START,
  EVENT_TASK_STOP,
} from 'src/utils/constants';
import { Option } from 'src/utils/enums/option.enum';

@Injectable()
export class TimerService {
  constructor(
    @InjectRepository(TimerOrm) private timerRepository: Repository<TimerOrm>,
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * To create a timer and then run cronjob if task
   * is enabled
   * @param createTimerDto DTO for input payload
   * @returns Created timer
   */
  async create(createTimerDto: CreateTimerDto) {
    const device = await this.deviceRepository.findOne({
      where: {
        id: createTimerDto.deviceId,
      },
      relations: {
        timers: true,
      },
    });

    const timer = this.timerRepository.create({
      option: createTimerDto.option,
      state: createTimerDto.state,
      time: createTimerDto.time,
    });

    const savedTimer = await this.timerRepository.save(timer);

    device.timers.push(savedTimer);

    const saved = await this.deviceRepository.save(device);

    // Cannot use savedTimer as input for EVENT_TASK_ADD 
    // becuase newTimer still don't have the device. Have to query
    // with relationship
    const newTimer = await this.timerRepository.findOne({
      where: { id: savedTimer.id },
      relations: { device: true },
    });

    this.eventEmitter.emit(EVENT_TASK_ADD, newTimer);

    return saved;
  }

  async findAll() {
    const devices = await this.deviceRepository.find({
      relations: {
        timers: true,
      },
    });

    return devices.filter((device) => device.timers.length > 0);
  }

  /**
   * Return timer by id
   * @param id Timer id
   * @returns Timer
   */
  findOne(id: number) {
    return this.timerRepository.findOneBy({ id });
  }

  async update(id: number, updateTimerDto: UpdateTimerDto) {
    const timer = await this.timerRepository.findOne({
      where: {
        id,
      },
    });

    if (updateTimerDto.option) {
      timer.option = updateTimerDto.option;
    }

    if (updateTimerDto.state) {
      timer.state = updateTimerDto.state;
    }

    if (updateTimerDto.time) {
      timer.time = updateTimerDto.time
    }

    return this.timerRepository.save(timer);
  }

  async updateOption(id: number, updateTimerDto: UpdateTimerDto) {
    const timer = await this.timerRepository.findOne({
      where: {
        id,
      },
    });

    if (updateTimerDto.option) {
      timer.option = updateTimerDto.option;
    }

    const saved = await this.timerRepository.save(timer);

    if (updateTimerDto.option === Option.Enable) {
      this.eventEmitter.emit(EVENT_TASK_START, id);
    } else {
      this.eventEmitter.emit(EVENT_TASK_STOP, id);
    }

    return saved;
  }

  async remove(id: number) {
    const deleted = await this.timerRepository.delete(id);

    this.eventEmitter.emit(EVENT_TASK_DELETE, id);

    return deleted;
  }
}
