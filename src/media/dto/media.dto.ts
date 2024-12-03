import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsMimeType, IsString, IsUrl } from 'class-validator';

export class InternalMediaDto {
  @ApiProperty({
    description: 'Unique key for the media file',
    example: 'workout-123.jpg',
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: 'URL to the media file',
    example: 'https://storage.cloudflare.com/workout-123.jpg',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'MIME type of the media file',
    example: 'image/jpeg',
  })
  @IsMimeType()
  mime: string;
}

export class MediaDto extends PickType(InternalMediaDto, ['url', 'mime']) {}
