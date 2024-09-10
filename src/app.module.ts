import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkoutModule } from './workout/workout.module';
import { WinstonModule } from 'nest-winston';
import { CloudflareR2Module } from './cloudflare-r2/cloudflare-r2.module';
import { configValidationSchema } from 'config/config.schema';
import { winstonConfig } from 'logger';

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
    WinstonModule.forRoot(winstonConfig),
    CloudflareR2Module,
  ],
})
export class AppModule {}
