export const GITHUB_DASHBOARD_QUERY = `
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

    repositories(ownerAffiliations: OWNER) {
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