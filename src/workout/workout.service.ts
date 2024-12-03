import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateWorkoutDto } from './dto/create-workout.dto';
import type { UpdateWorkoutDto } from './dto/update-workout.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Workout } from '@prisma/client';
import { GetAllWorkoutsResponseDto } from './dto/get-all-workouts.dto';
import { GetWorkoutResponseDto } from './dto/get-workout.dto';
import dayjs from 'dayjs';
import { SharedService } from 'shared/shared.service';
import { PaginationQueryDto } from 'shared/dto/pagination-query.dto';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';

@Injectable()
export class WorkoutService {
  constructor(
    private prisma: PrismaService,
    private shared: SharedService,
    private r2: CloudflareR2Service,
  ) {}

  private readonly workoutSelect = {
    id: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    notes: true,
    points: true,
    media: {
      select: this.shared.mediaWithMimeSelect,
    },
    user: {
      select: this.shared.userParentResourceSelect,
    },
  };

  async findAll({
    limit,
    skip,
  }: PaginationQueryDto): Promise<GetAllWorkoutsResponseDto[]> {
    return this.prisma.workout.findMany({
      select: {
        ...this.workoutSelect,
        ...{
          _count: {
            select: {
              comments: true,
            },
          },
        },
      },
      take: limit,
      skip,
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<GetWorkoutResponseDto> {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      select: {
        ...this.workoutSelect,
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: this.shared.userParentResourceSelect,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return workout;
  }

  public calculatePoints({
    startDate,
    endDate,
  }: Pick<Workout, 'startDate' | 'endDate'>) {
    const durationMin = dayjs(endDate).diff(startDate, 'minutes');
    return Math.floor(durationMin / 45);
  }

  async create(userId: number, createWorkoutDto: CreateWorkoutDto) {
    return this.prisma.$transaction(async (tx) => {
      const workout = await tx.workout.create({
        data: {
          ...createWorkoutDto,
          points: this.calculatePoints(createWorkoutDto),
          userId,
        },
        select: this.workoutSelect,
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: workout.points,
          },
        },
      });

      return workout;
    });
  }

  async update(userId: number, id: number, updateWorkoutDto: UpdateWorkoutDto) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    const newWorkout = {
      ...workout,
      ...updateWorkoutDto,
    };
    return this.prisma.workout.update({
      where: { id },
      data: {
        ...updateWorkoutDto,
        points: this.calculatePoints(newWorkout),
        user: {
          update: {
            points: {
              increment: this.calculatePoints(newWorkout) - workout.points,
            },
          },
        },
      },
      select: this.workoutSelect,
    });
  }

  async remove(userId: number, id: number) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
      select: {
        points: true,
        media: {
          select: {
            key: true,
          },
        },
      },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    return this.prisma.$transaction(async (tx) => {
      for (const { key } of workout.media) {
        await this.r2.deleteFile(key);
      }
      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: workout.points,
          },
        },
      });
      return tx.workout.delete({
        where: { id },
        select: this.workoutSelect,
      });
    });
  }
}
