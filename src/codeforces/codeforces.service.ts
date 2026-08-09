import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpService } from '@nestjs/axios';

import { PrismaService } from '../prisma/prisma.service';

import { randomUUID } from 'crypto';

export interface CodeforcesProfile {
  id: string;
  handle: string;
  rating: number | null;
  avatarUrl: string | null;
}

export interface ContributionDay {
  date: string;
  count: number;
}

@Injectable()
export class CodeforcesService {
  // REMOVED: Hardcoded discovery URL - will use environment variable instead

  private oidcConfiguration:
    | {
      issuer: string;
      authorization_endpoint: string;
      token_endpoint: string;
      jwks_uri?: string;
      userinfo_endpoint?: string;
    }
    | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) { }

  /*
   * ----------------------------------------------------
   * OIDC configuration
   * ----------------------------------------------------
   */

  private async getOidcConfiguration() {
    if (this.oidcConfiguration) {
      return this.oidcConfiguration;
    }

    // Get discovery URL from environment variable
    const discoveryUrl =
      process.env.CODEFORCES_OIDC_DISCOVERY_URL;

    if (!discoveryUrl) {
      throw new InternalServerErrorException(
        'CODEFORCES_OIDC_DISCOVERY_URL is not configured in environment variables.',
      );
    }

    try {
      const response =
        await this.http.axiosRef.get(
          discoveryUrl,
        );

      const configuration =
        response.data;
      if (
        !configuration?.issuer ||
        !configuration?.authorization_endpoint ||
        !configuration?.token_endpoint
      ) {
        throw new Error(
          'Incomplete Codeforces OIDC configuration.',
        );
      }

      this.oidcConfiguration = {
        issuer: configuration.issuer,
        authorization_endpoint:
          configuration.authorization_endpoint,
        token_endpoint:
          configuration.token_endpoint,
        jwks_uri:
          configuration.jwks_uri,
        userinfo_endpoint:
          configuration.userinfo_endpoint,
      };

      return this.oidcConfiguration;
    } catch (error) {
      console.error(
        'Failed to load Codeforces OIDC configuration:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to load Codeforces OIDC configuration. Please check the discovery URL.',
      );
    }
  }

  /*
   * ----------------------------------------------------
   * Start OIDC login
   * ----------------------------------------------------
   */

  async createAuthorizationUrl(
    state: string,
    nonce: string,
  ) {
    const configuration =
      await this.getOidcConfiguration();

    const clientId =
      process.env.CODEFORCES_CLIENT_ID;

    const callbackUrl =
      process.env.CODEFORCES_CALLBACK_URL;

    if (
      !clientId ||
      !callbackUrl
    ) {
      throw new InternalServerErrorException(
        'Codeforces OAuth configuration is missing.',
      );
    }

    const url =
      new URL(
        configuration.authorization_endpoint,
      );

    url.searchParams.set(
      'client_id',
      clientId,
    );

    url.searchParams.set(
      'redirect_uri',
      callbackUrl,
    );

    url.searchParams.set(
      'response_type',
      'code',
    );

    url.searchParams.set(
      'scope',
      'openid',
    );

    url.searchParams.set(
      'state',
      state,
    );

    url.searchParams.set(
      'nonce',
      nonce,
    );

    return url.toString();
  }

  /*
   * ----------------------------------------------------
   * Handle callback
   * ----------------------------------------------------
   */

  async handleCallback(
    code: string,
    expectedNonce: string,
    userId: string,
  ) {
    const configuration =
      await this.getOidcConfiguration();

    const clientId =
      process.env.CODEFORCES_CLIENT_ID;

    const clientSecret =
      process.env.CODEFORCES_CLIENT_SECRET;

    const callbackUrl =
      process.env.CODEFORCES_CALLBACK_URL;

    if (
      !clientId ||
      !clientSecret ||
      !callbackUrl
    ) {
      throw new InternalServerErrorException(
        'Codeforces OAuth configuration is missing.',
      );
    }

    /*
     * Exchange authorization code
     * for tokens.
     */

    let tokenResponse;

    try {
      tokenResponse =
        await this.http.axiosRef.post(
          configuration.token_endpoint,
          new URLSearchParams({
            grant_type:
              'authorization_code',

            code,

            redirect_uri:
              callbackUrl,

            client_id:
              clientId,

            client_secret:
              clientSecret,
          }).toString(),
          {
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
            },
          },
        );
    } catch (error: any) {
      console.error(
        'Codeforces token exchange failed:',
        error?.response?.data ??
        error,
      );

      throw new BadRequestException(
        'Codeforces authentication failed.',
      );
    }

    const idToken =
      tokenResponse.data?.id_token;

    if (!idToken) {
      throw new BadRequestException(
        'Codeforces did not return an ID token.',
      );
    }

    /*
     * Verify the ID token cryptographically.
     */
    const jose = await import('jose');

    // Convert the client secret to a Uint8Array for jose
    const secret = new TextEncoder().encode(clientSecret);

    let claims;

    try {
      const verified = await jose.jwtVerify(
        idToken,
        secret,  // Use the client secret directly, not JWKS
        {
          issuer: configuration.issuer,
          audience: clientId,
          algorithms: ['HS256'], // Explicitly specify HS256
        }
      );
      claims = verified.payload;
    } catch (error) {
      console.error('Codeforces ID token verification failed:', error);
      throw new BadRequestException('Invalid Codeforces identity token.');
    }

    /*
     * Verify nonce.
     */

    if (
      claims.nonce !==
      expectedNonce
    ) {
      throw new BadRequestException(
        'Invalid Codeforces authentication state.',
      );
    }

    /*
     * Codeforces OIDC provides the
     * user's stable subject and handle.
     */

    const codeforcesId =
      String(claims.sub ?? '');

    const handle =
      String(claims.handle ?? '');

    const rating =
      typeof claims.rating === 'number'
        ? claims.rating
        : null;

    const avatarUrl =
      typeof claims.avatar === 'string'
        ? claims.avatar
        : null;

    if (
      !codeforcesId ||
      !handle
    ) {
      throw new BadRequestException(
        'Codeforces identity information is incomplete.',
      );
    }

    /*
     * Check whether this Codeforces
     * identity is already linked.
     */

    const existingById =
      await this.prisma.codeforcesAccount.findUnique(
        {
          where: {
            codeforcesId,
          },
        },
      );

    if (
      existingById &&
      existingById.userId !== userId
    ) {
      throw new ConflictException(
        'This Codeforces account is already linked to another Trackiny account.',
      );
    }

    /*
     * Also protect the handle.
     */

    const existingByHandle =
      await this.prisma.codeforcesAccount.findUnique(
        {
          where: {
            handle,
          },
        },
      );

    if (
      existingByHandle &&
      existingByHandle.userId !== userId
    ) {
      throw new ConflictException(
        'This Codeforces account is already linked to another Trackiny account.',
      );
    }

    /*
     * If the Trackiny user already has
     * another Codeforces account, replace it.
     */

    const existingForUser =
      await this.prisma.codeforcesAccount.findUnique(
        {
          where: {
            userId,
          },
        },
      );

    if (
      existingForUser &&
      existingForUser.codeforcesId !==
      codeforcesId
    ) {
      throw new ConflictException(
        'This Trackiny account is already linked to another Codeforces account.',
      );
    }

    /*
     * Save the verified account.
     */

    await this.prisma.codeforcesAccount.upsert(
      {
        where: {
          userId,
        },

        update: {
          codeforcesId,
          handle,
          rating,
          avatarUrl,
          verifiedAt:
            new Date(),
        },

        create: {
          userId,
          codeforcesId,
          handle,
          rating,
          avatarUrl,
          verifiedAt:
            new Date(),
        },
      },
    );

    /*
     * Sync contribution data.
     */

    await this.syncContributions(
      userId,
      handle,
    );

    return {
      success: true,
      handle,
    };
  }

  /*
   * ----------------------------------------------------
   * Get dashboard
   * ----------------------------------------------------
   */

  async getDashboard(
    userId: string,
  ) {
    const account =
      await this.prisma.codeforcesAccount.findUnique(
        {
          where: {
            userId,
          },
        },
      );

    if (!account) {
      throw new NotFoundException(
        'Codeforces account not connected.',
      );
    }

    /*
     * Check cache.
     *
     * We use the cache immediately instead
     * of hitting Codeforces every dashboard load.
     */

    const cache =
      await this.prisma.contributionCache.findUnique(
        {
          where: {
            userId_platform: {
              userId,
              platform: 'codeforces',
            },
          },
        },
      );

    /*
     * Refresh if cache is older than 1 hour.
     */

    const shouldRefresh =
      !cache ||
      Date.now() -
      cache.lastSyncedAt.getTime() >
      60 * 60 * 1000;

    if (shouldRefresh) {
      await this.syncContributions(
        userId,
        account.handle,
      );
    }

    const freshCache =
      await this.prisma.contributionCache.findUnique(
        {
          where: {
            userId_platform: {
              userId,
              platform: 'codeforces',
            },
          },
        },
      );

    const activeDays =
      this.parseCachedDays(
        freshCache?.data,
      );

    return {
      codeforces: {
        handle: account.handle,
        rating: account.rating,
        avatarUrl:
          account.avatarUrl,
        verifiedAt:
          account.verifiedAt,
        profileUrl:
          `https://codeforces.com/profile/${encodeURIComponent(account.handle)}`,
      },

      activeDays,
    };
  }

  /*
   * ----------------------------------------------------
   * Synchronize submissions
   * ----------------------------------------------------
   */

  private async syncContributions(
    userId: string,
    handle: string,
  ) {
    const submissions =
      await this.getSubmissions(
        handle,
      );

    const today =
      new Date();

    today.setHours(
      23,
      59,
      59,
      999,
    );

    const oneYearAgo =
      new Date(today);

    oneYearAgo.setDate(
      oneYearAgo.getDate() -
      364,
    );

    const counts =
      new Map<string, number>();

    for (
      const submission of submissions
    ) {
      if (
        !submission?.creationTimeSeconds
      ) {
        continue;
      }

      const date =
        new Date(
          submission.creationTimeSeconds *
          1000,
        );

      /*
       * Ignore submissions outside
       * the heatmap range.
       */

      if (
        date < oneYearAgo ||
        date > today
      ) {
        continue;
      }

      /*
       * Use local date for the user's
       * calendar.
       *
       * Backend timezone should ideally
       * eventually be configurable.
       */

      const dateKey =
        this.formatDate(date);

      counts.set(
        dateKey,
        (counts.get(dateKey) ?? 0) +
        1,
      );
    }

    /*
     * Store ONLY active days.
     */

    const cachedData:
      ContributionDay[] =
      Array.from(
        counts.entries(),
      )
        .map(
          ([date, count]) => ({
            date,
            count,
          }),
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(
              b.date,
            ),
        );

    // Cast through unknown to satisfy Prisma's JSON type
    const jsonData = cachedData as unknown as Prisma.InputJsonValue;

    await this.prisma.contributionCache.upsert(
      {
        where: {
          userId_platform: {
            userId,
            platform: 'codeforces',
          },
        },

        update: {
          data: jsonData,
          lastSyncedAt:
            new Date(),
        },

        create: {
          userId,
          platform: 'codeforces',
          data: jsonData,
          lastSyncedAt:
            new Date(),
        },
      },
    );

    return cachedData;
  }

  /*
   * ----------------------------------------------------
   * Codeforces API
   * ----------------------------------------------------
   */

  private async getSubmissions(
    handle: string,
  ) {
    try {
      /*
       * Codeforces user.status returns
       * submissions ordered newest first.
       *
       * 10000 is intentionally used here
       * as a first implementation.
       */

      const response =
        await this.http.axiosRef.get(
          'https://codeforces.com/api/user.status',
          {
            params: {
              handle,
              from: 1,
              count: 10000,
            },
          },
        );

      if (
        response.data?.status !==
        'OK'
      ) {
        throw new Error(
          response.data?.comment ??
          'Codeforces API error.',
        );
      }

      return (
        response.data.result ?? []
      );
    } catch (error: any) {
      console.error(
        'Codeforces submissions request failed:',
        error?.response?.data ??
        error,
      );

      throw new BadRequestException(
        'Unable to retrieve Codeforces submissions.',
      );
    }
  }

  /*
   * ----------------------------------------------------
   * Helpers
   * ----------------------------------------------------
   */

  private formatDate(
    date: Date,
  ) {
    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        date.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private parseCachedDays(
    data: unknown,
  ): ContributionDay[] {
    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    return data
      .filter(
        (item) =>
          item &&
          typeof item ===
          'object' &&
          typeof
          (item as any).date ===
          'string' &&
          typeof
          (item as any).count ===
          'number' &&
          (item as any).count > 0,
      )
      .map(
        (item) => ({
          date:
            (item as any).date,

          count:
            (item as any).count,
        }),
      );
  }
}