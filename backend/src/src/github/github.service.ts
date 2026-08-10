import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { GithubEncryptionService } from './github-encryption.service';
import { HttpService } from '@nestjs/axios';
import { GITHUB_DASHBOARD_QUERY } from './github.queries';

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface CachedContributionDay {
  date: string;
  count: number;
}

export interface GithubDashboardResult {
  github: {
    id: string;
    username: string;
    name: string | null;
    avatar: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    profileUrl: string;
    joinedGithub: string;
    followers: number;
    following: number;
    repositories: number;
    totalContributions: number;
  };

  activeDays: ContributionDay[];
}

@Injectable()
export class GithubService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: GithubEncryptionService,
    private readonly http: HttpService,
  ) {}



  async connectGithub(
    userId: string,
    githubData: any,
  ) {

    const existingGithub =
      await this.prisma.githubAccount.findUnique({
        where: {
          githubId: githubData.githubId,
        },
      });


    if (
      existingGithub &&
      existingGithub.userId !== userId
    ) {

      throw new ConflictException(
        'This GitHub account is already linked to another Trackiny account.',
      );

    }


    return this.prisma.githubAccount.upsert({

      where: {
        userId,
      },

      update: {
        githubId: githubData.githubId,
        username: githubData.username,
        accessToken: this.encryption.encrypt(
          githubData.accessToken,
        ),
      },

      create: {
        userId,
        githubId: githubData.githubId,
        username: githubData.username,
        accessToken: this.encryption.encrypt(
          githubData.accessToken,
        ),
      },

    });

  }



  async getGithubDashboard(
    userId: string,
  ): Promise<GithubDashboardResult> {

    /*
     * Find connected GitHub account.
     */

    const githubAccount =
      await this.prisma.githubAccount.findUnique({
        where: {
          userId,
        },
      });


    if (!githubAccount) {

      throw new NotFoundException(
        'GitHub account not connected',
      );

    }



    /*
     * Check cached GitHub data first.
     *
     * Cache lifetime:
     * 1 hour.
     */

    const cache =
      await this.prisma.contributionCache.findUnique({

        where: {
          userId_platform: {
            userId,
            platform: 'github',
          },
        },

      });



    const ONE_HOUR =
      1000 * 60 * 60;

    const cacheIsFresh =
      cache &&
      Date.now() -
        cache.lastSyncedAt.getTime() <
        ONE_HOUR;



    /*
     * If cache is fresh,
     * use it instead of GitHub API.
     */

    if (cacheIsFresh) {

      const cachedDays =
        cache.data as unknown as CachedContributionDay[];


      /*
       * We still need GitHub profile information.
       *
       * For now we fetch it from GitHub.
       *
       * Later we can cache profile information separately.
       */

      const token =
        this.encryption.decrypt(
          githubAccount.accessToken,
        );


      const response =
        await this.http.axiosRef.post(

          'https://api.github.com/graphql',

          {
            query:
              GITHUB_DASHBOARD_QUERY,
          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },
          },

        );


      const viewer =
        response.data.data.viewer;


      return {

        github: {
          id: viewer.id,

          username:
            viewer.login,

          name:
            viewer.name,

          avatar:
            viewer.avatarUrl,

          bio:
            viewer.bio,

          company:
            viewer.company,

          location:
            viewer.location,

          profileUrl:
            viewer.url,

          joinedGithub:
            viewer.createdAt,

          followers:
            viewer.followers.totalCount,

          following:
            viewer.following.totalCount,

          repositories:
            viewer.repositories.totalCount,

          totalContributions:
            viewer
              .contributionsCollection
              .contributionCalendar
              .totalContributions,
        },

        activeDays:
          cachedDays.map(
            (day) => ({
              date: day.date,

              contributionCount:
                day.count,
            }),
          ),

      };

    }



    /*
     * Cache missing or expired.
     *
     * Fetch fresh data from GitHub.
     */

    const token =
      this.encryption.decrypt(
        githubAccount.accessToken,
      );


    const response =
      await this.http.axiosRef.post(

        'https://api.github.com/graphql',

        {
          query:
            GITHUB_DASHBOARD_QUERY,
        },

        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            'Content-Type':
              'application/json',
          },
        },

      );


    const viewer =
      response.data.data.viewer;



    /*
     * Get all contribution days.
     */

    const contributionDays:
      ContributionDay[] =
      viewer
        .contributionsCollection
        .contributionCalendar
        .weeks
        .flatMap(
          (week: any) =>
            week.contributionDays,
        );



    /*
     * IMPORTANT:
     *
     * Store ONLY active days.
     */

    const cachedData:
      CachedContributionDay[] =
      contributionDays

        .filter(
          (day) =>
            day.contributionCount > 0,
        )

        .map(
          (day) => ({
            date: day.date,

            count:
              day.contributionCount,
          }),
        );



    /*
     * Save cache.
     */

    await this.prisma.contributionCache.upsert({

      where: {
        userId_platform: {
          userId,
          platform: 'github',
        },
      },

      update: {

        data:
          JSON.parse(
            JSON.stringify(cachedData),
          ),

        lastSyncedAt:
          new Date(),

      },

      create: {

        userId,

        platform:
          'github',

        data:
          JSON.parse(
            JSON.stringify(cachedData),
          ),

        lastSyncedAt:
          new Date(),

      },

    });



    /*
     * Return dashboard.
     */

    const activeDays:
      ContributionDay[] =
      cachedData.map(
        (day) => ({
          date:
            day.date,

          contributionCount:
            day.count,
        }),
      );



    return {

      github: {

        id:
          viewer.id,

        username:
          viewer.login,

        name:
          viewer.name,

        avatar:
          viewer.avatarUrl,

        bio:
          viewer.bio,

        company:
          viewer.company,

        location:
          viewer.location,

        profileUrl:
          viewer.url,

        joinedGithub:
          viewer.createdAt,

        followers:
          viewer.followers.totalCount,

        following:
          viewer.following.totalCount,

        repositories:
          viewer.repositories.totalCount,

        totalContributions:
          viewer
            .contributionsCollection
            .contributionCalendar
            .totalContributions,

      },

      activeDays,

    };

  }

}