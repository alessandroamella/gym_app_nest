import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { PrismaService } from 'prisma/prisma.service';
import { PrismaModule } from 'prisma/prisma.module';
import { CloudflareR2Module } from 'cloudflare-r2/cloudflare-r2.module';
import { AuthModule } from 'auth/auth.module';
import { AuthService } from 'auth/auth.service';

@Module({
  imports: [PrismaModule, CloudflareR2Module],
  controllers: [WorkoutController],
  providers: [WorkoutService, PrismaService, AuthService],
  exports: [WorkoutService],
})
export class WorkoutModule {}
