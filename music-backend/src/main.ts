// music-backend/src/main.ts (BẢN SỬA LỖI FINAL)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import { NestExpressApplication } from '@nestjs/platform-express'; 
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

dotenvConfig({ path: join(process.cwd(), '.env') });

import * as express from 'express'; 
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // (1) Cấu hình CORS chung (Cho API VÀ FILE TĨNH)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  // Áp dụng ValidationPipe toàn cục
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true 
  }));

  // (2) Cấu hình phục vụ file tĩnh
  const frontendPublicPath = join(__dirname, '..', '..', 'music-frontend', 'public');

  app.useStaticAssets(frontendPublicPath, {
    prefix: '/media', 
    // cors: true, // <-- XÓA DÒNG NÀY (BỊ LỖI)
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.mp3') || path.endsWith('.m4a')) {
            res.set('Content-Type', 'audio/mpeg');
        }
    },
  });
  
  // (Cấu hình uploads)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads', 
    // cors: true, // <-- XÓA DÒNG NÀY (BỊ LỖI)
  });

  await app.listen(3000);
}
bootstrap();