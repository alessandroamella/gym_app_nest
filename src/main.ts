import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { urlencoded, json } from 'express';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { Logger } from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);

  const HOST = configService.get<string>('HOST');
  const PORT = configService.get<number>('PORT');

  const prefix = 'v1';
  app.setGlobalPrefix(prefix);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(helmet());

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const config = new DocumentBuilder()
    .setTitle('Gym app')
    .setDescription('Gym app backend')
    .setVersion('1.0')
    .setLicense('GPL-3.0', 'https://www.gnu.org/licenses/gpl-3.0.html')
    .setContact('Bitrey', 'https://www.bitrey.it', 'webmaster@bitrey.it')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT, HOST);

  const logger = app.get(WINSTON_MODULE_PROVIDER) as Logger;

  logger.info(`Server is running on http://${HOST}:${PORT}`);
}

bootstrap();
