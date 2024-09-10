import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto, UserAuthDto, UserDto } from './user.dto';
import { AuthService } from './auth.service';
import { User } from './user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('auth')
@Controller('auth')
@ApiInternalServerErrorResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error.',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Upserts a user' })
  @ApiCreatedResponse({ type: LoginDto, description: 'User registered.' })
  @ApiOkResponse({ type: LoginDto, description: 'User logged in.' })
  @ApiConsumes('multipart/form-data')
  @ApiBadRequestResponse({
    description: 'Invalid input data.',
  })
  @UseInterceptors(FileInterceptor('profilePic'))
  @Post('login')
  async login(
    @Body() userAuthDto: UserAuthDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /^image\/(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    profilePic?: Express.Multer.File,
  ) {
    return await this.authService.login({ ...userAuthDto, profilePic });
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved.',
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@User() user: UserDto) {
    return user;
  }
}
