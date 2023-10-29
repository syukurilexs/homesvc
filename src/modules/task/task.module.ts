import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerOrm } from 'src/typeorm/timer.entity';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([TimerOrm])],
  providers: [TaskService],
})
export class TaskModule {}
