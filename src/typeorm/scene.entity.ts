import { SceneDeviceOrm } from './scene-device.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeviceOrm } from './device.entity';

@Entity()
export class SceneOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @OneToMany((type) => SceneDeviceOrm, (sceneDevice) => sceneDevice.scene)
  sceneDevice: SceneDeviceOrm[];
}
