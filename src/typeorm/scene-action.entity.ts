import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActionOrm } from './action.entity';
import { SceneOrm } from './scene.entity';

@Entity()
export class SceneActionOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @ManyToOne(() => ActionOrm, { onDelete: 'CASCADE' })
  @JoinTable()
  action: ActionOrm;

  @ManyToOne(() => SceneOrm, { onDelete: 'CASCADE' })
  @JoinColumn()
  scene: SceneOrm;
}
