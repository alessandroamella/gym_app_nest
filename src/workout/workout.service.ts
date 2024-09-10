import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../cloudflare-r2/cloudflare-r2.service';
import {
  MediaCategory,
  MediaType,
  Prisma,
  UserRole,
  Workout,
} from '@prisma/client';
import { CreateWorkoutDto, UpdateWorkoutDto } from './workout.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserDto } from 'auth/user.dto';

@Injectable()
export class WorkoutService {
  constructor(
    private prisma: PrismaService,
    private cloudflareR2Service: CloudflareR2Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // Create a new workout
  async create(
    createWorkoutDto: CreateWorkoutDto,
    user: UserDto,
    mediaFiles: Express.Multer.File[],
  ): Promise<Workout> {
    this.logger.debug(`Starting workout creation process for user ${user.id}`);

    try {
      const workout = await this.prisma.workout.create({
        data: {
          ...createWorkoutDto,
          users: { connect: { id: user.id } },
        },
      });

      this.logger.debug(`Workout created successfully with id ${workout.id}`);

      if (mediaFiles.length > 0) {
        await this.uploadMediaFiles(workout.id, mediaFiles);
      }

      return this.findOne(workout.id);
    } catch (error) {
      this.logger.error('Error occurred while creating workout');
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create workout');
    }
  }

  // Read a workout by ID
  async findOne(id: number): Promise<Workout> {
    this.logger.debug(`Fetching workout by id ${id}`);

    const workout = await this.prisma.workout.findUnique({
      where: { id, deletedAt: null },
      include: {
        users: {
          select: {
            id: true,
            profilePic: {
              select: {
                url: true,
              },
            },
            username: true,
            _count: { select: { workouts: true } },
          },
        },
        media: { select: { url: true } },
      },
    });

    if (!workout) {
      this.logger.warn(`Workout not found with id ${id}`);
      throw new NotFoundException('Workout not found');
    }

    this.logger.debug(
      `Workout fetched successfully: ${JSON.stringify(workout)}`,
    );
    return workout;
  }

  // Update a workout
  async update(
    id: number,
    updateWorkoutDto: UpdateWorkoutDto,
    user: UserDto,
    mediaFiles?: Express.Multer.File[],
  ): Promise<Workout> {
    this.logger.debug(`Starting workout update process for id ${id}`);

    await this.isAuthorizedForWorkout(id, user.id, 'update');

    try {
      const updatedWorkout = await this.prisma.workout.update({
        where: { id, deletedAt: null },
        data: updateWorkoutDto,
      });

      this.logger.debug(`Workout ${id} details updated successfully`);

      if (mediaFiles && mediaFiles.length > 0) {
        await this.uploadMediaFiles(id, mediaFiles);
      }

      return this.findOne(updatedWorkout.id);
    } catch (error) {
      if (error.code === 'P2025') {
        this.logger.warn(`Workout not found for update: ${id}`);
        throw new NotFoundException('Workout not found');
      }
      this.logger.error(`Error occurred while updating workout ${id}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to update workout');
    }
  }

  // Delete a workout
  async hardDelete(id: number, user: UserDto): Promise<void> {
    this.logger.debug(`Starting workout hard deletion process for id ${id}`);

    await this.isAuthorizedForWorkout(id, user.id, 'delete');

    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!workout) {
      this.logger.warn(`Workout not found for hard deletion: ${id}`);
      throw new NotFoundException('Workout not found');
    }

    try {
      // Delete associated media files
      await Promise.all(
        workout.media.map((media) =>
          this.cloudflareR2Service.deleteFile(media.key),
        ),
      );

      // Delete media records
      await this.prisma.media.deleteMany({ where: { workoutId: id } });

      // Hard delete the workout
      await this.prisma.workout.delete({ where: { id } });

      this.logger.debug(
        `Workout ${id} and associated media hard deleted successfully`,
      );
    } catch (error) {
      this.logger.error(`Error occurred while hard deleting workout ${id}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to hard delete workout');
    }
  }

  async softDelete(id: number, user: UserDto): Promise<void> {
    this.logger.debug(`Starting workout soft deletion process for id ${id}`);

    await this.isAuthorizedForWorkout(id, user.id, 'delete');

    const workout = await this.prisma.workout.findUnique({
      where: { id, deletedAt: null },
    });

    if (!workout) {
      this.logger.warn(`Workout not found for soft deletion: ${id}`);
      throw new NotFoundException('Workout not found');
    }

    try {
      // Soft delete the workout
      const delDate = new Date();

      await this.prisma.workout.update({
        where: { id },
        data: { deletedAt: delDate },
      });

      await this.prisma.media.updateMany({
        where: { workoutId: id },
        data: { deletedAt: delDate },
      });

      this.logger.debug(`Workout ${id} soft deleted successfully`);
    } catch (error) {
      this.logger.error(`Error occurred while soft deleting workout ${id}`);
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to soft delete workout');
    }
  }

  // Helper method to upload media files
  private async uploadMediaFiles(
    workoutId: number,
    mediaFiles: Express.Multer.File[],
  ): Promise<void> {
    this.logger.debug(`Uploading media files for workout ${workoutId}`);

    for (const file of mediaFiles) {
      try {
        const mediaUrl = await this.cloudflareR2Service.uploadFile(
          file.buffer,
          file.mimetype,
        );
        this.logger.debug(
          `Media file uploaded successfully: ${JSON.stringify(mediaUrl)}`,
        );

        await this.prisma.media.create({
          data: {
            key: mediaUrl.key,
            url: mediaUrl.url,
            category: MediaCategory.WORKOUT,
            mime: file.mimetype,
            type: file.mimetype.startsWith('image')
              ? MediaType.IMAGE
              : MediaType.VIDEO,
            workout: {
              connect: { id: workoutId },
            },
          },
        });
      } catch (error) {
        this.logger.error(
          `Error uploading media file for workout ${workoutId}`,
        );
        this.logger.error(error);
        throw new InternalServerErrorException('Failed to upload media files');
      }
    }

    this.logger.debug(
      `Media files uploaded and associated with workout ${workoutId}`,
    );
  }

  private async isAuthorizedForWorkout(
    workoutId: number,
    userId: number,
    action: 'update' | 'delete',
  ): Promise<void> {
    const workout = await this.prisma.workout.findFirst({
      where: {
        id: workoutId,
        users: {
          some: {
            OR: [
              { id: userId },
              { role: { in: [UserRole.DEV, UserRole.OWNER] } },
            ],
          },
        },
      },
    });

    if (!workout) {
      this.logger.debug(
        `User ${userId} is not authorized to ${action} workout ${workoutId}`,
      );
      throw new UnauthorizedException(`Not authorized to ${action} workout`);
    }
  }
}
