import { Module } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { PrismaModule } from 'prisma/prisma.module';
import { WorkoutModule } from 'workout/workout.module';
import { RankingController } from './ranking.controller';

@Module({
  providers: [RankingService],
  imports: [PrismaModule, WorkoutModule],
  controllers: [RankingController],
})
export class RankingModule {}
