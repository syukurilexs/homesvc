import { Module } from '@nestjs/common';
import { ActivitylogService } from './activitylog.service';
import { ActivitylogController } from './activitylog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLogOrm])],
  controllers: [ActivitylogController],
  providers: [ActivitylogService],
})
export class ActivitylogModule { }
