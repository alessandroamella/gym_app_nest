import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Media, MediaType } from '@prisma/client';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMediaDto
  implements Omit<Media, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>
{
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  url: string;

  @ApiProperty()
  @IsEnum(MediaType)
  @IsNotEmpty()
  @ApiProperty({ enum: MediaType })
  type: MediaType;
}

export class UpdateMediaDto extends PartialType(CreateMediaDto) {}

export class MediaDto extends CreateMediaDto implements Partial<Media> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
