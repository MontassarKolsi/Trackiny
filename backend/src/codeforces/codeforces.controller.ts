import {
  Controller,
  Get,
  UseGuards,
  Request,
  Res,
  Query,
} from '@nestjs/common';

import type { Response } from 'express';

import { randomBytes } from 'crypto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CodeforcesService } from './codeforces.service';

import { CodeforcesStateService } from './codeforces-state.service';

@Controller('codeforces')
export class CodeforcesController {
  constructor(
    private readonly codeforcesService: CodeforcesService,
    private readonly stateService: CodeforcesStateService,
  ) { }


  @Get('connect')
  @UseGuards(JwtAuthGuard)
  async connect(
    @Request() req: any,
    @Res() response: Response,
  ) {
    const userId = req.user.id;

    const state = randomBytes(32).toString('hex');

    const nonce = randomBytes(32).toString('hex');

    this.stateService.createState(
      userId,
      nonce,
      state,
    );

    const authorizationUrl =
      await this.codeforcesService.createAuthorizationUrl(
        state,
        nonce,
      );

    return response.redirect(
      authorizationUrl,
    );
  }

  /**/

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(
    @Request() req: any,
  ) {
    return this.codeforcesService.getDashboard(
      req.user.id,
    );
  }
/**/

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() response: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL ??
      'http://localhost:5173';

    if (error) {
      return response.redirect(
        `${frontendUrl}/dashboard?codeforces=cancelled`,
      );
    }

    if (!code || !state) {
      return response.redirect(
        `${frontendUrl}/dashboard?codeforces=error`,
      );
    }

    const stored =
      this.stateService.consumeState(
        state,
      );

    if (!stored) {
      return response.redirect(
        `${frontendUrl}/dashboard?codeforces=invalid_state`,
      );
    }

    try {
      await this.codeforcesService.handleCallback(
        code,
        stored.nonce,
        stored.userId,
      );

      return response.redirect(
        `${frontendUrl}/dashboard?codeforces=connected`,
      );
    } catch (error: any) {
      console.error(
        'Codeforces callback error:',
        error,
      );

      if (
        error?.status === 409 ||
        error?.statusCode === 409
      ) {
        return response.redirect(
          `${frontendUrl}/dashboard?codeforces=already_connected`,
        );
      }

      return response.redirect(
        `${frontendUrl}/dashboard?codeforces=error`,
      );
    }
  }


}