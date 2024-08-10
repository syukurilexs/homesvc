import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ActivitylogService } from './activitylog.service';
import { ApiTags } from '@nestjs/swagger';
import { PageOptionsDto } from './dto/page-option.dto';
import { PageEntity } from './entities/page.entity';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';

@ApiTags('Activity Log')
@Controller('activitylog')
export class ActivitylogController {
  constructor(private readonly activitylogService: ActivitylogService) { }

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async getActivityLog(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageEntity<ActivityLogOrm>> {
    return this.activitylogService.findByPage(pageOptionsDto);
  }

  @Get('clear')
  clear() {
    return this.activitylogService.clear();
  }
}
