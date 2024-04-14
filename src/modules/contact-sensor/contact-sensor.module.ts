import { Module } from '@nestjs/common';
import { ContactSensorService } from './contact-sensor.service';
import { MqttModule } from '../mqtt/mqtt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';

@Module({
  imports: [MqttModule, TypeOrmModule.forFeature([DeviceOrm])],
  providers: [ContactSensorService]
})
export class ContactSensorModule { }
