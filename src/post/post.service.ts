import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SharedService } from 'shared/shared.service';
import { PaginationQueryDto } from 'shared/dto/pagination-query.dto';
import { GetAllPostsResponseDto } from './dto/get-all-post.dto';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { MediaCategory } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PostLikesDto } from './dto/post-likes.dto';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private shared: SharedService,
    private r2: CloudflareR2Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private readonly postSelect = {
    id: true,
    text: true,
    createdAt: true,
    likes: {
      select: {
        user: {
          select: this.shared.userParentResourceSelect,
        },
        createdAt: true,
      },
    },
    media: {
      select: this.shared.mediaWithMimeSelect,
    },
    user: {
      select: this.shared.userParentResourceSelect,
    },
  };

  async findAll({
    limit,
    skip,
  }: PaginationQueryDto): Promise<GetAllPostsResponseDto[]> {
    return this.prisma.motivationPost.findMany({
      where: {
        media: {
          some: {
            // at least one media item
            category: MediaCategory.POST,
          },
        },
      },
      select: this.postSelect,
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(userId: number, createPostDto: CreatePostDto) {
    return this.prisma.motivationPost.create({
      data: {
        ...createPostDto,
        userId,
      },
      select: this.postSelect,
    });
  }

  async remove(userId: number, id: number) {
    const post = await this.prisma.motivationPost.findFirst({
      where: { id, userId },
      select: {
        media: {
          select: {
            key: true,
          },
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found or unauthorized');
    }

    return this.prisma.$transaction(async (tx) => {
      for (const { key } of post.media) {
        await this.r2.deleteFile(key);
      }
      await tx.motivationPost.delete({
        where: { id },
        select: this.postSelect,
      });
    });
  }

  public async toggleLike(
    userId: number,
    postId: number,
  ): Promise<[HttpStatus, PostLikesDto | null]> {
    const like = await this.prisma.postLike.findFirst({
      where: {
        userId,
        postId,
      },
    });

    return like
      ? [HttpStatus.OK, (await this.removeLike(userId, postId), null)]
      : [HttpStatus.CREATED, await this.addLike(userId, postId)];
  }

  private async addLike(userId: number, postId: number) {
    this.logger.debug(`User ${userId} liked post ${postId}`);
    return this.prisma.postLike.create({
      data: {
        userId,
        postId,
      },
      select: this.postSelect.likes.select,
    });
  }

  private async removeLike(userId: number, postId: number) {
    this.logger.debug(`User ${userId} unliked post ${postId}`);
    await this.prisma.postLike.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return HttpStatus.OK;
  }
}
