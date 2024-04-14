import { DeviceType } from '../../commons/enums/device-type.enum';

export type Device = {
  id: number;
  name: string;
  type: DeviceType;
  state: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
  suis?: Suis;
  deviceAction: DeviceAction[];
  action?: Action;
};

export type Suis = {
  id: number;
  name: string;
  type: number;
  state: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceAction = {
  id: number;
  name: string;
  type: number;
  state: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
};

export type Action = {
  id: number;
  key: string;
  value: string;
};
