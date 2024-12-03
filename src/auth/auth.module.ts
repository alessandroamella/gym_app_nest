import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { WorkoutModule } from 'workout/workout.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  imports: [WorkoutModule],
})
export class AuthModule {}
