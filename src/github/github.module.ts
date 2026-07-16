import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { GithubStrategy } from './github.strategy';
import { GithubStateService } from './github-state.service';
import { GithubAuthGuard } from './github-auth.guard';
import { GithubEncryptionService } from './github-encryption.service';

@Module({
  providers: [GithubService, GithubStrategy, GithubStateService, GithubAuthGuard, GithubEncryptionService],
  controllers: [GithubController]
})
export class GithubModule {}
