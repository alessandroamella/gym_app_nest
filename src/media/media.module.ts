import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MediaService],
})
export class MediaModule {}
