import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ReqUser, User } from '../auth/user.decorator';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'shared/dto/pagination-query.dto';
import { GetAllPostsResponseDto } from './dto/get-all-post.dto';
import { CloudflareR2Service } from 'cloudflare-r2/cloudflare-r2.service';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Response } from 'express';

@Controller('post')
@ApiTags('post')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PostController {
  constructor(
    private postService: PostService,
    private r2: CloudflareR2Service,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post()
  @ApiBody({ type: CreatePostDto })
  @ApiOkResponse({ description: 'Post created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async create(@User() user: ReqUser, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(user.id, createPostDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'List of posts',
    type: [GetAllPostsResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items to return',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.postService.findAll(query);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Post deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@User() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    return this.postService.remove(user.id, id);
  }

  @Post(':id/like')
  @ApiCreatedResponse({ description: 'Post liked' })
  @ApiOkResponse({ description: 'Post unliked' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async like(
    @User() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const [status, like] = await this.postService.toggleLike(user.id, id);
    return res.status(status).json(like);
  }
}
