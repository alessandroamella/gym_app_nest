import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { ReqUser, User } from './user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  OmitType,
} from '@nestjs/swagger';
import { GetProfileDto } from './dto/get-profile.dto';
import { InternalAuthGuard } from './internal-auth.guard';
import { DeviceTokenDto } from './dto/deviceToken.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @UseGuards(InternalAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Internal API call! For creating users',
    type: AuthDto,
  })
  @ApiOkResponse({ description: 'Signup successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async signup(@Body() authDto: AuthDto) {
    return this.authService.createUser(authDto);
  }

  @Patch('password/:id')
  @UseGuards(InternalAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Internal API call! For updating user password',
    type: OmitType(AuthDto, ['username']),
  })
  @ApiOkResponse({ description: 'Password updated' })
  @ApiUnauthorizedResponse({ description: 'Invalid user id' })
  async updatePassword(
    @Param('id') id: string,
    @Body() { password }: Omit<AuthDto, 'username'>,
  ) {
    return this.authService.changePw(+id, password);
  }

  @Post('login')
  @ApiBody({ type: AuthDto })
  @ApiOkResponse({ description: 'Login successful' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Fetch user profile', type: GetProfileDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(@User() user: ReqUser) {
    return this.authService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Profile updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProfile(@User() user: ReqUser, @Body() body: UpdateProfileDto) {
    return this.authService.updateProfile(user.id, body);
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
    const { url } = await this.authService.updateProfilePic(user.id, file);
    return { url };
  }

  @Patch('device-token')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: DeviceTokenDto })
  @ApiOkResponse({ description: 'Device token updated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateDeviceToken(
    @User() user: ReqUser,
    @Body() { token }: DeviceTokenDto,
  ) {
    return this.authService.setDeviceToken(user.id, token);
  }
}
