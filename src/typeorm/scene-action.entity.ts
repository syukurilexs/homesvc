import {
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ActionOrm } from './action.entity';
import { SceneOrm } from './scene.entity';
import { AbstractDateEntity } from 'src/commons/entities/abscract.entity';

@Entity()
export class SceneActionOrm extends AbstractDateEntity {
  @PrimaryColumn()
  sceneId: number;

  @PrimaryColumn()
  actionId: number;

  @ManyToOne(() => ActionOrm, { onDelete: 'CASCADE' })
  @JoinTable()
  action: ActionOrm;

  @ManyToOne(() => SceneOrm, { onDelete: 'CASCADE' })
  @JoinColumn()
  scene: SceneOrm;
}
