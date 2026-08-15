import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [

    PrismaModule,

    EmailModule,

    PassportModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({

      imports: [
        ConfigModule,
      ],

      inject: [
        ConfigService,
      ],

      useFactory:
        (
          configService: ConfigService,
        ) => ({

          secret:
            configService.getOrThrow<string>(
              'JWT_SECRET',
            ),

          signOptions: {
            expiresIn: '7d',
          },

        }),

    }),

  ],

  controllers: [
    AuthController,
  ],

  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}