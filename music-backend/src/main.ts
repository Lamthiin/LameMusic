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
    origin: [
      'https://lamemusic-1.onrender.com',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
