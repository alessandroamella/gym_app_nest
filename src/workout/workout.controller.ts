import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  ParseIntPipe,
  ParseFilePipeBuilder,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import {
  CreateWorkoutDto,
  UpdateWorkoutDto,
  WorkoutDto,
  WorkoutMediaDto,
} from './workout.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from 'auth/user.decorator';
import { UserDto } from 'auth/user.dto';

@ApiTags('workout')
@ApiBearerAuth()
@Controller('workout')
@ApiNotFoundResponse({
  description: 'Workout not found.',
})
@ApiInternalServerErrorResponse({
  description: 'Internal server error.',
})
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new workout with optional media files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create workout data and media files',
    type: WorkoutMediaDto,
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiCreatedResponse({
    description: 'The workout has been successfully created.',
  })
  async createWorkout(
    @Body() createWorkoutDto: CreateWorkoutDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build({
          exceptionFactory(error) {
            console.log('err: ' + error);
            throw new BadRequestException({
              message: 'Invalid file type or size',
              errors: { files: error },
              errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            });
          },
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
    @User() user: UserDto,
  ) {
    return this.workoutService.create(createWorkoutDto, user, files || []);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout by ID with optional media files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update workout data and ADD media files',
    type: WorkoutMediaDto,
  })
  @UseInterceptors(FilesInterceptor('files', 5))
  @ApiOkResponse({
    description: 'The workout has been successfully updated.',
  })
  async updateWorkout(
    @Body() updateWorkoutDto: UpdateWorkoutDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserDto,
  ) {
    return this.workoutService.update(id, updateWorkoutDto, user, files || []);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'The workout has been retrieved successfully.',
    type: WorkoutDto,
  })
  async getWorkoutById(@Param('id', ParseIntPipe) id: number) {
    return this.workoutService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout by ID along with its media' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The workout has been deleted successfully.',
  })
  async deleteWorkout(
    @Param('id', ParseIntPipe) id: number,
    @User() user: UserDto,
  ): Promise<void> {
    return this.workoutService.softDelete(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all workouts' })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'All workouts have been retrieved successfully.',
    type: [WorkoutDto],
  })
  async getAllWorkouts(@User() user: UserDto) {
    return this.workoutService.getWorkoutsByUser(user.id);
  }
}
