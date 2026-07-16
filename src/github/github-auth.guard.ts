import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubStateService } from './github-state.service';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {

  constructor(
    private readonly githubStateService: GithubStateService,
  ) {
    super();
  }

  private request: any;

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    this.request = context.switchToHttp().getRequest();

    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions() {
const testUserId = "438e5f2f-29e5-4434-ad74-d72dc477b11a";
    const state = this.githubStateService.createState(
      testUserId,
    );

    return {
      state,
    };
  }

}