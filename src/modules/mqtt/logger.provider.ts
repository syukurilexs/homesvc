import { Provider, Logger } from '@nestjs/common';
import { MQTT_CLIENT_INSTANCE, MQTT_LOGGER_PROVIDER, MQTT_OPTION_PROVIDER } from 'src/utils/constants';
import { MqttModuleAsyncOptions, MqttModuleOptions, MqttOptionsFactory } from './mqtt.interface';

export function createLoggerProvider(
  options: MqttModuleOptions 
): Provider {
  if (!options.logger) {
    return {
      provide: MQTT_LOGGER_PROVIDER,
      useValue: new Logger('MqttModule'),
    };
  } else {
    if (options.logger.useClass) {
      return {
        provide: MQTT_LOGGER_PROVIDER,
        useClass: options.logger.useClass,
      };
    } else {
      return {
        provide: MQTT_LOGGER_PROVIDER,
        useValue: options.logger.useValue,
      };
    }
  }
}

export function createOptionsProvider(
  options: MqttModuleAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      provide: MQTT_OPTION_PROVIDER,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  if (options.useExisting) {
    return {
      provide: MQTT_OPTION_PROVIDER,
      useFactory: async (optionsFactory: MqttOptionsFactory) =>
        await optionsFactory.createMqttConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}

export function createOptionProviders(
  options: MqttModuleAsyncOptions,
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createOptionsProvider(options)];
  }
  return [
    {
      provide: MQTT_CLIENT_INSTANCE,
      useFactory: async (optionFactory: MqttOptionsFactory) =>
        await optionFactory.createMqttConnectOptions(),
      inject: [options.useClass],
    },
    {
      provide: options.useClass,
      useClass: options.useClass,
    },
  ];
}
