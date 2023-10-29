import { State } from 'src/utils/enums/state.enum';

export class UpdateStateSceneDto {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  sceneDevice: SceneDeviceDto[];
}

export class SceneDeviceDto {
  sceneId: number;
  deviceId: number;
  state: State;
  createdAt: string;
  updatedAt: string;
}
