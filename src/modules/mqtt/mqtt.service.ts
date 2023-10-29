import { EventEmitter2 } from '@nestjs/event-emitter';
import { MQTT_CLIENT_INSTANCE } from '../../utils/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Client } from 'mqtt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';

@Injectable()
export class MqttService {
  logger = new Logger(MqttService.name);

  constructor(
    @Inject(MQTT_CLIENT_INSTANCE) private readonly mqttClient: Client,
    @InjectRepository(DeviceOrm) private deviceRepo: Repository<DeviceOrm>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  publish(topic: string, message: string) {
    this.mqttClient.publish(topic, message);
  }

  subscribe(topic: string) {
    this.mqttClient.subscribe(topic, (err: Error, msg: any) => {
      if (err) {
        this.logger.error(err);
      } else {
        this.logger.log(msg);
      }
    });
  }

  onSwitch() {
    const switch$ = new Observable<{ topic: string; payload: string }>(
      (subscribe) => {
        this.mqttClient.on('message', (topic: string, payload: Buffer) => {
          /**
           * Sending to switch if prefix suis (ignore case)
           */
          const regex = new RegExp(/suis/, 'i');
          if (regex.test(topic)) {
            subscribe.next({
              topic,
              payload: payload.toString(),
            });
          }
        });
      }
    );

    return switch$;
  }
}
