import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { urlencoded, json } from 'express';
import helmet from 'helmet';
import { createNestWinstonLogger } from 'logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = createNestWinstonLogger();

  const app = await NestFactory.create(AppModule, { logger });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);

  const HOST = configService.get<string>('HOST');
  const PORT = configService.get<number>('PORT');

  const config = new DocumentBuilder()
    .setTitle('Gym app')
    .setDescription('Gym app backend')
    .setVersion('1.0')
    .addTag('gym-app')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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

  const prefix = 'v1';
  app.setGlobalPrefix(prefix);

  await app.listen(PORT, HOST);

  logger.log(`Server is running on http://${HOST}:${PORT}`);
}

bootstrap();
