import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {} // Inject AuthService

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['access_token']; // 从 Cookie 中获取 access_token
    if (!token) {
      throw new HttpException(
        'Access token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });

      const isValid = await this.authService.validateToken(
        decoded.sub as string,
        token,
      ); // Use validateToken method

      if (!isValid) {
        // Optionally revoke the token and clear cookies
        await this.authService.revokeToken(decoded.sub as string, res);
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      req['user'] = decoded; // 将解码后的用户信息附加到请求对象上
      next();
    } catch (err) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
