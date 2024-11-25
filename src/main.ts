import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as serverless from 'serverless-http';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Configuración global de CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders:
        'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-control-allow-credentials, Access-control-allow-headers, Access-control-allow-methods, Access-control-allow-origin, User-Agent, Referer, Accept-Encoding, Accept-Language, Access-Control-Request-Headers, Cache-Control, Pragma',
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

    // Convertimos la app NestJS a una función serverless
    const handler = serverless(app.getHttpAdapter().getInstance());

    // Exponemos la función handler para Vercel
    return handler;

  } catch (error) {
    console.error('Error en la inicialización de NestJS:', error);
    throw error;
  }
}

// Ejecutamos la aplicación como serverless
export const handler = bootstrap();
