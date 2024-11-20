import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('logout')
  handleLogout(@MessageBody() data: string): void {
    // Logic to handle logout event
    console.log('User logout event received:', data);
  }

  //delete delete account, update 修改密码, login 账号在其他设备登录
  notifyUserLogout(userId: string, message: string): void {
    this.server.emit('logout', { userId, message });
  }
}
