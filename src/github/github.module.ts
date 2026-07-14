import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { GithubStrategy } from './github.strategy';
import { GithubStateService } from './github-state.service';

@Module({
  providers: [GithubService, GithubStrategy, GithubStateService],
  controllers: [GithubController]
})
export class GithubModule {}
