import { ActionOrm } from '../../typeorm/action.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { DeviceOrm } from 'src/typeorm/device.entity';
// import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { ContactSensorOrm } from 'src/typeorm/contact-sensor.entity';
import { RpiOrm } from 'src/typeorm/rpi.entity';
import { FanOrm } from 'src/typeorm/fan.entity';
import { LightOrm } from 'src/typeorm/light.entity';
import { SuisOrm } from 'src/typeorm/suis.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceOrm,
      ActionOrm,
      ActivityLogOrm,
      ContactSensorOrm,
      FanOrm,
      LightOrm,
      RpiOrm,
      SuisOrm,
    ]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
