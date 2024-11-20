import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe()); // 全局使用 ValidationPipe 进行数据验证
  app.use(cookieParser()); // Use cookie-parser middleware

  // Set Referrer-Policy header
  app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Set global prefix for all routes
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 配置 CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
    ],
    credentials: true, // 允许发送 cookie
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJs management system API')
    .setVersion('1.0')
    // .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  //http://localhost:8000/api/docs
  SwaggerModule.setup(`${globalPrefix}/docs`, app, documentFactory);
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
