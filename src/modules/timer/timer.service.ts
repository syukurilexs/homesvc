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
  EVENT_TASK_UPDATE,
} from 'src/utils/constants';
import { Option } from 'src/commons/enums/option.enum';
import { TaskService } from '../task/task.service';
import { stringify } from 'querystring';
import { JobEntity } from './entities/job.entity';

@Injectable()
export class TimerService {
  constructor(
    @InjectRepository(TimerOrm) private timerRepository: Repository<TimerOrm>,
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
    private readonly eventEmitter: EventEmitter2,
    private readonly taskService: TaskService,
  ) {}

  /**
   * Get all job from repository and attachs timer information
   * @date 3/29/2024 - 11:49:14 AM
   *
   * @async
   * @returns {unknown}
   */
  async getActiveJob() {
    // Get all jobs
    const jobs = this.taskService.getAllJob();

    const newJobs: JobEntity[] = [];

    // Formating the job and include timer information
    for (let [key, value] of jobs) {
      let last = 'Cannot get date',
        next = 'Cannot get date';

      try {
        next = value.nextDate().toJSDate().toString();
      } catch (error) {
        // use default value
      }

      try {
        last = value.lastDate().toString();
      } catch (error) {
        // use default value
      }

      const timer = await this.timerRepository.findOne({
        where: {
          id: (() => Number(key.replace('cron_', '')))(),
        },
        relations: {
          device: true,
        },
      });

      newJobs.push({
        name: key,
        nextrun: next,
        lastrun: last,
        device: timer.device.name,
        state: timer.state,
        status: timer.option,
      });
    }

    return newJobs;
  }

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
    return this.timerRepository.findOne({
      where: { id },
      relations: {
        device: true,
      },
    });
  }

  /**
   * Updating the time for the timer
   * @date 3/29/2024 - 8:49:40 AM
   *
   * @async
   * @param {number} id
   * @param {UpdateTimerDto} updateTimerDto
   * @returns {Promise<TimerOrm>}
   */
  async update(id: number, updateTimerDto: UpdateTimerDto): Promise<TimerOrm> {
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
      timer.time = updateTimerDto.time;
    }

    const newtimer = await this.timerRepository.save(timer);

    this.eventEmitter.emit(EVENT_TASK_UPDATE, id);

    return newtimer;
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
