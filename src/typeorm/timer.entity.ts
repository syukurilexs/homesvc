import { DeviceOrm } from './device.entity';
import { Option } from 'src/utils/enums/option.enum';
import { State } from 'src/utils/enums/state.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimerOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'simple-enum',
    enum: State,
    default: State.Off,
  })
  state: State;

  @Column({
    type: 'simple-enum',
    enum: Option,
    default: Option.Disable,
  })
  option: Option;

  @Column()
  time: string;

  @ManyToOne(() => DeviceOrm, (device) => device.timers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  device: DeviceOrm;
}
