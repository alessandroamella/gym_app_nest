import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudflareR2Module } from 'cloudflare-r2/cloudflare-r2.module';
import { WorkoutModule } from 'workout/workout.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  imports: [CloudflareR2Module, WorkoutModule],
})
export class AuthModule {}
