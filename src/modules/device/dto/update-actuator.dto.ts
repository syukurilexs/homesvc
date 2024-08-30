import { CreateActuatorDto } from './create-actuator.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateActuatorDto extends PartialType(CreateActuatorDto) {}
