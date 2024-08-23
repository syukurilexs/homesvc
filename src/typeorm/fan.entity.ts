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
export class FanOrm extends AbstractEntity {
  @JoinColumn()
  @OneToOne(() => DeviceOrm, (device) => device.fan, {
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

  @ManyToMany(() => ActionOrm, (action) => action.fans, { cascade: true })
  @JoinTable()
  actions: ActionOrm[];
}
