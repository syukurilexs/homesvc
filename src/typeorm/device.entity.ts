import { ActionOrm } from './action.entity';
import { DeviceType } from 'src/commons/enums/device-type.enum';
import { State } from 'src/commons/enums/state.enum';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { SceneDeviceOrm } from './scene-device.entity';
import { TimerOrm } from './timer.entity';
import { ContactSensorOrm } from './contact-sensor.entity';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { RpiOrm } from './rpi.entity';
import { FanOrm } from './fan.entity';
import { LightOrm } from './light.entity';
import { SuisOrm } from './suis.entity';

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

  @Column({ default: '' })
  remark: string;

  @OneToMany(() => SceneDeviceOrm, (sceneDevice) => sceneDevice.device)
  sceneDevice: SceneDeviceOrm[];

  @OneToMany(() => TimerOrm, (timer) => timer.device, {
    cascade: ['insert', 'update'],
  })
  timers: TimerOrm[];

  @OneToOne(() => ContactSensorOrm, (contactSensor) => contactSensor.device, {
    cascade: ['insert', 'update'],
  })
  contactSensor: ContactSensorOrm;

  @OneToOne(() => FanOrm, (fan) => fan.device, {
    cascade: ['insert', 'update'],
  })
  fan: FanOrm;

  @OneToOne(() => LightOrm, (light) => light.device, {
    cascade: ['insert', 'update'],
  })
  light: LightOrm;

  @OneToOne(() => SuisOrm, (suis) => suis.device, {
    cascade: ['insert', 'update'],
  })
  suis: SuisOrm;

  @OneToOne(() => RpiOrm, (rpi) => rpi.device, {
    cascade: ['insert', 'update'],
  })
  rpi: RpiOrm;

}
