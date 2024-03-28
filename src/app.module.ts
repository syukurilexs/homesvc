import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { hostname } from 'os';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeviceModule } from './modules/device/device.module';
import { GroupModule } from './modules/group/group.module';
import { MqttModule } from './modules/mqtt/mqtt.module';
import { SwitchModule } from './modules/switch/switch.module';
import { WsGatewayModule } from './modules/ws-gateway/ws-gateway.module';
import { SceneModule } from './modules/scene/scene.module';
import { TimerModule } from './modules/timer/timer.module';
import { TaskModule } from './modules/task/task.module';

@Module({
  imports: [
    DeviceModule,
    ConfigModule.forRoot({
      envFilePath: `config/.${process.env.NODE_ENV || 'production'}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/syukurilexsDB',
      entities: [__dirname + '/typeorm/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    MqttModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          host: config.get('MQTT_HOST'),
          port: 1883,
        };
      },
      inject: [ConfigService]
    }),
    GroupModule,
    SwitchModule,
    EventEmitterModule.forRoot(),
    WsGatewayModule,
    SceneModule,
    TimerModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
