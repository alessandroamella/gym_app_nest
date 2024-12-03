import { PickType } from '@nestjs/swagger';
import { MediaDto } from 'media/dto/media.dto';

export class ProfilePicDto extends PickType(MediaDto, ['url']) {}
