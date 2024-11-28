import { PickType } from '@nestjs/swagger';
import { GetProfileDto } from 'auth/dto/get-profile.dto';

export class WorkoutUserDto extends PickType(GetProfileDto, [
  'id',
  'username',
  'profilePicUrl',
  'points',
]) {}
