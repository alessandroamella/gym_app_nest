import { ApiProperty } from '@nestjs/swagger';
import { WorkoutMediaDto } from './workout-media.dto';
import { WorkoutUserDto } from './get-workout.dto';

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
