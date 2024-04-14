import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { WsGatewayService } from './ws-gateway.service';
import { Socket, Server } from 'socket.io';
import { Device } from 'src/commons/types/device.type';
import { WS_DEVICE } from 'src/utils/constants';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WsGatewayGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  logger: Logger = new Logger(WsGatewayGateway.name);
  server: Server;

  constructor(private readonly wsGatewayService: WsGatewayService) {}
  afterInit(server: Server) {
    this.logger.log('Socket.Io Initialized');
    this.server = server;
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ' + client.id);
  }

  @OnEvent(WS_DEVICE)
  deviceEvent(payload: any) {
    this.server.emit('state.change', payload);
  }

  @SubscribeMessage('state.change')
  handleMessage(client: Socket, data: Device) {
    client.broadcast.emit('state.change', data);
  }
}
