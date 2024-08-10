import { CreateRpiDto } from './create-rpi.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRpiDto extends PartialType(CreateRpiDto) {}
