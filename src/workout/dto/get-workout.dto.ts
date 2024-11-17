import { ApiProperty } from '@nestjs/swagger';
import { CommentUserDto, WorkoutUserDto } from './get-all-workouts.dto';
import { WorkoutMediaDto } from './workout-media.dto';

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

export class GetAllWorkoutsResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 45 })
  durationMin: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ example: 'Felt great today!', nullable: true })
  notes: string | null;

  @ApiProperty({ type: [WorkoutMediaDto] })
  media: WorkoutMediaDto[];

  @ApiProperty({ type: WorkoutUserDto })
  user: WorkoutUserDto;

  @ApiProperty({
    type: 'object',
    properties: {
      comments: {
        type: 'object',
        properties: {
          count: { type: 'number', example: 5 },
        },
      },
    },
  })
  _count: {
    comments: number;
  };
}

export class GetWorkoutResponseDto extends GetAllWorkoutsResponseDto {
  @ApiProperty({ type: [WorkoutCommentDto] })
  comments: WorkoutCommentDto[];
}
