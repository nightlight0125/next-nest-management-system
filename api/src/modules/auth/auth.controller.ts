import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EventsGateway } from '../../events/events.gateway';
import * as jwt from 'jsonwebtoken';
import { LoginDto } from './DTO/login.dto';
import { RegisterDto } from './DTO/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private eventsGateway: EventsGateway,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.userService.register(body);
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 201, description: 'User successfully logged in.' })
  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }

    await this.eventsGateway.notifyUserLogout(user.id, 'login');

    const tokens = await this.authService.login(user);

    // 设置 HTTP-Only Cookies
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, //only https
      maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 1000, // 以毫秒为单位
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, //only https
      maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 1000,
    });

    return res.status(HttpStatus.OK).json({ data: user });
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'Access token successfully refreshed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token.',
  })
  @Post('refresh-from-redis')
  async refreshTokenFromRedis(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    //refresh token not found, return -2
    if (!refreshToken) {
      return res.status(-2).json({ message: 'Refresh token not found' });
    }

    // Retrieve the refresh token from Redis
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      //invalid or expired refresh token, return -2
      return res
        .status(-2)
        .json({ message: 'Invalid or expired refresh token' });
    }

    // 设置 HTTP-Only Cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true, //only https
      maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 1000, // 以毫秒为单位
    });

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Access token refreshed' });
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out.' })
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies['access_token'];
    if (!accessToken) {
      // If no access token is found, still return a success message
      return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;
      //
      await this.authService.revokeToken(decoded.sub as string, res);
    } catch (error) {
      if (error.name !== 'TokenExpiredError') {
        // If the error is not due to token expiration, handle it
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }
      // If the token is expired, proceed with logout
    }

    return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
  }

  @ApiOperation({ summary: 'Check if access token cookie exists' })
  @ApiResponse({ status: 200, description: 'Access token exists.' })
  @ApiResponse({ status: 401, description: 'Access token not found.' })
  @Get('check-cookie')
  async checkCookie(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies['access_token'];
    if (accessToken) {
      return res.status(HttpStatus.OK).json({ message: 'Access token exists' });
    } else {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Access token not found' });
    }
  }
}
