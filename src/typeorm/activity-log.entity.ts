import { AbstractEntity } from "src/commons/entities/abscract.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ActivityLogOrm extends AbstractEntity {
  @Column()
  level: string;

  @Column()
  message: string;
}