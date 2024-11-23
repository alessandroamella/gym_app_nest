import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GetAllWorkoutsResponseDto } from './get-all-workouts.dto';
import { WorkoutUserDto } from './workout-user.dto';

export class CommentUserDto extends WorkoutUserDto {}

export class WorkoutCommentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Great workout!' })
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: CommentUserDto })
  user: CommentUserDto;
}

export class GetWorkoutResponseDto extends OmitType(GetAllWorkoutsResponseDto, [
  '_count',
]) {
  @ApiProperty({ type: [WorkoutCommentDto] })
  comments: WorkoutCommentDto[];
}
