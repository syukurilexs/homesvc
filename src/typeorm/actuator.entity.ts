import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { DeviceOrm } from './device.entity';

@Entity()
export class ActuatorOrm extends AbstractEntity {
  @Column({default: ''})
  on: string;

  @Column({default: ''})
  off: string;

  @Column()
  topic: string;

  @JoinColumn()
  @OneToOne(() => DeviceOrm, (device) => device.actuator, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  device: DeviceOrm;
}
