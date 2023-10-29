import { CreateSwitchDto } from './create-switch.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateSwitchDto extends PartialType(CreateSwitchDto) {}
