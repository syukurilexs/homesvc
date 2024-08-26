import { SceneDeviceOrm } from './scene-device.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { ActionOrm } from './action.entity';

@Entity()
export class SceneOrm extends AbstractEntity {
  @Column()
  name: string;

  @OneToMany(() => SceneDeviceOrm, (sceneDevice) => sceneDevice.scene)
  sceneDevice: SceneDeviceOrm[];

  @ManyToMany(() => ActionOrm, (action) => action.scenes)
  @JoinTable()
  actions: ActionOrm[];
}
