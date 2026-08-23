import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';


interface OidcConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  response_types_supported?: string[];
  scopes_supported?: string[];
  claims_supported?: string[];
  id_token_signing_alg_values_supported?: string[];
  token_endpoint_auth_methods_supported?: string[];
}

interface JWTPayload {
  [key: string]: unknown;
  iss?: string;
  sub?: string;
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

interface CodeforcesClaims extends JWTPayload {
  sub?: string;
  handle?: string;
  avatar?: string;
  rating?: number;
  nonce?: string;
}

export interface CodeforcesRatingPoint {
  contestId: number;
  contestName: string;
  rating: number;
  rank: number;
  date: string;
}

export interface ContributionDay {
  date: string;
  count: number;
}

interface CodeforcesSubmission {
  id: number;
  creationTimeSeconds: number;
  verdict?: string;
}



@Injectable()
export class CodeforcesService {
  private readonly oidcDiscoveryUrl =
    process.env.CODEFORCES_OIDC_DISCOVERY_URL ??
    'https://codeforces.com/.well-known/openid-configuration';

  private readonly clientId =
    process.env.CODEFORCES_CLIENT_ID ?? '';

  private readonly clientSecret =
    process.env.CODEFORCES_CLIENT_SECRET ?? '';

  private readonly callbackUrl =
    process.env.CODEFORCES_CALLBACK_URL ??
    'http://localhost:3000/codeforces/callback';


  private readonly CACHE_TTL_MS =
    10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) { }

  private async getOidcConfiguration(): Promise<OidcConfiguration> {
    if (!this.clientId || !this.clientSecret) {
      throw new InternalServerErrorException(
        'Codeforces OAuth credentials are not configured.',
      );
    }

    try {
      const response =
        await this.http.axiosRef.get(
          this.oidcDiscoveryUrl,
        );

      const configuration =
        response.data as OidcConfiguration;

      if (
        !configuration.issuer ||
        !configuration.authorization_endpoint ||
        !configuration.token_endpoint
      ) {
        throw new Error(
          'Incomplete Codeforces OIDC configuration.',
        );
      }

      return configuration;
    } catch (error) {
      console.error(
        'Failed to load Codeforces OIDC configuration:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to load Codeforces authentication configuration.',
      );
    }
  }

