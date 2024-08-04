import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class Device {
  createdAt: Date;
  updatedAt: Date;
  id: number;
  name: string;
  type: string;
  state: string;
  topic: string;
  remark: string;
}

export class Action {
  createdAt: string;
  updatedAt: string;
  id: number;
  key: string;
  value: string;
  device: Device;
}

export class SceneAction {
  createdAt: Date;
  updatedAt: Date;
  sceneId: number;
  actionId: number;

  @Type(() => Action)
  action: Action;
}

@Exclude()
export class SceneDevice {
  sceneId: number;
  deviceId: number;

  @Expose()
  state: string;

  createdAt: string;
  updatedAt: string;

  @Expose()
  @Type(() => Device)
  device: Device;
}

export class Scene {
  createdAt: Date;
  updatedAt: Date;
  id: number;
  name: string;

  @Type(() => SceneDevice)
  sceneDevice: SceneDevice[];

  @Expose({ name: 'actions' })
  @Type(() => SceneAction)
  @Transform((sceneDevice) => {
    return sceneDevice.value.map((x) => x.action);
  })
  sceneAction: Action[];

  constructor(obj: any) {
    Object.assign(this, obj);
  }
}
