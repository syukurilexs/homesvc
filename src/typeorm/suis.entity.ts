import { AbstractEntity } from 'src/commons/entities/abscract.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DeviceOrm } from './device.entity';
import { ActionOrm } from './action.entity';

@Entity()
export class SuisOrm extends AbstractEntity {
  @Column()
  topic: string;

  @JoinColumn()
  @OneToOne(() => DeviceOrm, (device) => device.suis, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  device: DeviceOrm;

  @OneToMany(() => ActionOrm, (action) => action.suis, {
    cascade: true,
  })
  actions: ActionOrm[];
}
