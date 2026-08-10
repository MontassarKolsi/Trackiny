import {
    Controller,
    Get,
    UseGuards,
    Request,
    Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GithubAuthGuard } from './github-auth.guard';
import { GithubStateService } from './github-state.service';

@Controller('github')
export class GithubController {

    constructor(
        private readonly githubService: GithubService,
        private readonly githubStateService: GithubStateService,
    ) {}


    @Get('connect')
    @UseGuards(JwtAuthGuard, GithubAuthGuard)
    connectGithub() {
        // Passport handles the redirect to GitHub.
    }


    @Get('callback')
    @UseGuards(GithubAuthGuard)
    async githubCallback(
        @Request() req,
        @Res() response: Response,
    ) {

        const frontendUrl =
            process.env.FRONTEND_URL ??
            'http://localhost:5173';


        const state = req.query.state;

        const userId =
            this.githubStateService.consumeState(state);


        if (!userId) {

            return response.redirect(
                `${frontendUrl}/dashboard?github=error&message=invalid_state`,
            );

        }


        try {

            await this.githubService.connectGithub(
                userId,
                req.user,
            );


            return response.redirect(
                `${frontendUrl}/dashboard?github=connected`,
            );

        } catch (error: any) {

            if (
                error?.status === 409 ||
                error?.statusCode === 409
            ) {

                return response.redirect(
                    `${frontendUrl}/dashboard?github=already_connected`,
                );

            }


            console.error(
                'GitHub callback error:',
                error,
            );


            return response.redirect(
                `${frontendUrl}/dashboard?github=error`,
            );

        }

    }


    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    getDashboard(@Request() req) {

        return this.githubService.getGithubDashboard(
            req.user.id,
        );

    }

}