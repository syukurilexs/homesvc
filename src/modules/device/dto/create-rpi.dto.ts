import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DeviceType } from 'src/commons/enums/device-type.enum';

export class CreateRpiDto {
  @IsNotEmpty()
  name: string = 'Lampu haha';

  @IsNotEmpty()
  topic: string;

  @IsNotEmpty()
  on: string;

  @IsNotEmpty()
  off: string;

  remark: string;
}
