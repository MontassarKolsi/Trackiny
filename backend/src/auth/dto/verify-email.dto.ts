import {
  IsEmail,
  Matches,
} from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @Matches(/^\d{6}$/, {
    message:
      'Verification code must be exactly 6 digits.',
  })
  code: string;
}