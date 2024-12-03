import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { AuthService } from 'auth/auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { CloudflareR2Module } from 'cloudflare-r2/cloudflare-r2.module';

@Module({
  imports: [CloudflareR2Module],
  providers: [PostService, PrismaService, AuthService],
  controllers: [PostController],
})
export class PostModule {}
