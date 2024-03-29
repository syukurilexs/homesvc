import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerOrm } from 'src/typeorm/timer.entity';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimerOrm, DeviceOrm]), TaskModule],
  controllers: [TimerController],
  providers: [TimerService],
})
export class TimerModule { }
