import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import { createLogger, format, transports } from 'winston';
import { join, basename } from 'path';

const { combine, timestamp, colorize, printf, errors, label, json } = format;

const combinedLogsFile = join(process.cwd(), './logs/combined.log');
const errorsLogsFile = join(process.cwd(), './logs/error.log');

async function bootstrap() {
  // createLogger of Winston
  const instance = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
      label({ label: basename(require.main?.filename || '') }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      json(),
    ),
    transports: [
      new transports.Console({
        format: combine(
          colorize(),
          printf((info) => {
            return `${info.timestamp} ${info.level} [${info.label}]: ${
              typeof info.message === 'object'
                ? JSON.stringify(info.message)
                : info.message
            }`;
          }),
        ),
      }),
      new transports.File({
        filename: combinedLogsFile,
        maxsize: 10000000,
      }),
      new transports.File({
        filename: errorsLogsFile,
        level: 'error',
        maxsize: 20000000,
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance,
    }),
  });

  const config = new DocumentBuilder()
    .setTitle('Gym app')
    .setDescription('Gym app backend')
    .setVersion('1.0')
    .addTag('gym-app')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(3000, () => {
    instance.info(`Server is running on http://localhost:3000`);
  });
}
bootstrap();
