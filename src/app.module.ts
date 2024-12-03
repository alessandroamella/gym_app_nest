import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { utilities, WinstonModule } from 'nest-winston';
import { colorize } from 'json-colorizer';
import { CloudflareR2Module } from './cloudflare-r2/cloudflare-r2.module';
import { configValidationSchema } from 'config/config.schema';
import { CommentModule } from './comment/comment.module';
import { FirebaseModule } from './firebase/firebase.module';
import { MediaModule } from './media/media.module';
import { PostModule } from './post/post.module';
import { SharedModule } from './shared/shared.module';
import winston from 'winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    AuthModule,
    WorkoutModule,
    PrismaModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.ms(),
            utilities.format.nestLike('Backend', {
              colors: true,
              prettyPrint: true,
            }),
            winston.format.printf((info) => {
              if (info.message instanceof Error) {
                return `${info.timestamp} ${info.level}: ${info.message.message}`;
              }
              if (typeof info.message === 'object') {
                return `${info.timestamp} ${info.level}: ${colorize(
                  JSON.stringify(info.message, null, 2),
                )}`;
              }
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
    CloudflareR2Module,
    CommentModule,
    FirebaseModule,
    MediaModule,
    PostModule,
    SharedModule,
  ],
})
export class AppModule {}
