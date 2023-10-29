import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MqttService } from './mqtt.service';
import { MQTT_OPTION_PROVIDER } from 'src/utils/constants';
import { createClientProvider } from './client.provider';
import { MqttModuleAsyncOptions, MqttModuleOptions } from './mqtt.interface';
import { createLoggerProvider, createOptionProviders } from './logger.provider';
import { DeviceOrm } from 'src/typeorm/device.entity';

@Global()
@Module({
  imports: [DiscoveryModule, TypeOrmModule.forFeature([DeviceOrm])],
})
export class MqttModule {
  public static forRootAsync(options: MqttModuleAsyncOptions): DynamicModule {
    return {
      module: MqttModule,
      providers: [
        ...createOptionProviders(options),
        createLoggerProvider(options),
        createClientProvider(),
        MqttService,
      ],
      exports: [MqttService]
    };
  }

  public static forRoot(options: MqttModuleOptions): DynamicModule {
    return {
      module: MqttModule,
      providers: [
        {
          provide: MQTT_OPTION_PROVIDER,
          useValue: options,
        },
        createLoggerProvider(options),
        createClientProvider(),
        //MqttExplorer,
        MqttService,
      ],
      exports: [MqttService],
    };
  }
}
