import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudflareR2Service } from '../cloudflare-r2/cloudflare-r2.service';
import { v4 as uuidv4 } from 'uuid';
import { MediaCategory, MediaType, Workout } from '@prisma/client';
import { CreateWorkoutDto, UpdateWorkoutDto } from './workout.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

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
    userId: number,
    mediaFiles: Express.Multer.File[],
  ): Promise<Workout> {
    this.logger.debug(`Starting workout creation process for user ${userId}`);

    return this.prisma.$transaction(async (tx) => {
      try {
        const workout = await tx.workout.create({
          data: {
            ...createWorkoutDto,
            users: { connect: { id: userId } },
          },
        });

        this.logger.debug(`Workout created successfully with id ${workout.id}`);

        if (mediaFiles.length > 0) {
          await this.uploadMediaFiles(tx, workout.id, mediaFiles);
        }

        return this.findOne(workout.id);
      } catch (error) {
        this.logger.error('Error occurred while creating workout', error);
        throw new InternalServerErrorException('Failed to create workout');
      }
    });
  }

  // Read a workout by ID
  async findOne(id: number): Promise<Workout> {
    this.logger.debug(`Fetching workout by ID ${id}`);

    const workout = await this.prisma.workout.findUnique({
      where: { id, deletedAt: null },
      include: {
        users: {
          select: {
            id: true,
            profilePic: true,
            username: true,
            _count: { select: { workouts: true } },
          },
        },
        media: { select: { url: true } },
      },
    });

    if (!workout) {
      this.logger.warn(`Workout not found with ID ${id}`);
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
    mediaFiles?: Express.Multer.File[],
  ): Promise<Workout> {
    this.logger.debug(`Starting workout update process for ID ${id}`);

    return this.prisma.$transaction(async (tx) => {
      try {
        const updatedWorkout = await tx.workout.update({
          where: { id, deletedAt: null },
          data: updateWorkoutDto,
        });

        this.logger.debug(`Workout ${id} details updated successfully`);

        if (mediaFiles && mediaFiles.length > 0) {
          await this.uploadMediaFiles(tx, id, mediaFiles);
        }

        return this.findOne(updatedWorkout.id);
      } catch (error) {
        if (error.code === 'P2025') {
          this.logger.warn(`Workout not found for update: ${id}`);
          throw new NotFoundException('Workout not found');
        }
        this.logger.error(`Error occurred while updating workout ${id}`, error);
        throw new InternalServerErrorException('Failed to update workout');
      }
    });
  }

  // Delete a workout
  async remove(id: number): Promise<void> {
    this.logger.debug(`Starting workout deletion process for ID ${id}`);

    try {
      const workout = await this.prisma.workout.findUnique({
        where: { id, deletedAt: null },
        include: { media: true },
      });

      if (!workout) {
        this.logger.warn(`Workout not found for deletion: ${id}`);
        throw new NotFoundException('Workout not found');
      }

      await this.prisma.$transaction(async (tx) => {
        await Promise.all(
          workout.media.map((media) =>
            this.cloudflareR2Service.deleteFile(media.key),
          ),
        );
        await tx.media.deleteMany({ where: { workoutId: id } });
        await tx.workout.delete({ where: { id } });
      });

      this.logger.debug(
        `Workout ${id} and associated media deleted successfully`,
      );
    } catch (error) {
      this.logger.error(`Error occurred while deleting workout ${id}`, error);
      throw new InternalServerErrorException('Failed to delete workout');
    }
  }

  // Helper method to upload media files
  private async uploadMediaFiles(
    tx: any,
    workoutId: number,
    mediaFiles: Express.Multer.File[],
  ): Promise<void> {
    this.logger.debug(`Uploading media files for workout ${workoutId}`);

    await Promise.all(
      mediaFiles.map(async (file) => {
        const mediaUrl = await this.cloudflareR2Service.uploadFile(
          file.buffer,
          {
            mime: file.mimetype,
            category: MediaCategory.WORKOUT,
            workout: { connect: { id: workoutId } },
          },
        );
        this.logger.debug(`Media file uploaded successfully: ${mediaUrl}`);

        await tx.media.create({
          data: {
            key: uuidv4(),
            url: mediaUrl,
            type: file.mimetype.startsWith('image')
              ? MediaType.IMAGE
              : MediaType.VIDEO,
            workoutId,
          },
        });
      }),
    );

    this.logger.debug(
      `Media files uploaded and associated with workout ${workoutId}`,
    );
  }
}
