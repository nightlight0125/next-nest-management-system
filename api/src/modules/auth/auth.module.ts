import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { EventsModule } from '../../events/events.module';
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) },
    }),
    EventsModule,
  ],
  providers: [AuthService, UserService, JwtAuthGuard, PrismaService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
