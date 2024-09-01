import { EventEmitter2 } from '@nestjs/event-emitter';
import { MQTT_CLIENT_INSTANCE } from '../../utils/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MqttClient } from 'mqtt';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceOrm } from 'src/typeorm/device.entity';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';

@Injectable()
export class MqttService {
  logger = new Logger(MqttService.name);

  constructor(
    @Inject(MQTT_CLIENT_INSTANCE) private readonly mqttClient: MqttClient,
    @InjectRepository(DeviceOrm) private deviceRepo: Repository<DeviceOrm>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  publish(topic: string, message: string | Record<string, string>) {
    let output: string;
    if (typeof message === 'object') {
      output = JSON.stringify(message);
    } else {
      output = message;
    }

    this.mqttClient.publish(topic, output);
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
      },
    );

    return switch$;
  }

  /**
   * An Observable to receive data from mqtt specifically
   * for contact sensor
   * @date 3/31/2024 - 8:25:19 AM
   *
   * @returns {*}
   */
  onContactSensor() {
    const contactSensor = new Observable<{ topic: string; payload: string }>(
      (subscribe) => {
        this.mqttClient.on('message', (topic: string, payload: Buffer) => {
          /**
           * Sending to contact sensor if prefix suis (ignore case)
           */
          const regex = new RegExp(/contact/, 'i');
          if (regex.test(topic)) {
            subscribe.next({
              topic,
              payload: payload.toString(),
            });
          }
        });
      },
    );

    return contactSensor;
  }
}
