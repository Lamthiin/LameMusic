// music-backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  Logger.log('=== BOOTSTRAP START ===');
  Logger.log(`DB_HOST=${process.env.DB_HOST}`);
  Logger.log(`DB_PORT=${process.env.DB_PORT}`);
  Logger.log(`DB_USER=${process.env.DB_USER}`);
  Logger.log(`DB_NAME=${process.env.DB_NAME}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);



  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Serve static media
  const frontendPublicPath = join(
    __dirname,
    '..',
    '..',
    'music-frontend',
    'public',
  );

  app.useStaticAssets(frontendPublicPath, {
    prefix: '/media',
    setHeaders: (res, path) => {
      if (path.endsWith('.mp3') || path.endsWith('.m4a')) {
        res.set('Content-Type', 'audio/mpeg');
      }
    },
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 Server running on port ${port}`);
}

bootstrap();
