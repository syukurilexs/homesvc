import { IsNotEmpty } from 'class-validator';

export class CreateActuatorDto {
  @IsNotEmpty()
  name: string = 'Lampu haha';

  @IsNotEmpty()
  topic: string;

  key: string;

  @IsNotEmpty()
  on: string;

  @IsNotEmpty()
  off: string;

  remark: string;
}
