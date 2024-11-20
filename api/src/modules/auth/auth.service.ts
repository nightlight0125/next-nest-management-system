import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private redisClient: Redis;

  constructor(private userService: UserService) {
    const redisUrl = process.env.REDIS_URL;
    this.redisClient = new Redis(redisUrl); // Initialize ioredis client
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && password === user.password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN),
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN),
    });

    // Store both tokens in Redis
    await this.redisClient.set(
      `${user.id}:access`,
      accessToken,
      'EX',
      parseInt(process.env.JWT_EXPIRES_IN),
    ); // 1 hour
    await this.redisClient.set(
      `${user.id}:refresh`,
      refreshToken,
      'EX',
      process.env.JWT_REFRESH_EXPIRES_IN,
    ); // 7 days

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async validateToken(userId: string, token: string): Promise<boolean> {
    const storedToken = await this.redisClient.get(`${userId}:access`);
    return storedToken === token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;
      const storedRefreshToken = await this.redisClient.get(
        `${payload.sub}:refresh`,
      );

      if (storedRefreshToken !== refreshToken) {
        return null;
      }

      const newAccessToken = jwt.sign(
        { username: payload.username, sub: payload.sub },
        process.env.JWT_SECRET,
        { expiresIn: parseInt(process.env.JWT_EXPIRES_IN) },
      );
      await this.redisClient.set(
        `${payload.sub}:access`,
        newAccessToken,
        'EX',
        parseInt(process.env.JWT_EXPIRES_IN),
      );

      return newAccessToken;
    } catch (error) {
      return null;
    }
  }

  async revokeToken(userId: string, res: any): Promise<void> {
    await this.redisClient.del(`${userId}:access`);
    await this.redisClient.del(`${userId}:refresh`);
    // Clear cookies on the client side
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true, //only https
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true, //only https
    });
  }
}
