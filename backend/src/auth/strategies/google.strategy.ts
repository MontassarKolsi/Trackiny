import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    configService: ConfigService,
  ) {
    const clientID =
      configService.get<string>(
        'GOOGLE_CLIENT_ID',
      );

    const clientSecret =
      configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
      );

    const callbackURL =
      configService.get<string>(
        'GOOGLE_CALLBACK_URL',
      );

    if (
      !clientID ||
      !clientSecret ||
      !callbackURL
    ) {
      throw new Error(
        'Missing Google OAuth environment variables',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: [
        'email',
        'profile',
      ],
    });
  }

  authorizationParams() {
    return {
      prompt: 'select_account',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const email =
      profile.emails?.[0]?.value;

    if (!email) {
      throw new Error(
        'Google account does not have an email address.',
      );
    }

    return {
      googleId: profile.id,
      email,
      name:
        profile.displayName ??
        null,
      accessToken,
    };
  }
}