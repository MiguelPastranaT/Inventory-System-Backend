import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Lista explícita de orígenes permitidos
  const allowedOrigins = [
    'https://inventory-system-nine-tau.vercel.app',
    'http://localhost:5173',
    process.env.FRONTEND_URL?.replace(/\/$/, ''), // Elimina barra final si existe
  ].filter(Boolean) as string[];

app.enableCors({
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(origin.replace(/\/$/, ''))
    ) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Cookie',
    'X-Requested-With',
  ],
});
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend corriendo en puerto ${port}`);
}
bootstrap();