import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de CORS
app.enableCors({
  origin: '*',  // Cambia esto por el dominio de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Métodos permitidos
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-Control-Allow-Credentials, Authorization',
  credentials: true,  // Habilita el envío de cookies si es necesario
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

