// comment/comment.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User, ReqUser } from '../auth/user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('comment')
@ApiTags('comment')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('workout/:workoutId')
  @ApiBody({ type: CreateCommentDto })
  @ApiOkResponse({ description: 'Comment created' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @User() user: ReqUser,
    @Param('workoutId', ParseIntPipe) workoutId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(user.id, workoutId, createCommentDto);
  }

  @Get('workout/:workoutId')
  @ApiOkResponse({ description: 'List of comments for the workout' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Param('workoutId', ParseIntPipe) workoutId: number) {
    return this.commentService.findAll(workoutId);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Comment deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  remove(@User() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.remove(user.id, id);
  }
}
