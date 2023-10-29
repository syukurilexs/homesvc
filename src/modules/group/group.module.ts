import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupOrm } from 'src/typeorm/group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupOrm, DeviceOrm])],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
