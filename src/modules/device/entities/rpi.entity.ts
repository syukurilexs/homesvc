import { State } from 'src/commons/enums/state.enum';
import { DeviceEntity } from './device.entity';

export class RpiEntity extends DeviceEntity {
  on: string;
  off: string;

  constructor(partial: Partial<RpiEntity>) {
    super();
    Object.assign(this, partial);
  }
}