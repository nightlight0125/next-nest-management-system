import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
