import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const frontendUrl =
    process.env.FRONTEND_URL ??
    'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const port =
    Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');
}

bootstrap();