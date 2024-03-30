import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ActivityLogOrm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: string;
}