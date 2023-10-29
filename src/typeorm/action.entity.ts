import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceOrm } from './device.entity';

@Entity()
export class ActionOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => DeviceOrm, (device) => device.action, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  device: DeviceOrm;
}
