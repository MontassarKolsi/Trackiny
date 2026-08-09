import {
  Body,
  Controller,
  Post,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

import type { Response } from 'express';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(
    @GetUser() user: any,
  ) {
    return user;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true })
    response: Response,
  ) {

    const result =
      await this.authService.register(dto);

    response.cookie(
      'access_token',
      result.access_token,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge:
          1000 * 60 * 60 * 24 * 7,
      },
    );

    return {
      message: 'Registration successful',
    };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response,
  ) {

    const result =
      await this.authService.login(dto);

    response.cookie(
      'access_token',
      result.access_token,
      {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge:
          1000 * 60 * 60 * 24 * 7,
      },
    );

    return {
      message: 'Login successful',
    };
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true })
    response: Response,
  ) {

    response.clearCookie(
      'access_token',
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      },
    );

    return {
      message: 'Logged out',
    };
  }
}