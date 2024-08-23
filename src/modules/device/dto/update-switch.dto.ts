import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateSwitchDto } from './create-switch.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSwitchDto extends PartialType(CreateSwitchDto) {
	action: UpdateSwitchActionDto[];
}

export class UpdateSwitchActionDto {
	@IsNumber()
  @IsOptional()
	id: number;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}