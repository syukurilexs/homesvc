import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';
import { TimerController } from './timer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimerOrm } from 'src/typeorm/timer.entity';
import { DeviceOrm } from 'src/typeorm/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimerOrm, DeviceOrm])],
  controllers: [TimerController],
  providers: [TimerService],
})
export class TimerModule {}
