import { CreateDeviceDto } from '../../device/dto/create-device.dto';

export class CreateSceneDto {
  name: string;

  data: SceneDataDto[];
}

export class SceneDataDto {
  device: CreateDeviceDto;

  status: boolean;
}
