import {
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User, ReqUser } from 'auth/user.decorator';
import { CreateMediaDto } from 'media/dto/create-media.dto';
import { MediaService } from './media.service';
import { AuthGuard } from 'auth/auth.guard';
import {
  LowercasedMediaCategory,
  mediaCategoryMap,
} from './dto/media-category-lowercased';
import { ValidateMediaCategoryPipe } from './media-category.validator';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Response } from 'express';

@Controller('media')
@ApiTags('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly r2: CloudflareR2Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // used for proxying media from S3 to the client
  @Get(':key')
  @ApiOkResponse({ description: 'Media' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMedia(
    @Param('key') key: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    await this.mediaService.processMediaAuth(key, token);

    let s3Response: GetObjectCommandOutput;

    try {
      s3Response = await this.r2.getFile(key);
    } catch (error) {
      if (error.Code === 'NoSuchKey') {
        this.logger.debug('File not found in S3: ' + key);
        throw new NotFoundException();
      }
      this.logger.error('Error getting file from S3: ' + error);
      throw new InternalServerErrorException();
    }

    const readableStream = s3Response.Body.transformToWebStream();

    res.set({
      'Content-Type': s3Response.ContentType || 'application/octet-stream',
      'Content-Length': s3Response.ContentLength?.toString() || '',
      // prevent search engines from indexing media
      'X-Robots-Tag': 'noindex',
    });

    // pipe the WebStream to the response
    readableStream.pipeTo(
      new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        },
      }),
    );
  }

  @Post(':category/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Media created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async createMedia(
    @User() user: ReqUser,
    @Param('category', ValidateMediaCategoryPipe)
    category: LowercasedMediaCategory,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const createMediaDto: CreateMediaDto = {
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
      },
    };
    return this.mediaService.createMedia(
      user.id,
      mediaCategoryMap[category],
      id,
      createMediaDto,
    );
  }

  @Delete(':category/:key')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Media deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteMedia(
    @User() user: ReqUser,
    @Param('category', ValidateMediaCategoryPipe)
    category: LowercasedMediaCategory,
    @Param('key') key: string,
  ) {
    return this.mediaService.deleteMedia(user.id, mediaCategoryMap[category], {
      key,
    });
  }

  @Patch('profile-pic')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ description: 'Profile picture updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProfilePic(
    @User() user: ReqUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { url } = await this.mediaService.updateProfilePic(user.id, file);
    return { url };
  }
}
