import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GithubService } from './github.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GithubAuthGuard } from './github-auth.guard';

@Controller('github')
export class GithubController {
    constructor(
        private readonly githubService: GithubService,
    ) { }

    @Get('connect')
    @UseGuards(JwtAuthGuard, GithubAuthGuard)
    connectGithub() {

    }

    @Get('callback')
    @UseGuards(GithubAuthGuard)
    githubCallback(
        @Request() req
    ) {

        console.log("GitHub user");
        console.log(req.user);

        return {
            user: req.user,
            state: req.query.state
        };

    }
}
