import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

import * as bcrypt from 'bcrypt';

import { JwtService } from '@nestjs/jwt';
//import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {

  private readonly VERIFICATION_EXPIRATION_MINUTES = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    //   private readonly emailService: EmailService,
  ) { }

  private generateVerificationCode(): string {
    return Math.floor(
      100000 +
      Math.random() * 900000,
    ).toString();
  }

  async register(dto: RegisterDto) {

    const email =
      dto.email.trim().toLowerCase();

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Email already registered.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );
    /*
        const code =
          this.generateVerificationCode();
    
        const codeHash =
          await bcrypt.hash(
            code,
            10,
          );
    
        const expiresAt =
          new Date(
            Date.now() +
            this.VERIFICATION_EXPIRATION_MINUTES *
            60 *
            1000,
          );
    
        await this.prisma.emailVerification.upsert({
    
          where: {
            email,
          },
    
          update: {
            passwordHash,
            codeHash,
            expiresAt,
          },
    
          create: {
            email,
            passwordHash,
            codeHash,
            expiresAt,
          },
    
        });
    
        await this.emailService.sendVerificationCode(
          email,
          code,
        );
    
        return {
          message:
            'Verification code sent.',
          email,
        };
        */
    const user =
      await this.prisma.user.create({
        data: {
          email,
          password: passwordHash,
        },
      });
    const payload = {
      sub: user.id,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );
    return {
      message: 'Registration successful.',
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
  /*
    async verifyEmail(
      dto: VerifyEmailDto,
    ) {
  
      const email =
        dto.email.trim().toLowerCase();
  
      const verification =
        await this.prisma.emailVerification.findUnique({
          where: {
            email,
          },
        });
  
      if (!verification) {
        throw new BadRequestException(
          'No pending email verification found.',
        );
      }
  
      if (
        verification.expiresAt.getTime() <
        Date.now()
      ) {
  
        await this.prisma.emailVerification.delete({
          where: {
            email,
          },
        });
  
        throw new BadRequestException(
          'Verification code expired. Please request a new one.',
        );
      }
  
      const validCode =
        await bcrypt.compare(
          dto.code,
          verification.codeHash,
        );
  
      if (!validCode) {
        throw new BadRequestException(
          'Invalid verification code.',
        );
      }
  
      const existingUser =
        await this.prisma.user.findUnique({
          where: {
            email,
          },
        });
  
      if (existingUser) {
  
        await this.prisma.emailVerification.delete({
          where: {
            email,
          },
        });
  
        throw new ConflictException(
          'Email already registered.',
        );
      }
  
      const user =
        await this.prisma.user.create({
          data: {
            email,
            password:
              verification.passwordHash,
          },
        });
  
      await this.prisma.emailVerification.delete({
        where: {
          email,
        },
      });
  
      const payload = {
        sub: user.id,
      };
  
      const accessToken =
        await this.jwtService.signAsync(
          payload,
        );
  
      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    }
  
    async resendVerificationCode(
      emailInput: string,
    ) {
  
      const email =
        emailInput.trim().toLowerCase();
  
      const verification =
        await this.prisma.emailVerification.findUnique({
          where: {
            email,
          },
        });
  
      if (!verification) {
        throw new BadRequestException(
          'No pending registration found for this email.',
        );
      }
  
      const code =
        this.generateVerificationCode();
  
      const codeHash =
        await bcrypt.hash(
          code,
          10,
        );
  
      const expiresAt =
        new Date(
          Date.now() +
          this.VERIFICATION_EXPIRATION_MINUTES *
          60 *
          100,
        );
  
      await this.prisma.emailVerification.update({
  
        where: {
          email,
        },
  
        data: {
          codeHash,
          expiresAt,
        },
  
      });
  
      await this.emailService.sendVerificationCode(
        email,
        code,
      );
  
      return {
        message:
          'A new verification code has been sent.',
      };
    }
  */
  async login(dto: LoginDto) {

    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid credentials.',
      );
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account does not use password login.',
      );
    }

    const validPassword =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!validPassword) {
      throw new UnauthorizedException(
        'Invalid credentials.',
      );
    }

    const payload = {
      sub: user.id,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      access_token: accessToken,
    };
  }

  async loginWithGoogle(
    googleData: {
      googleId: string;
      email: string;
      name?: string | null;
    },
  ) {
    const email =
      googleData.email
        .trim()
        .toLowerCase();

    let user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    /*
     * If the email already belongs to a user,
     * make sure the Google account is linked.
     */
    if (user) {
      if (
        user.googleId &&
        user.googleId !== googleData.googleId
      ) {
        throw new ConflictException(
          'This email is already linked to another Google account.',
        );
      }

      if (!user.googleId) {
        user =
          await this.prisma.user.update({
            where: {
              id: user.id,
            },

            data: {
              googleId:
                googleData.googleId,
            },
          });
      }
    }

    /*
     * No existing email:
     * create a new Google-only account.
     */
    else {
      user =
        await this.prisma.user.create({
          data: {
            email,
            googleId:
              googleData.googleId,
            password: null,
          },
        });
    }

    const payload = {
      sub: user.id,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      access_token: accessToken,

      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async loginWithGithub(
    githubData: {
      githubId: string;
      email: string;
    },
  ) {
    const email =
      githubData.email
        .trim()
        .toLowerCase();

    let user =
      await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (user) {
      /*
       * Existing Trackiny account.
       *
       * The GitHub account itself is handled
       * by GithubService when connecting GitHub.
       */
    } else {
      user =
        await this.prisma.user.create({
          data: {
            email,
            password: null,
          },
        });
    }

    const payload = {
      sub: user.id,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
      );

    return {
      access_token: accessToken,

      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}