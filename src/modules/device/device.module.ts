import { ActionOrm } from '../../typeorm/action.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { ContactSensorOrm } from 'src/typeorm/contact-sensor.entity';
import { RpiOrm } from 'src/typeorm/rpi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceOrm,
      ActionOrm,
      SelectedActionOrm,
      ActivityLogOrm,
      ContactSensorOrm,
      RpiOrm
    ]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule { }
