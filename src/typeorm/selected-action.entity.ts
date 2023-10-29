import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActionOrm } from './action.entity';
import { DeviceOrm } from './device.entity';

@Entity()
export class SelectedActionOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => ActionOrm, { onDelete: 'CASCADE' })
  @JoinTable()
  action: ActionOrm;

  @ManyToOne(() => DeviceOrm, { onDelete: 'CASCADE' })
  @JoinColumn()
  device: DeviceOrm;
}
