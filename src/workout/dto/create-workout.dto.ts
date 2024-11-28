import { PickType } from '@nestjs/swagger';
import { GetAllWorkoutsResponseDto } from './get-all-workouts.dto';

export class CreateWorkoutDto extends PickType(GetAllWorkoutsResponseDto, [
  'startDate',
  'endDate',
  'notes',
]) {}
