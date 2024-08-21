import { Module } from '@nestjs/common';
import { WorkoutController } from './workout.controller';
import { WorkoutService } from './workout.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [WorkoutController],
  providers: [WorkoutService, PrismaService],
})
export class WorkoutModule {}
