import { CreateDeviceCommonDto } from './create-device-common.dto';

export class CreateFanDto extends CreateDeviceCommonDto {
  actions: number[];
  topic: string;
  actuator: number;
}
