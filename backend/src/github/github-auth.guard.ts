import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GithubStateService } from "./github-state.service";

@Injectable()
export class GithubAuthGuard extends AuthGuard("github") {

  constructor(
    private readonly githubStateService: GithubStateService,
  ) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {

    const request = context.switchToHttp().getRequest();

    if (request.path === "/github/connect") {

      const userId = request.user.id;

      return {
        state: this.githubStateService.createState(userId),
      };
    }

    return {};
  }

}