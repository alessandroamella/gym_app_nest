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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserAuthDto, UserDto } from './user.dto';
import { AuthService } from './auth.service';
import { User } from './user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Upserts a user' })
  @ApiCreatedResponse({ type: UserDto, description: 'User registered' })
  @ApiOkResponse({ type: UserDto, description: 'User logged in' })
  @ApiConsumes('multipart/form-data') // Indicates file upload in Swagger
  @UseInterceptors(FileInterceptor('profilePic')) // Handles file upload
  @Post('login')
  async login(
    @Body() userAuthDto: UserAuthDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
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
  @ApiOkResponse({ type: UserDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@User() user: UserDto) {
    return user;
  }
}
