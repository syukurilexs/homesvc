import { ActionOrm } from './action.entity';
import { DeviceType } from 'src/utils/enums/device-type.enum';
import { State } from 'src/utils/enums/state.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SceneDeviceOrm } from './scene-device.entity';
import { TimerOrm } from './timer.entity';
import { SelectedActionOrm } from './selected-action.entity';

@Entity()
export class DeviceOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: DeviceType,
    default: DeviceType.Light,
  })
  type: DeviceType;

  @Column({
    type: 'simple-enum',
    enum: State,
    default: State.Off,
  })
  state: State;

  @Column({ default: '' })
  topic: string;

  @OneToMany(() => ActionOrm, (switchInfoOrm) => switchInfoOrm.device, {
    cascade: ['update', 'insert'],
  })
  action: ActionOrm[];

  @OneToMany(() => SceneDeviceOrm, (sceneDevice) => sceneDevice.device)
  sceneDevice: SceneDeviceOrm[];

  @OneToMany(() => TimerOrm, (timer) => timer.device, {
    cascade: ['insert', 'update'],
  })
  timers: TimerOrm[];

  @OneToMany(
    () => SelectedActionOrm,
    (selectedAction) => selectedAction.device,
    {
      cascade: ['insert', 'update'],
    }
  )
  selectedAction: SelectedActionOrm[];

  @Column({default: ''})
  remark: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;
}
