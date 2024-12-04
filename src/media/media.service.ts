import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MediaCategory, MotivationPost, Workout } from '@prisma/client';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { PrismaService } from 'prisma/prisma.service';
import { DeleteMediaDto } from 'media/dto/delete-media.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private r2: CloudflareR2Service,
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private readonly mediaFullSelect = {
    category: true,
    key: true,
    url: true,
  };

  async processMediaAuth(key: string, token?: unknown): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { key },
    });

    if (!media.needsAuth) return;

    try {
      if (typeof token !== 'string') {
        throw new Error('Invalid token');
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      this.logger.debug(`User ${payload.userId} is accessing media ${key}`);
    } catch (err) {
      this.logger.debug('Invalid token: ' + token + ' - ' + err);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async createMedia(
    userId: number,
    category: MediaCategory,
    foreignId: number,
    createMediaDto: CreateMediaDto,
  ) {
    const findQuery = { where: { id: foreignId, userId } };

    let parentResource: MotivationPost | Workout;
    switch (category) {
      case MediaCategory.POST:
        parentResource = await this.prisma.motivationPost.findFirst(findQuery);
        break;
      case MediaCategory.WORKOUT:
        parentResource = await this.prisma.workout.findFirst(findQuery);
        break;
      default:
        throw new NotFoundException(`Invalid MediaCategory: ${category}`);
    }

    if (!parentResource) {
      throw new NotFoundException(
        `Parent resource for ${category} with id ${foreignId} and userId ${userId} not found or unauthorized`,
      );
    }

    const { key, url } = await this.r2.uploadFile(
      createMediaDto.file.buffer,
      createMediaDto.file.mimetype,
    );

    const media = await this.prisma.media.create({
      data: {
        key,
        url,
        category,
        // protect media for posts
        needsAuth: category === MediaCategory.POST,
        mime: createMediaDto.file.mimetype,
        [category === MediaCategory.WORKOUT ? 'workout' : 'post']: {
          connect: { id: foreignId },
        },
      },
      select: this.mediaFullSelect,
    });

    this.logger.debug(
      `Created ${media.category} media ${media.key} at ${media.url}`,
    );
    return media;
  }

  async deleteMedia(
    userId: number,
    category: MediaCategory,
    deleteMediaDto: DeleteMediaDto,
  ) {
    const media = await this.prisma.media.findFirst({
      where: {
        key: deleteMediaDto.key,
        [category === MediaCategory.WORKOUT ? 'workout' : 'post']: {
          userId,
        },
      },
      select: this.mediaFullSelect,
    });

    if (!media) {
      throw new NotFoundException('Media not found or unauthorized');
    }

    this.logger.debug(
      `Deleting ${media.category} media ${media.key} at ${media.url}`,
    );

    await this.r2.deleteFile(media.key);
    await this.prisma.media.delete({ where: { key: deleteMediaDto.key } });
  }

  async updateProfilePic(userId: number, file: Express.Multer.File) {
    const curPic = await this.prisma.media.findFirst({
      where: { user: { id: userId }, category: MediaCategory.PROFILE_PIC },
    });

    if (curPic) {
      await this.r2.deleteFile(curPic.key);
      await this.prisma.media.delete({ where: { key: curPic.key } });
    }

    const { key, url } = await this.r2.uploadFile(file.buffer, file.mimetype);
    await this.prisma.media.create({
      data: {
        key,
        mime: file.mimetype,
        url,
        category: MediaCategory.PROFILE_PIC,
        user: { connect: { id: userId } },
      },
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { profilePic: { connect: { key } } },
    });
    return { url };
  }
}
