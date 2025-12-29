// music-backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  console.log('🔥🔥 CORS VERSION 2 IS RUNNING 🔥🔥');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
 app.enableCors({
  origin: true,          // ⭐ CHO PHÉP MỌI ORIGIN
  credentials: true,     // ⭐ BẮT BUỘC nếu dùng Authorization
});


  await app.listen(process.env.PORT || 3000);
}
