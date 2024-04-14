import { Option } from 'src/commons/enums/option.enum';
import { State } from 'src/commons/enums/state.enum';

export class CreateTimerDto {
  deviceId: number;
  time: string;
  state: State;
  option: Option;
}
