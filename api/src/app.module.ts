import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { MenuModule } from './modules/menu/menu.module';
import { PrismaService } from './prisma/prisma.service';
import { RedisModule } from './redis/redis.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { RoleModule } from './modules/role/role.moudle';
import { UnitModule } from './modules/unit/unit.module';
import { PerformanceModule } from './modules/performance/performance.moudle';
import { SelfCheckedDepartmentModule } from './modules/self-checked-department/self-checked-department.module';

@Module({
  imports: [
    AuthModule,
    RedisModule,
    UnitModule,
    UserModule,
    RoleModule,
    MenuModule,
    PerformanceModule,
    SelfCheckedDepartmentModule,
  ],
  exports: [PrismaService],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/refresh-from-redis', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL }); // 应用到所有路由
  }
}
