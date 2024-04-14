import { State } from 'src/commons/enums/state.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceOrm } from './device.entity';
import { SceneOrm } from './scene.entity';

@Entity()
export class SceneDeviceOrm {
  @PrimaryColumn()
  sceneId: number;

  @PrimaryColumn()
  deviceId: number;

  @Column({
    type: 'simple-enum',
    enum: State,
    default: State.Off,
  })
  state: State;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne((type) => SceneOrm, (sceneOrm) => sceneOrm.sceneDevice, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  scene: SceneOrm;

  @ManyToOne((type) => DeviceOrm, (deviceOrm) => deviceOrm.sceneDevice, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  device: DeviceOrm;
}
