import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkoutDto {
  @Type(() => Number) // Explicitly transform to number
  @ApiProperty({
    description: 'Workout minutes',
  })
  @IsNumber()
  durationMin: number;

  @ApiPropertyOptional({
    description: 'Workout notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
