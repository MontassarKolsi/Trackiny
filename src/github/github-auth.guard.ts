import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {


  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const request =
      context.switchToHttp().getRequest();


    console.log("Before GitHub guard:");
    console.log(request.user);


    return super.canActivate(context) as Promise<boolean>;

  }



  getAuthenticateOptions(req:any){

    return {
      state: req.user?.id,
    };

  }


}