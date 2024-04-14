import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { DeviceOrm } from './device.entity';
import { Option } from 'src/commons/enums/option.enum';
import { State } from 'src/commons/enums/state.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimerOrm extends AbstractEntity {
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
