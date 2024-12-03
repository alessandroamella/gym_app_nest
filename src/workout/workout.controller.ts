import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReqUser, User } from '../auth/user.decorator';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetAllWorkoutsResponseDto } from './dto/get-all-workouts.dto';
import { GetWorkoutResponseDto } from './dto/get-workout.dto';
import { PaginationQueryDto } from 'shared/dto/pagination-query.dto';

@Controller('workout')
@ApiTags('workout')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class WorkoutController {
  constructor(private workoutService: WorkoutService) {}

  @Post()
  @ApiBody({ type: CreateWorkoutDto })
  @ApiOkResponse({ description: 'Workout created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(
    @User() user: ReqUser,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.workoutService.create(user.id, createWorkoutDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of workouts',
    type: [GetAllWorkoutsResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.workoutService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Workout details',
    type: GetWorkoutResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workoutService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateWorkoutDto })
  @ApiOkResponse({ description: 'Workout updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @User() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutService.update(user.id, id, updateWorkoutDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Workout deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@User() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    return this.workoutService.remove(user.id, id);
  }
}
