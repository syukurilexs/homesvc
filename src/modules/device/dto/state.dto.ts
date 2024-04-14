import { ApiProperty } from '@nestjs/swagger';
import { State } from 'src/commons/enums/state.enum';

export class UpdateStateDto {
  @ApiProperty({
    enum: State,
    default: State.Off,
  })
  state: State;
}
