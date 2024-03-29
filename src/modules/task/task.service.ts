import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob, CronTime } from 'cron';
import { TimerOrm } from 'src/typeorm/timer.entity';
import {
  EVENT_TASK_ADD,
  EVENT_TASK_DELETE,
  EVENT_TASK_START,
  EVENT_TASK_STOP,
  EVENT_DEVICE_UPDATE_STATE,
  EVENT_TASK_UPDATE,
} from 'src/utils/constants';
import { Option } from 'src/utils/enums/option.enum';
import { DeviceToggle } from 'src/utils/types/device-toggle.type';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(TimerOrm) private timerRepository: Repository<TimerOrm>,
    private eventEmitter: EventEmitter2
  ) {
    this.onLoad();
  }

  
  /**
   * Returning all job in repository
   * @date 3/29/2024 - 11:48:39 AM
   *
   * @returns {*}
   */
  getAllJob() {
    return this.schedulerRegistry.getCronJobs();
  }

  private addCronJob(timer: TimerOrm) {
    const name = cronName(timer.id);
    const job = new CronJob(cronResource(timer.time), () => {
      this.logger.log(`time (${(new Date()).toLocaleTimeString()}) for job ${name} to run!`);

      // Send event to toggle the device (on/off)
      const data: DeviceToggle = {
        deviceId: timer.device.id,
        state: timer.state,
      };

      this.eventEmitter.emit(EVENT_DEVICE_UPDATE_STATE, data);
    });

    this.schedulerRegistry.addCronJob(name, job);
    this.logger.log(`job ${name} added for each day at ${timer.time}`);

    if (timer.option === Option.Enable) {
      this.logger.log(`Start job ${name}`)
      job.start();
    }

  }

  private deleteCron(id: number) {
    const name = cronName(id);

    this.schedulerRegistry.deleteCronJob(name);
    this.logger.warn(`job ${name} deleted!`);
  }

  private startCron(id: number) {
    const name = cronName(id);

    this.logger.log(`Start job for ${name}`);
    const job = this.schedulerRegistry.getCronJob(name);
    job.start();
  }

  private stopCron(id: number) {
    const name = cronName(id);

    this.logger.log(`Stop job for ${name}`);
    const job = this.schedulerRegistry.getCronJob(name);
    job.stop();
  }

  private onLoad() {
    this.timerRepository
      .find({
        relations: {
          device: true,
        },
      })
      .then((timers) => {
        timers.forEach((timer) => {
          this.addCronJob(timer);
        });
      });
  }

  private updateCronJob(id: number) {
    this.timerRepository.findOneBy({ id }).then(timer => {
      const job = this.schedulerRegistry.getCronJob(cronName(id));
      job.setTime(new CronTime(cronResource(timer.time)));
      this.logger.log(`The time set to ${timer.time} for job ${cronName(id)}`)
    })
  }

  @OnEvent(EVENT_TASK_DELETE)
  onDeleteTask(id: number) {
    this.deleteCron(id);
  }

  @OnEvent(EVENT_TASK_START)
  onStartTask(id: number) {
    this.startCron(id);
  }

  @OnEvent(EVENT_TASK_STOP)
  onStopTask(id: number) {
    this.stopCron(id);
  }

  @OnEvent(EVENT_TASK_ADD)
  onAddTask(timer: TimerOrm) {
    this.addCronJob(timer);
  }

  @OnEvent(EVENT_TASK_UPDATE)
  onUpdateTask(id: number) {
    this.updateCronJob(id);
  }
}

function cronName(id: number) {
  return 'cron_' + id;
}

function cronResource(datetime: string) {
  // Get Hour and Minute
  const regex = /^(\d{1,2}):(\d{1,2})\s(AM|PM)$/;

  const matches = datetime.match(regex);
  const hour = matches[1];
  const minute = matches[2];

  // Convert to system 24 hour
  const newHour =
    matches[3] === 'PM' ? (+hour + 12 === 24 ? 0 : +hour + 12) : +hour;

  return `0 ${minute} ${newHour} * * *`;
}
