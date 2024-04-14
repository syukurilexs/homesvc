import { CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export class AbstractDateEntity {

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

export class AbstractEntity extends AbstractDateEntity {
  @PrimaryGeneratedColumn()
  public id: number;

}