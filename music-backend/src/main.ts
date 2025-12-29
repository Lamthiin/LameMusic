// music-backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  console.log('🔥🔥 BACKEND IS RUNNING (CORS OPEN) 🔥🔥');

  const app = await NestFactory.create(AppModule);

  // ✅ CORS – cho mọi frontend (Render, localhost, v.v.)
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // ✅ Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend listening on port ${port}`);
}

// ❗❗❗ BẮT BUỘC PHẢI CÓ
bootstrap();
