import { MqttModule } from '../mqtt/mqtt.module';
import { Module } from '@nestjs/common';
import { SwitchService } from './switch.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';

@Module({
  imports: [
    MqttModule,
    TypeOrmModule.forFeature([DeviceOrm, SelectedActionOrm, SceneActionOrm, ActivityLogOrm])
  ],
  providers: [SwitchService]
})
export class SwitchModule { }
