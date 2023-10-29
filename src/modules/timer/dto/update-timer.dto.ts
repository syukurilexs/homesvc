import { PartialType } from '@nestjs/swagger';
import { CreateTimerDto } from './create-timer.dto';

export class UpdateTimerDto extends PartialType(CreateTimerDto) {}
