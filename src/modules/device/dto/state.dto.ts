import { ApiProperty } from '@nestjs/swagger';
import { State } from 'src/utils/enums/state.enum';

export class UpdateStateDto {
  @ApiProperty({
    enum: State,
    default: State.Off,
  })
  state: State;
}
