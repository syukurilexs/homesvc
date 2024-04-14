import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceOrm } from './device.entity';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class GroupOrm extends AbstractEntity {
  @Column()
  name: string;

  @ManyToMany(() => DeviceOrm)
  @JoinTable()
  devices: DeviceOrm[];
}
