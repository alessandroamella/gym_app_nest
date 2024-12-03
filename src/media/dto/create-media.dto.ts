import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty({
    description: 'Media file',
    type: 'string',
    format: 'binary',
  })
  file: {
    buffer: Buffer;
    mimetype: string;
  };
}
