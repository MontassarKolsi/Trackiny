import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GithubEncryptionService } from './github-encryption.service';

@Injectable()
export class GithubService {

    constructor(
        private prisma: PrismaService,
        private encryption: GithubEncryptionService,
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

}