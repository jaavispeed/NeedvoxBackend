import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de CORS
  app.enableCors({
    origin: '*', // Permite solicitudes desde este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Métodos permitidos
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization', // Encabezados permitidos
  });

  // Configuración global del prefijo de rutas
  app.setGlobalPrefix('api');

  // Configuración de ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(3000);
}
bootstrap();
