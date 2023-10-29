import { ActionOrm } from '../../typeorm/action.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { SelectedActionOrm } from 'src/typeorm/selected-action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceOrm, ActionOrm, SelectedActionOrm]),
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
