export interface GithubProfile {
    id: string;
    username: string;
    name: string;
    avatar: string;
    totalContributions: number;
}

export interface ActiveDay {
    date: string;
    contributionCount: number;
}

export interface GithubResponse {
    github: GithubProfile;
    activeDays: ActiveDay[];
}