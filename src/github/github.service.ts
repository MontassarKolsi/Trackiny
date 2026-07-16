import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GithubEncryptionService } from './github-encryption.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GithubService {

    constructor(
        private prisma: PrismaService,
        private encryption: GithubEncryptionService,
        private http: HttpService,
    ) { }


    async connectGithub(
        userId: string,
        githubData: any,
    ) {

        return this.prisma.githubAccount.upsert({

            where: {
                userId,
            },

            update: {
                githubId: githubData.githubId,
                username: githubData.username,
                accessToken: this.encryption.encrypt(
                    githubData.accessToken
                ),
            },

            create: {
                userId,
                githubId: githubData.githubId,
                username: githubData.username,
                accessToken: this.encryption.encrypt(
                    githubData.accessToken
                ),
            }

        });

    }

    async fetchGithubActivities(userId: string) {

        const githubAccount =
            await this.prisma.githubAccount.findUnique({
                where: {
                    userId,
                },
            });


        if (!githubAccount) {
            throw new Error("GitHub account not connected");
        }


        const token =
            this.encryption.decrypt(
                githubAccount.accessToken
            );


        const response =
            await this.http.get(
                `https://api.github.com/users/${githubAccount.username}/events`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                    },
                }
            ).toPromise();


        const events = response?.data;


        return events;

    }
    async getContributionCalendar(userId: string) {

        const githubAccount =
            await this.prisma.githubAccount.findUnique({
                where: {
                    userId,
                },
            });

        if (!githubAccount) {
            throw new Error('GitHub account not connected');
        }

        const token = this.encryption.decrypt(
            githubAccount.accessToken,
        );

        const query = `
        query {
            viewer {
                id
                login
                name
                avatarUrl
                bio
                company
                location
                url
                createdAt

                followers {
                totalCount
                }

                following {
                totalCount
                }

                repositories(
                ownerAffiliations: OWNER
                ) {
                totalCount
                }
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }
    `;

        const response = await this.http.axiosRef.post(
            'https://api.github.com/graphql',
            {
                query,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        const viewer = response.data.data.viewer;

        const activeDays =
            viewer.contributionsCollection.contributionCalendar.weeks
                .flatMap((week: any) => week.contributionDays)
                .filter((day: any) => day.contributionCount > 0);

        return {

            github: {

                id: viewer.id,
                username: viewer.login,
                name: viewer.name,

                avatar: viewer.avatarUrl,

                bio: viewer.bio,

                company: viewer.company,

                location: viewer.location,

                profileUrl: viewer.url,

                joinedGithub: viewer.createdAt,

                followers: viewer.followers.totalCount,

                following: viewer.following.totalCount,

                repositories: viewer.repositories.totalCount,

                totalContributions:
                    viewer.contributionsCollection
                        .contributionCalendar
                        .totalContributions,

            },

            activeDays,

        };
    }

}