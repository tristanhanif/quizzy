import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SetRoleDto } from './dto/register.dto';
import { SkipRoleCheck } from '../common/decorators/skip-role-check.decorator';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @SkipRoleCheck()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(registerDto);
    res.cookie('quizzy_access_token', result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('login')
  @SkipRoleCheck()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    res.cookie('quizzy_access_token', result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('google-login')
  @SkipRoleCheck()
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: { idToken: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleLogin(dto);
    res.cookie('quizzy_access_token', result.accessToken, COOKIE_OPTIONS);
    return result;
  }

  @Post('set-role')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async setRole(@Request() req, @Body() dto: SetRoleDto) {
    return this.authService.setRole(req.user.userId, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('quizzy_access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
