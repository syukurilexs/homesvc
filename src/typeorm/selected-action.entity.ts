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
import { AbstractEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class SelectedActionOrm extends AbstractEntity {
  
  @ManyToOne(() => ActionOrm, { onDelete: 'CASCADE' })
  @JoinTable()
  action: ActionOrm;

  @ManyToOne(() => DeviceOrm, { onDelete: 'CASCADE' })
  @JoinColumn()
  device: DeviceOrm;
}
