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
            where:{
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
                headers:{
                    Authorization:`Bearer ${token}`,
                    Accept:'application/vnd.github+json',
                },
            }
        ).toPromise();


    const events = response?.data;


    return events;

}

}