import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateWorkoutDto } from './dto/create-workout.dto';
import type { UpdateWorkoutDto } from './dto/update-workout.dto';
import type { CreateWorkoutMediaDto } from './dto/create-workout-media.dto';
import type { DeleteWorkoutMediaDto } from './dto/delete-workout-media.dto';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, Workout } from '@prisma/client';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { GetAllWorkoutsResponseDto } from './dto/get-all-workouts.dto';
import { GetWorkoutResponseDto } from './dto/get-workout.dto';
import _ from 'lodash';
import dayjs from 'dayjs';

@Injectable()
export class WorkoutService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service,
  ) {}

  private readonly userSelect: Prisma.UserSelect = {
    id: true,
    username: true,
    profilePicUrl: true,
    points: true,
  };

  private readonly workoutSelect: Prisma.WorkoutSelect = {
    id: true,
    startDate: true,
    endDate: true,
    createdAt: true,
    notes: true,
    points: true,
    media: {
      select: {
        url: true,
        mime: true,
      },
    },
    user: {
      select: this.userSelect,
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

  async findOne(userId: number, id: number): Promise<GetWorkoutResponseDto> {
    const workout = this.prisma.workout.findUnique({
      where: { id, userId },
      select: {
        ...this.workoutSelect,
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: this.userSelect,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
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
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    return this.prisma.$transaction(async (tx) => {
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

  async createWorkoutMedia(
    userId: number,
    createWorkoutMediaDto: CreateWorkoutMediaDto,
  ) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: createWorkoutMediaDto.workoutId, userId },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    const { key, url } = await this.cloudflareR2Service.uploadFile(
      createWorkoutMediaDto.file.buffer,
      createWorkoutMediaDto.file.mimetype,
    );
    const workoutMedia = await this.prisma.workoutMedia.create({
      data: {
        key,
        url,
        mime: createWorkoutMediaDto.file.mimetype,
        workoutId: createWorkoutMediaDto.workoutId,
      },
      select: { key: true, url: true },
    });
    return workoutMedia;
  }

  async deleteWorkoutMedia(
    userId: number,
    deleteWorkoutMediaDto: DeleteWorkoutMediaDto,
  ) {
    const workoutMedia = await this.prisma.workoutMedia.findFirst({
      where: {
        key: deleteWorkoutMediaDto.key,
        workout: { userId },
      },
    });
    if (!workoutMedia) {
      throw new NotFoundException('Workout media not found or unauthorized');
    }
    await this.cloudflareR2Service.deleteFile(workoutMedia.url);
    await this.prisma.workoutMedia.delete({
      where: { key: deleteWorkoutMediaDto.key },
    });
  }
}
