import { CreateDeviceDto } from '../../device/dto/create-device.dto';

export class CreateSceneDto {
  name: string;
  devices: SceneDeviceDto[];
	actions: number[];
}

export class SceneDeviceDto {
  id: number;
  state: boolean;
}
