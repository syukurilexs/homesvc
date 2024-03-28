import {
  MQTT_CLIENT_INSTANCE,
  MQTT_SUBSCRIBE_OPTIONS,
} from '../../utils/constants';
import { Inject, OnModuleInit, Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MqttClient } from 'mqtt';

@Injectable()
export class MqttExplorer implements OnModuleInit {
  logger: Logger = new Logger(MqttExplorer.name);

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    @Inject(MQTT_CLIENT_INSTANCE) private readonly client: MqttClient
  ) {}

  onModuleInit() {
    this.logger.log('MqttModule dependencies initialized');
    this.explore();
  }

  explore() {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();

    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance, name, metatype } = wrapper;
      if (!instance) {
        return;
      }

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key) => {
          const topic = this.reflector.get(
            MQTT_SUBSCRIBE_OPTIONS,
            instance[key]
          );
          if (topic) {
            console.log(Object.getPrototypeOf(instance));
            console.log(key);
            console.log(instance[key]);
            console.log('Topic: ' + topic);
          }
        }
      );
    });
  }

  onMessage() {
    console.log('call message')
    this.client.on(
      'message',
      (topic: string, payload: Buffer) => {
        console.log(topic + 'haha');
      }
    );
  }
}
