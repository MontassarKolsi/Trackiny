import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async searchUsers(query: string) {
    const search = query.trim();

    if (!search) {
      return [];
    }

    const users =
      await this.prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              githubAccount: {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              codeforcesAccount: {
                handle: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        },

        select: {
          id: true,
          githubAccount: {
            select: {
              username: true,
            },
          },
          codeforcesAccount: {
            select: {
              handle: true,
            },
          },
        },

        take: 10,
      });

    return users.map((user) => ({
      id: user.id,

      username:
        user.githubAccount?.username ??
        user.codeforcesAccount?.handle ??
        `user-${user.id.slice(0, 8)}`,

      github:
        user.githubAccount?.username ?? null,

      codeforces:
        user.codeforcesAccount?.handle ?? null,
    }));
  }

  async getPublicProfile(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,

          createdAt: true,

          githubAccount: {
            select: {
              username: true,
            },
          },

          codeforcesAccount: {
            select: {
              handle: true,
              rating: true,
              avatarUrl: true,
            },
          },

          contributionCache: {
            select: {
              platform: true,
              data: true,
              lastSyncedAt: true,
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Trackiny user not found',
      );
    }

    const username =
      user.githubAccount?.username ??
      user.codeforcesAccount?.handle ??
      `user-${user.id.slice(0, 8)}`;

    const contributions =
      user.contributionCache.flatMap(
        (cache) => {
          if (!Array.isArray(cache.data)) {
            return [];
          }

          return cache.data;
        },
      );

    return {
      id: user.id,
      username,

      createdAt: user.createdAt,

      platforms: {
        github: user.githubAccount
          ? {
              username:
                user.githubAccount.username,
              profileUrl:
                `https://github.com/${encodeURIComponent(
                  user.githubAccount.username,
                )}`,
            }
          : null,

        codeforces:
          user.codeforcesAccount
            ? {
                handle:
                  user.codeforcesAccount.handle,
                rating:
                  user.codeforcesAccount.rating,
                avatarUrl:
                  user.codeforcesAccount.avatarUrl,
                profileUrl:
                  `https://codeforces.com/profile/${encodeURIComponent(
                    user.codeforcesAccount.handle,
                  )}`,
              }
            : null,
      },

      contributions,
    };
  }
}