import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { GroupOrm } from 'src/typeorm/group.entity';
import { In, Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupOrm) private groupRepository: Repository<GroupOrm>,
    @InjectRepository(DeviceOrm)
    private deviceRepository: Repository<DeviceOrm>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const devices = await this.deviceRepository.find({
      where: { id: In(createGroupDto.deviceIds) },
    });

    const group = this.groupRepository.create(instanceToPlain(createGroupDto));
    group.devices = devices;

    return this.groupRepository.save(group);
  }

  findAll() {
    return this.groupRepository.find({
      relations: {
        devices: true,
      },
    });
  }

  findOne(id: number) {
    return this.groupRepository.findOne({
      where: { id },
      relations: { devices: true },
    });
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.findOneBy({ id });

    const devices = await this.deviceRepository.find({
      where: {
        id: In(updateGroupDto.deviceIds),
      },
    });

    group.devices = devices;

    return this.groupRepository.save(group);
  }

  remove(id: number) {
    return this.groupRepository.delete(id);
  }
}
