import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserDto } from './dto/user.dto';
import { UserAuthDto } from './dto/user-auth.dto';
import { AuthService } from './auth.service';
import { User } from './user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register or login a user' })
  @ApiCreatedResponse({ type: UserDto, description: 'User registered' })
  @ApiOkResponse({ type: UserDto, description: 'User logged in' })
  @Post('login')
  async login(@Body() userAuthDto: UserAuthDto) {
    return await this.authService.login(userAuthDto);
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
