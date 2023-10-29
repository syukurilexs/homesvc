import { Option } from 'src/utils/enums/option.enum';
import { State } from 'src/utils/enums/state.enum';

export class CreateTimerDto {
  deviceId: number;
  time: string;
  state: State;
  option: Option;
}
