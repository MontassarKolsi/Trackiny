import { api } from "./api";

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

/*
 * ============================================================
 * EMAIL VERIFICATION TYPES
 * CURRENTLY DORMANT
 * ============================================================
 */
/*
export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendVerificationDto {
  email: string;
}
*/
export const authApi = {

  async register(
    data: RegisterDto,
  ) {
    const response =
      await api.post(
        "/auth/register",
        data,
      );

    return response.data;
  },

  /*
   * ==========================================================
   * EMAIL VERIFICATION
   * CURRENTLY DISABLED
   *
   * Keep these methods.
   *
   * When email verification is re-enabled, simply remove
   * this comment and the methods are ready to use.
   * ==========================================================
   */

  /*
  async verifyEmail(
    data: VerifyEmailDto,
  ) {
    const response =
      await api.post(
        "/auth/verify-email",
        data,
      );

    return response.data;
  },

  async resendVerification(
    data: ResendVerificationDto,
  ) {
    const response =
      await api.post(
        "/auth/resend-verification",
        data,
      );

    return response.data;
  },
  */

  async login(
    data: LoginDto,
  ) {
    const response =
      await api.post(
        "/auth/login",
        data,
      );

    return response.data;
  },

  async logout() {
    const response =
      await api.post(
        "/auth/logout",
      );

    return response.data;
  },

};