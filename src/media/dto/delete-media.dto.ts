import { PickType } from '@nestjs/swagger';
import { InternalMediaDto } from './media.dto';

export class DeleteMediaDto extends PickType(InternalMediaDto, ['key']) {}
