import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WorkoutService } from './workout.service';
import { JwtAuthGuard } from 'auth/jwt-auth.guard';
import { CreateWorkoutDto, UpdateWorkoutDto, WorkoutDto } from './workout.dto';
import { Workout } from '@prisma/client';

@ApiTags('Workouts')
@Controller('workout')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workout' })
  @ApiCreatedResponse({ type: WorkoutDto })
  @ApiBody({ type: CreateWorkoutDto })
  async create(@Body() createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
    return this.workoutService.create(createWorkoutDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workouts' })
  @ApiOkResponse({ type: [WorkoutDto] })
  async findAll(): Promise<Workout[]> {
    return this.workoutService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a workout by ID' })
  @ApiOkResponse({ type: WorkoutDto })
  async findOne(@Param('id') id: string): Promise<Workout | null> {
    return this.workoutService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout by ID' })
  @ApiOkResponse({ type: WorkoutDto })
  @ApiBody({ type: UpdateWorkoutDto })
  async update(
    @Param('id') id: string,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ): Promise<Workout> {
    return this.workoutService.update(+id, updateWorkoutDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workout deleted successfully.',
  })
  async remove(@Param('id') id: string): Promise<HttpStatus> {
    await this.workoutService.remove(+id);
    return HttpStatus.OK;
  }
}
