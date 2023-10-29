import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from 'src/utils/enums/device-type.enum';
import { ArrayNotEmpty } from 'class-validator';

export class CreateSwitchDto {
  name: string = 'SUIS01_Single';

  @ApiProperty({ enum: DeviceType, default: DeviceType.Light })
  type: DeviceType;

  topic: string;

  @ArrayNotEmpty()
  action: CreateSwitchActionDto[];

  remark: string;
}

export class CreateSwitchActionDto {
  id?: number;
  
  key: string;

  value: string;
}
