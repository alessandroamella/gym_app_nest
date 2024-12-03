import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GetAllWorkoutsResponseDto } from './get-all-workouts.dto';
import { UserParentResourceDto } from 'shared/dto/user-parent-resource.dto';

export class WorkoutCommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Great workout!' })
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: UserParentResourceDto })
  user: UserParentResourceDto;
}

export class GetWorkoutResponseDto extends OmitType(GetAllWorkoutsResponseDto, [
  '_count',
]) {
  @ApiProperty({ type: [WorkoutCommentDto] })
  comments: WorkoutCommentDto[];
}
