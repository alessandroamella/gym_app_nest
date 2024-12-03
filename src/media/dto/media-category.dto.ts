import { ApiProperty } from '@nestjs/swagger';
import { MediaCategory } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class MediaCategoryDto {
  @ApiProperty({
    description: 'Media category',
    type: 'string',
    enum: MediaCategory,
  })
  @IsEnum(MediaCategory)
  category: MediaCategory;
}
