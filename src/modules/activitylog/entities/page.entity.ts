import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { PageMetaEntity } from "./page-meta.entity";

export class PageEntity<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaEntity })
  readonly meta: PageMetaEntity;

  constructor(data: T[], meta: PageMetaEntity) {
    this.data = data;
    this.meta = meta;
  }
}