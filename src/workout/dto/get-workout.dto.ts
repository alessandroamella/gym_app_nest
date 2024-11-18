import { ApiProperty } from '@nestjs/swagger';
import { GetAllWorkoutsResponseDto } from './get-all-workouts.dto';

export class WorkoutUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({
    example: 'https://storage.cloudflare.com/profile-pic-123.jpg',
    nullable: true,
  })
  profilePicUrl: string | null;
}

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

export class GetWorkoutResponseDto extends GetAllWorkoutsResponseDto {
  @ApiProperty({ type: [WorkoutCommentDto] })
  comments: WorkoutCommentDto[];
}
