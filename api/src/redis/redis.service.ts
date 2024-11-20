// redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    this.client = new Redis(redisUrl);
    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
    this.client.on('error', (err) => {
      console.error('Redis error', err);
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  // Example method to set a key-value pair
  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  // Example method to get a value by key
  async get(key: string): Promise<string> {
    return this.client.get(key);
  }
}