  async createAuthorizationUrl(
    state: string,
    nonce: string,
  ): Promise<string> {
    const configuration =
      await this.getOidcConfiguration();

    const params =
      new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.callbackUrl,
        scope: 'openid',
        state,
        nonce,
      });

    return `${configuration.authorization_endpoint}?${params.toString()}`;
  }

  private async exchangeCode(
    code: string,
  ) {
    const configuration =
      await this.getOidcConfiguration();

    try {
      const body =
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.callbackUrl,
          client_id: this.clientId,
          client_secret: this.clientSecret,
        });

      const response =
        await this.http.axiosRef.post(
          configuration.token_endpoint,
          body.toString(),
          {
            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
            },
          },
        );

      return response.data;
    } catch (error: any) {
      console.error(
        'Codeforces token exchange failed:',
        error?.response?.data ?? error,
      );

      throw new BadRequestException(
        'Unable to exchange Codeforces authorization code.',
      );
    }
  }

  async handleCallback(
    code: string,
    nonce: string,
    userId: string,
  ) {
    const configuration =
      await this.getOidcConfiguration();

    const tokenResponse =
      await this.exchangeCode(code);

    const idToken =
      tokenResponse?.id_token;

    if (!idToken) {
      throw new BadRequestException(
        'Codeforces did not return an identity token.',
      );
    }
    let claims: CodeforcesClaims;

    try {
      const secret =
        new TextEncoder().encode(
          this.clientSecret,
        );

      // Dynamic import for ESM module
      const { jwtVerify } = await import('jose');

      const verified =
        await jwtVerify(
          idToken,
          secret,
          {
            issuer:
              configuration.issuer,

            audience:
              this.clientId,

            algorithms: ['HS256'],
          },
        );

      claims =
        verified.payload as CodeforcesClaims;
    } catch (error) {
      console.error(
        'Codeforces ID token verification failed:',
        error,
      );

      throw new BadRequestException(
        'Invalid Codeforces identity token.',
      );
    }

    if (
      claims.nonce &&
      claims.nonce !== nonce
    ) {
      throw new BadRequestException(
        'Invalid Codeforces authentication nonce.',
      );
    }

    const codeforcesId =
      claims.sub;

    const handle =
      claims.handle;

    if (!codeforcesId || !handle) {
      throw new BadRequestException(
        'Codeforces identity information is incomplete.',
      );
    }

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
        'Your Trackiny account is already linked to another Codeforces account.',
      );
    }

    const account =
      await this.prisma.codeforcesAccount.upsert(
        {
          where: {
            userId,
          },

          update: {
            codeforcesId,
            handle,
            rating:
              typeof claims.rating ===
                'number'
                ? claims.rating
                : null,

            avatarUrl:
              typeof claims.avatar ===
                'string'
                ? claims.avatar
                : null,

            verifiedAt:
              new Date(),
          },

          create: {
            userId,
            codeforcesId,
            handle,

            rating:
              typeof claims.rating ===
                'number'
                ? claims.rating
                : null,

            avatarUrl:
              typeof claims.avatar ===
                'string'
                ? claims.avatar
                : null,

            verifiedAt:
              new Date(),
          },
        },
      );

    await this.refreshContributionCache(
      userId,
      account.handle,
    );

    return {
      success: true,
      account: {
        handle: account.handle,
        rating: account.rating,
        avatarUrl: account.avatarUrl,
        verifiedAt: account.verifiedAt,
      },
    };
  }

  private async getCodeforcesUser(
    handle: string,
  ) {
    try {
      const response =
        await this.http.axiosRef.get(
          'https://codeforces.com/api/user.info',
          {
            params: {
              handles: handle,
            },
          },
        );

      if (
        response.data?.status !==
        'OK'
      ) {
        return null;
      }

      return (
        response.data.result?.[0] ??
        null
      );
    } catch {
      return null;
    }
  }

  private async getSubmissions(
    handle: string,
  ): Promise<CodeforcesSubmission[]> {
    try {
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
          'Codeforces API returned an error.',
        );
      }

      return (
        response.data.result ?? []
      );
    } catch (error) {
      console.error(
        `Failed to fetch Codeforces submissions for ${handle}:`,
        error,
      );

      throw new InternalServerErrorException(
        'Unable to fetch Codeforces activity.',
      );
    }
  }

  private buildContributionDays(
    submissions: CodeforcesSubmission[],
  ): ContributionDay[] {
    const counts =
      new Map<string, number>();

    for (const submission of submissions) {
      if (
        !submission.creationTimeSeconds
      ) {
        continue;
      }

      const date =
        new Date(
          submission.creationTimeSeconds *
          1000,
        )
          .toISOString()
          .slice(0, 10);

      counts.set(
        date,
        (counts.get(date) ?? 0) + 1,
      );
    }

    return Array.from(
      counts.entries(),
    )
      .map(
        ([date, count]) => ({
          date,
          count,
        }),
      )
      .filter(
        (day) => day.count > 0,
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(
            b.date,
          ),
      );
  }

  private async refreshContributionCache(
    userId: string,
    handle: string,
  ) {
    const submissions =
      await this.getSubmissions(
        handle,
      );

    const cachedData =
      this.buildContributionDays(
        submissions,
      );

    await this.prisma.contributionCache.upsert(
      {
        where: {
          userId_platform: {
            userId,
            platform: 'codeforces',
          },
        },

        update: {
          data:
            cachedData as any,

          lastSyncedAt:
            new Date(),
        },

        create: {
          userId,
          platform: 'codeforces',

          data:
            cachedData as any,

          lastSyncedAt:
            new Date(),
        },
      },
    );

    return cachedData;
  }

  private async getCodeforcesRatingHistory(
    handle: string,
  ): Promise<CodeforcesRatingPoint[]> {
    try {
      const response =
        await this.http.axiosRef.get(
          'https://codeforces.com/api/user.rating',
          {
            params: {
              handle,
            },
          },
        );

      if (
        response.data?.status !==
        'OK'
      ) {
        return [];
      }

      const history =
        response.data.result ?? [];

      return history.map(
        (contest: any) => ({
          contestId:
            contest.contestId,

          contestName:
            contest.contestName,

          rating:
            contest.newRating,

          rank:
            contest.rank,

          date:
            new Date(
              contest.ratingUpdateTimeSeconds *
              1000,
            ).toISOString(),
        }),
      );
    } catch (error) {
      console.error(
        'Failed to load Codeforces rating history:',
        error,
      );

      return [];
    }
  }
/**/
  async getDashboard(
    userId: string,
  ): Promise<{
    codeforces: {
      handle: string;
      rating: number | null;
      avatarUrl: string | null;
      verifiedAt: Date;
      profileUrl: string;
    };
    activeDays: ContributionDay[];
    ratingHistory: CodeforcesRatingPoint[];
  }> {
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
    const ratingHistory =
      await this.getCodeforcesRatingHistory(
        account.handle,
      );
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

    let activeDays: ContributionDay[];

    const cacheIsFresh =
      cache &&
      Date.now() -
      cache.lastSyncedAt.getTime() <
      this.CACHE_TTL_MS;

    if (
      cache &&
      cacheIsFresh
    ) {
      activeDays =
        (cache.data as unknown as ContributionDay[]);
    } else {
      activeDays =
        await this.refreshContributionCache(
          userId,
          account.handle,
        );
    }

    const profile =
      await this.getCodeforcesUser(
        account.handle,
      );

    if (profile) {
      await this.prisma.codeforcesAccount.update(
        {
          where: {
            userId,
          },

          data: {
            rating:
              typeof profile.rating ===
                'number'
                ? profile.rating
                : account.rating,

            avatarUrl:
              typeof profile.avatar ===
                'string'
                ? profile.avatar
                : account.avatarUrl,
          },
        },
      );

      account.rating =
        typeof profile.rating ===
          'number'
          ? profile.rating
          : account.rating;

      account.avatarUrl =
        typeof profile.avatar ===
          'string'
          ? profile.avatar
          : account.avatarUrl;
    }

    return {
      codeforces: {
        handle:
          account.handle,

        rating:
          account.rating,

        avatarUrl:
          account.avatarUrl,

        verifiedAt:
          account.verifiedAt,

        profileUrl:
          `https://codeforces.com/profile/${encodeURIComponent(
            account.handle,
          )}`,
      },

      activeDays,
      ratingHistory,
    };
  }
}