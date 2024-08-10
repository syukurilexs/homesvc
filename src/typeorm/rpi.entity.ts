import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { DeviceOrm } from './device.entity';

@Entity()
export class RpiOrm extends AbstractEntity {
  @Column()
  on: string;

  @Column()
  off: string;

  @JoinColumn()
  @OneToOne(() => DeviceOrm, (device) => device.contactSensor, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  device: DeviceOrm;
}
