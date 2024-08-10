import { ActionOrm } from './action.entity';
import { DeviceType } from 'src/commons/enums/device-type.enum';
import { State } from 'src/commons/enums/state.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SceneDeviceOrm } from './scene-device.entity';
import { TimerOrm } from './timer.entity';
import { SelectedActionOrm } from './selected-action.entity';
import { ContactSensorOrm } from './contact-sensor.entity';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { RpiOrm } from './rpi.entity';

@Entity()
export class DeviceOrm extends AbstractEntity {
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
    },
  )
  selectedAction: SelectedActionOrm[];

  @OneToOne(() => ContactSensorOrm, (contactSensor) => contactSensor.device, {
    cascade: ['insert', 'update'],
  })
  contactSensor: ContactSensorOrm;

  @OneToOne(() => RpiOrm, (rpi) => rpi.device, {
    cascade: ['insert', 'update'],
  })
  rpi: RpiOrm;

  @Column({ default: '' })
  remark: string;
}
