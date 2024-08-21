import { Injectable } from '@nestjs/common';
import { Prisma, Workout } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateWorkoutDto, UpdateWorkoutDto } from './workout.dto';

@Injectable()
export class WorkoutService {
  constructor(private prisma: PrismaService) {}

  private static readonly workoutSelect: Prisma.WorkoutSelect = {
    id: true,
    startTime: true,
    endTime: true,
    media: {
      select: {
        id: true,
        url: true,
        type: true,
      },
    },
  };

  async create(createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
    const { media, ...workoutData } = createWorkoutDto;
    return this.prisma.workout.create({
      data: {
        ...workoutData,
        media: {
          create: media,
        },
      },
      select: WorkoutService.workoutSelect,
    });
  }

  async findAll(): Promise<Workout[]> {
    return this.prisma.workout.findMany({
      select: WorkoutService.workoutSelect,
    });
  }

  async findOne(id: number): Promise<Workout | null> {
    return this.prisma.workout.findUnique({
      where: { id },
      select: WorkoutService.workoutSelect,
    });
  }

  async update(
    id: number,
    updateWorkoutDto: UpdateWorkoutDto,
  ): Promise<Workout> {
    const { media, ...workoutData } = updateWorkoutDto;
    const workout = await this.prisma.workout.update({
      where: { id },
      data: {
        ...workoutData,
        media: {
          updateMany: media.map((m) => ({
            where: { url: m.url },
            data: m,
          })),
        },
      },
      select: WorkoutService.workoutSelect,
    });

    return workout;
  }

  async remove(id: number): Promise<Workout> {
    return this.prisma.workout.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
