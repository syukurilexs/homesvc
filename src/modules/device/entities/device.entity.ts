export class DeviceEntity {
  id: number;
  name: string;
  type: number;
  state: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  suis: any;
  action: Action;

  deviceAction: DeviceAction[];

  constructor(partial: Partial<DeviceEntity>) {
    Object.assign(this, partial);
  }
}

export interface Action {
  id: number;
  key: string;
  value: string;
}

export interface DeviceAction {
  id: number;
  name: string;
  type: number;
  state: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}
