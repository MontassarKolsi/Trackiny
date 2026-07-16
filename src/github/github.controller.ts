import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GithubAuthGuard } from './github-auth.guard';
import { GithubStateService } from './github-state.service';

@Controller('github')
export class GithubController {

    constructor(
        private readonly githubService: GithubService,
        private readonly githubStateService: GithubStateService,
    ) { }


    @Get('connect')
    @UseGuards(GithubAuthGuard)
    connectGithub() {

    }


    @Get('callback')
    @UseGuards(GithubAuthGuard)
    async githubCallback(
        @Request() req
    ) {

        const state = req.query.state;

        const userId =
            this.githubStateService.consumeState(state);


        const githubAccount =
            await this.githubService.connectGithub(
                userId!,
                req.user,
            );


        return {
            message: "GitHub connected successfully",
            githubAccount:{
        id: githubAccount.id,
        username: githubAccount.username,
    },
        };

    }

}