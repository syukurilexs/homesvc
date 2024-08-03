import { CreateDeviceDto } from '../../device/dto/create-device.dto';

class DeviceDto extends CreateDeviceDto {
  id: number;
}

export class CreateGroupDto {
  name: string = 'My Group';
  deviceIds: number[];
}
