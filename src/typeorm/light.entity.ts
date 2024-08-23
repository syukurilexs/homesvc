import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { DeviceOrm } from './device.entity';
import { State } from 'src/commons/enums/state.enum';
import { ActionOrm } from './action.entity';

@Entity()
export class LightOrm extends AbstractEntity {
  @JoinColumn()
  @OneToOne(() => DeviceOrm, (device) => device.light, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  device: DeviceOrm;

  @Column({
    type: 'simple-enum',
    enum: State,
    default: State.Off,
  })
  state: State;

  @Column({ default: '' })
  topic: string;

  @ManyToMany(() => ActionOrm, (action) => action.lights, { cascade: true })
  @JoinTable()
  actions: ActionOrm[];
}