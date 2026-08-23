import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
              name: {
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
          name: true,

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
        user.name ??
        user.githubAccount?.username ??
        user.codeforcesAccount?.handle ??
        `user-${user.id.slice(0, 8)}`,

      github:
        user.githubAccount?.username ??
        null,

      codeforces:
        user.codeforcesAccount?.handle ??
        null,
    }));
  }

  async getPublicProfile(
    userId: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          bio: true,
          profilePicture: true,
          portfolioUrl: true,
          linkedinUrl: true,
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
          if (
            !Array.isArray(cache.data)
          ) {
            return [];
          }

          return cache.data;
        },
      );

    return {
      id: user.id,

      username,

      name: user.name,
      bio: user.bio,
      profilePicture:
        user.profilePicture,

      portfolioUrl:
        user.portfolioUrl,

      linkedinUrl:
        user.linkedinUrl,

      createdAt:
        user.createdAt,

      platforms: {
        github:
          user.githubAccount
            ? {
                username:
                  user.githubAccount
                    .username,

                profileUrl:
                  `https://github.com/${encodeURIComponent(
                    user.githubAccount
                      .username,
                  )}`,
              }
            : null,

        codeforces:
          user.codeforcesAccount
            ? {
                handle:
                  user.codeforcesAccount
                    .handle,

                rating:
                  user.codeforcesAccount
                    .rating,

                avatarUrl:
                  user.codeforcesAccount
                    .avatarUrl,

                profileUrl:
                  `https://codeforces.com/profile/${encodeURIComponent(
                    user.codeforcesAccount
                      .handle,
                  )}`,
              }
            : null,
      },

      contributions,
    };
  }

  async updateProfile(
    userId: string,
    body: any,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'Trackiny user not found',
      );
    }

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : null;

    const bio =
      typeof body.bio === 'string'
        ? body.bio.trim()
        : null;

    const profilePicture =
      typeof body.profilePicture ===
      'string'
        ? body.profilePicture.trim()
        : null;

    const portfolioUrl =
      typeof body.portfolioUrl ===
      'string'
        ? body.portfolioUrl.trim()
        : null;

    const linkedinUrl =
      typeof body.linkedinUrl ===
      'string'
        ? body.linkedinUrl.trim()
        : null;

    if (name && name.length > 100) {
      throw new BadRequestException(
        'Name is too long.',
      );
    }

    if (bio && bio.length > 1000) {
      throw new BadRequestException(
        'Bio is too long.',
      );
    }

    const certifications =
      Array.isArray(
        body.certifications,
      )
        ? body.certifications
        : [];

    if (
      certifications.length > 20
    ) {
      throw new BadRequestException(
        'Too many certifications.',
      );
    }

    const sanitizedCertifications =
      certifications
        .filter(
          (certification: any) =>
            typeof certification
              ?.name === 'string' &&
            certification.name.trim()
              .length > 0,
        )
        .map(
          (certification: any) => ({
            name:
              certification.name
                .trim()
                .slice(0, 200),

            issuer:
              typeof certification
                .issuer === 'string'
                ? certification.issuer
                    .trim()
                    .slice(0, 200)
                : null,

            issueDate:
              certification.issueDate
                ? new Date(
                    certification.issueDate,
                  )
                : null,

            credentialUrl:
              typeof certification
                .credentialUrl ===
              'string'
                ? certification.credentialUrl
                    .trim()
                    .slice(0, 1000)
                : null,
          }),
        );

    await this.prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: userId,
          },

          data: {
            name:
              name || null,

            bio:
              bio || null,

            profilePicture:
              profilePicture || null,

            portfolioUrl:
              portfolioUrl || null,

            linkedinUrl:
              linkedinUrl || null,
          },
        });
      },
    );

    return this.getPublicProfile(
      userId,
    );
  }
}