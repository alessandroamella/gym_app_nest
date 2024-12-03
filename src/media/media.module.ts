import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { CloudflareR2Module } from 'cloudflare-r2/cloudflare-r2.module';
import { AuthService } from 'auth/auth.service';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [MediaService, PrismaService, AuthService],
  controllers: [MediaController],
  imports: [PrismaModule, CloudflareR2Module],
})
export class MediaModule {}
