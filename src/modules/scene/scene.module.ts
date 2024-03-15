import { SceneOrm } from '../../typeorm/scene.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SceneService } from './scene.service';
import { SceneController } from './scene.controller';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SceneDeviceOrm } from 'src/typeorm/scene-device.entity';
import { SceneActionOrm } from 'src/typeorm/scene-action.entity';
import { ActionOrm } from 'src/typeorm/action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SceneOrm, DeviceOrm, SceneDeviceOrm, SceneActionOrm, ActionOrm])],
  controllers: [SceneController],
  providers: [SceneService],
})
export class SceneModule { }
