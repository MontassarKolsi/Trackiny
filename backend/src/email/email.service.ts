import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const apiKey =
      this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error(
        'Missing RESEND_API_KEY environment variable',
      );
    }

    this.resend = new Resend(apiKey);

    this.from =
      this.configService.get<string>('EMAIL_FROM') ??
      'Trackiny <onboarding@resend.dev>';
  }

  async sendVerificationCode(
    email: string,
    code: string,
  ): Promise<void> {
    const { error } =
      await this.resend.emails.send({
        from: this.from,
        to: [email],
        subject: 'Verify your Trackiny email',
        html: `
          <!DOCTYPE html>
          <html>
            <body
              style="
                margin:0;
                padding:0;
                background:#f1f5f9;
                font-family:Arial,sans-serif;
              "
            >
              <div
                style="
                  max-width:520px;
                  margin:40px auto;
                  background:white;
                  border-radius:16px;
                  padding:40px;
                  box-shadow:0 4px 20px rgba(0,0,0,.08);
                "
              >
                <h1
                  style="
                    margin:0 0 12px;
                    font-size:28px;
                    color:#111827;
                  "
                >
                  Welcome to Trackiny
                </h1>

                <p
                  style="
                    color:#6b7280;
                    font-size:16px;
                    line-height:1.6;
                  "
                >
                  Use the verification code below to verify
                  your email address.
                </p>

                <div
                  style="
                    margin:30px 0;
                    padding:20px;
                    background:#f8fafc;
                    border-radius:12px;
                    text-align:center;
                  "
                >
                  <span
                    style="
                      font-size:36px;
                      font-weight:bold;
                      letter-spacing:8px;
                      color:#111827;
                    "
                  >
                    ${code}
                  </span>
                </div>

                <p
                  style="
                    color:#6b7280;
                    font-size:14px;
                    line-height:1.6;
                  "
                >
                  This code expires in 10 minutes.
                  If you did not create a Trackiny account,
                  you can safely ignore this email.
                </p>

                <p
                  style="
                    margin-top:30px;
                    color:#9ca3af;
                    font-size:13px;
                  "
                >
                  Trackiny
                </p>
              </div>
            </body>
          </html>
        `,
      });

    if (error) {
      console.error(
        'Resend email error:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to send verification email.',
      );
    }
  }
}