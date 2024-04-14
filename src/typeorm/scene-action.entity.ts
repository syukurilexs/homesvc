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
import { AbstractEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class SceneActionOrm extends AbstractEntity {
  @ManyToOne(() => ActionOrm, { onDelete: 'CASCADE' })
  @JoinTable()
  action: ActionOrm;

  @ManyToOne(() => SceneOrm, { onDelete: 'CASCADE' })
  @JoinColumn()
  scene: SceneOrm;
}
