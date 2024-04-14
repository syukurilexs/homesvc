import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeviceOrm } from './device.entity';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class ActionOrm extends AbstractEntity {
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
