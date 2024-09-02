import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { SuisOrm } from './suis.entity';
import { FanOrm } from './fan.entity';
import { LightOrm } from './light.entity';
import { SceneOrm } from './scene.entity';

@Entity()
export class ActionOrm extends AbstractEntity {
  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => SuisOrm, (suis) => suis.actions, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  suis: SuisOrm;

  @ManyToMany(() => FanOrm, (fan) => fan.actions, { onDelete: 'CASCADE' })
  fans: FanOrm[];

  @ManyToMany(() => LightOrm, (light) => light.actions, { onDelete: 'CASCADE' })
  lights: LightOrm[];

  @ManyToMany(() => SceneOrm, (scene) => scene.actions, { onDelete: 'CASCADE' })
  scenes: SceneOrm[];
}
