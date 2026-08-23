import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
//import { VerifyEmailDto } from './dto/verify-email.dto';
//import { ResendVerificationDto } from './dto/resend-verification.dto';

import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { GetUser } from './decorators/get-user.decorator';

import { AuthGuard } from '@nestjs/passport';

import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@GetUser() user: any) {
    return user;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }
/*
  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result =
      await this.authService.verifyEmail(dto);

    this.setAuthCookie(
      response,
      result.access_token,
    );

    return {
      message:
        'Email verified successfully.',
      user: result.user,
    };
  }

  @Post('resend-verification')
  async resendVerification(
    @Body()
    dto: ResendVerificationDto,
  ) {
    return this.authService.resendVerificationCode(
      dto.email,
    );
  }
*/
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response,
  ) {
    const result =
      await this.authService.login(dto);

    this.setAuthCookie(
      response,
      result.access_token,
    );

    return {
      message: 'Login successful',
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() req: any,
    @Res() response: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL ??
      'http://localhost:5173';

    try {
      const result =
        await this.authService.loginWithGoogle(
          req.user,
        );

      this.setAuthCookie(
        response,
        result.access_token,
      );

      return response.redirect(
        `${frontendUrl}/dashboard`,
      );
    } catch (error) {
      console.error(
        'Google authentication error:',
        error,
      );

      return response.redirect(
        `${frontendUrl}/login?oauth=error`,
      );
    }
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Request() req: any,
    @Res() response: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL ??
      'http://localhost:5173';

    try {
      if (!req.user?.email) {
        return response.redirect(
          `${frontendUrl}/login?oauth=email_required`,
        );
      }

      const result =
        await this.authService.loginWithGithub({
          githubId: req.user.githubId,
          email: req.user.email,
        });

      this.setAuthCookie(
        response,
        result.access_token,
      );

      return response.redirect(
        `${frontendUrl}/dashboard`,
      );
    } catch (error) {
      console.error(
        'GitHub authentication error:',
        error,
      );

      return response.redirect(
        `${frontendUrl}/login?oauth=error`,
      );
    }
  }

  @Post('logout')
  logout(
    @Res({ passthrough: true })
    response: Response,
  ) {
    const isProduction =
    process.env.NODE_ENV === 'production';
    response.clearCookie(
      'access_token',
      {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
      },
    );

    return {
      message: 'Logged out',
    };
  }

  private setAuthCookie(
    response: Response,
    token: string,
  ) {
      const isProduction =
    process.env.NODE_ENV === 'production';
    response.cookie(
      'access_token',
      token,
      {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge:
          1000 *
          60 *
          15,
        path: '/',
      },
    );
  }
}