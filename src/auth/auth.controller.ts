import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { ReqUser, User } from './user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
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
    @Param('id', ParseIntPipe) id: number,
    @Body() { password }: Omit<AuthDto, 'username'>,
  ) {
    return this.authService.changePw(id, password);
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
