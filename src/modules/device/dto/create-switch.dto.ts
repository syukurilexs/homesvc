import { ArrayNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator';

export class CreateSwitchDto {
  @IsString()
  @IsNotEmpty()
  name: string = 'SUIS01_Single';

  @IsString()
  @IsNotEmpty()
  topic: string;

  @ArrayNotEmpty()
  action: CreateSwitchActionDto[];

  remark: string;
}

export class CreateSwitchActionDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}
