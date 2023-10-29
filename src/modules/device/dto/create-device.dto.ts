import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from 'src/utils/enums/device-type.enum';

export class CreateDeviceDto {
  @Optional()
  id: number;

  name: string = 'Lampu Dapur';

  @ApiProperty({ enum: DeviceType, default: DeviceType.Light })
  type: DeviceType;

  topic: string;

  remark: string;
}
