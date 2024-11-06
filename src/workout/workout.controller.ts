import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReqUser, User } from '../auth/user.decorator';
import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateWorkoutMediaDto } from './dto/create-workout-media.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
  @ApiOkResponse({ description: 'List of workouts' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findAll(@User() user: ReqUser) {
    return this.workoutService.findAllByUser(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Workout details' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async findOne(@User() user: ReqUser, @Param('id') id: number) {
    return this.workoutService.findOne(user.id, id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateWorkoutDto })
  @ApiOkResponse({ description: 'Workout updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async update(
    @User() user: ReqUser,
    @Param('id') id: number,
    @Body() updateWorkoutDto: UpdateWorkoutDto,
  ) {
    return this.workoutService.update(user.id, id, updateWorkoutDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Workout deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@User() user: ReqUser, @Param('id') id: number) {
    return this.workoutService.remove(user.id, id);
  }

  @Post(':id/media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Workout media created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createWorkoutMedia(
    @User() user: ReqUser,
    @Param('id') workoutId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const createWorkoutMediaDto: CreateWorkoutMediaDto = {
      workoutId,
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
      },
    };
    return this.workoutService.createWorkoutMedia(
      user.id,
      createWorkoutMediaDto,
    );
  }

  @Delete('media/:key')
  @ApiOkResponse({ description: 'Workout media deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteWorkoutMedia(@User() user: ReqUser, @Param('key') key: string) {
    return this.workoutService.deleteWorkoutMedia(user.id, { key });
  }
}
