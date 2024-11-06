import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutDto {
  @ApiProperty({
    description: 'Workout name',
  })
  @IsNotEmpty()
  @IsNumber()
  durationMin: number;

  @ApiPropertyOptional({
    description: 'Workout notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
