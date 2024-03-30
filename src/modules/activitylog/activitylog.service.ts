import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogOrm } from 'src/typeorm/activity-log.entity';
import { Repository } from 'typeorm';
import { PageOptionsDto } from './dto/page-option.dto';
import { PageEntity } from './entities/page.entity';
import { PageMetaEntity } from './entities/page-meta.entity';

@Injectable()
export class ActivitylogService {

  constructor(
    @InjectRepository(ActivityLogOrm) private activityLogRepository: Repository<ActivityLogOrm>
  ) { }

  
  /**
   * Get activity log using pagination concept
   * @date 3/30/2024 - 9:04:23 AM
   *
   * @async
   * @param {PageOptionsDto} pageOptionsDto
   * @returns {unknown}
   */
  async findByPage(pageOptionsDto: PageOptionsDto) {
    console.log(pageOptionsDto.skip)
    const entities = await this.activityLogRepository.find({
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
      order: {
        id: pageOptionsDto.order
      }
    });

    const itemCount = await this.activityLogRepository.count();
    const pageMetaDto = new PageMetaEntity({ itemCount, pageOptionsDto });

    return new PageEntity(entities, pageMetaDto);
  }
}
