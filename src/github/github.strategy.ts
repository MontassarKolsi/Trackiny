import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  'github',
) {

  constructor(
    private configService: ConfigService,
  ) {

    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing GitHub OAuth environment variables');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email', 'read:user'],
    });

  }


  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {


    return {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value,
      accessToken,
    };
  }

}