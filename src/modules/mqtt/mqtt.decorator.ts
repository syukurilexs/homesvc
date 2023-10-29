import { SetMetadata } from '@nestjs/common';
import { MQTT_SUBSCRIBE_OPTIONS } from 'src/utils/constants';

export function Subscribe(topic: string) {
  return SetMetadata(MQTT_SUBSCRIBE_OPTIONS, topic);
}
