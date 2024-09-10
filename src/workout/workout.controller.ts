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
} from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto, WorkoutMediaDto } from './workout.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assumes you have JWT Auth Guard setup

@ApiTags('workout')
@ApiBearerAuth() // Add Bearer authentication globally for this controller
@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @UseGuards(JwtAuthGuard) // Protects the route with Bearer Auth
  @Post()
  @ApiOperation({ summary: 'Create a new workout with optional media files' })
  @ApiConsumes('multipart/form-data') // Indicates file upload in Swagger
  @ApiBody({
    description: 'Create workout data and media files',
    type: WorkoutMediaDto, // Automatically generate schema from DTO
  })
  @UseInterceptors(FilesInterceptor('files', 5)) // Handles file upload
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The workout has been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create workout.',
  })
  async createWorkout(
    @Body() createWorkoutDto: CreateWorkoutDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          // jpg, jpeg, png, gif in regex
          fileType: /^image\/(jpg|jpeg|png|gif)$/,
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 }) // 5MB
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ): Promise<any> {
    const userId = 1; // Replace this with actual userId from Auth (e.g., JWT)
    return this.workoutService.create(createWorkoutDto, userId, files || []);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The workout has been retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workout not found.',
  })
  async getWorkoutById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.workoutService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout by ID along with its media' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The workout has been deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Workout not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete workout.',
  })
  async deleteWorkout(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.workoutService.remove(id);
  }
}
