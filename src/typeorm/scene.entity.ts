import { SceneDeviceOrm } from './scene-device.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SceneActionOrm } from './scene-action.entity';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class SceneOrm extends AbstractEntity {
  @Column()
  name: string;

  @OneToMany((type) => SceneDeviceOrm, (sceneDevice) => sceneDevice.scene)
  sceneDevice: SceneDeviceOrm[];
  
  @OneToMany(
    () => SceneActionOrm,
    (sceneAction) => sceneAction.scene,
    {
      cascade: ['insert', 'update']
    }
  )
  sceneAction: SceneActionOrm[];
}
