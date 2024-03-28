import { MqttModule } from '../mqtt/mqtt.module';
import { Module } from '@nestjs/common';
import { SwitchService } from './switch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';

@Module({
  imports: [MqttModule, TypeOrmModule.forFeature([DeviceOrm, SelectedActionOrm, SceneActionOrm])],
  providers: [SwitchService]
})
export class SwitchModule { }
