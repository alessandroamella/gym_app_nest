import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'prisma/prisma.service';
import { SharedService } from 'shared/shared.service';
import { Logger } from 'winston';
import { RankingDto } from './dto/ranking.dto';
import { WorkoutService } from 'workout/workout.service';
import dayjs from 'dayjs';
import _ from 'lodash';

@Injectable()
export class RankingService {
  constructor(
    private prisma: PrismaService,
    private workoutService: WorkoutService,
    private shared: SharedService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getRanking(): Promise<RankingDto[]> {
    const workouts = await this.prisma.workout.findMany({
      include: {
        user: true,
      },
    });

    const _rankings = workouts.map((workout) => {
      return {
        id: workout.user.id,
        username: workout.user.username,
        totalWorkoutDuration: dayjs(workout.endDate).diff(
          workout.startDate,
          'seconds',
        ),
        totalPoints: this.workoutService.calculatePoints(workout),
      };
    });

    const rankings = _.chain(_rankings)
      .groupBy('id')
      .map((value, key) => {
        return {
          id: +key,
          username: value[0].username,
          totalWorkoutDuration: _.sumBy(value, 'totalWorkoutDuration'),
          totalPoints: _.sumBy(value, 'totalPoints'),
        };
      })
      .value();

    const sortedRankings = _.orderBy(
      rankings,
      ['totalPoints', 'totalWorkoutDuration'],
      ['desc', 'asc'],
    );

    this.logger.info('Successfully retrieved ranking');

    return sortedRankings;
  }
}
