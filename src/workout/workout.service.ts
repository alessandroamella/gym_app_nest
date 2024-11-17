import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateWorkoutDto } from './dto/create-workout.dto';
import type { UpdateWorkoutDto } from './dto/update-workout.dto';
import type { CreateWorkoutMediaDto } from './dto/create-workout-media.dto';
import type { DeleteWorkoutMediaDto } from './dto/delete-workout-media.dto';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service,
  ) {}

  private readonly workoutSelect: Prisma.WorkoutSelect = {
    id: true,
    durationMin: true,
    createdAt: true,
    notes: true,
    media: {
      select: {
        url: true,
        mime: true,
      },
    },
    user: {
      select: {
        id: true,
        username: true,
        profilePicUrl: true,
      },
    },
  };

  async create(userId: number, createWorkoutDto: CreateWorkoutDto) {
    const workout = await this.prisma.workout.create({
      data: {
        ...createWorkoutDto,
        userId,
      },
    });
    return workout;
  }

  async findAll() {
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
    });
  }

  async findOne(userId: number, id: number) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
      select: {
        ...this.workoutSelect,
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                profilePicUrl: true,
              },
            },
          },
        },
      },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    return workout;
  }

  async update(userId: number, id: number, updateWorkoutDto: UpdateWorkoutDto) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    return this.prisma.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  async remove(userId: number, id: number) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
    });
    if (!workout) {
      throw new NotFoundException('Workout not found or unauthorized');
    }
    return this.prisma.workout.delete({ where: { id } });
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
