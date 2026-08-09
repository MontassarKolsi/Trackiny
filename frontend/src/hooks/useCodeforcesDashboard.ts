import {
  useQuery,
} from '@tanstack/react-query';

import axios from 'axios';

export interface CodeforcesContributionDay {
  date: string;
  count: number;
}

export interface CodeforcesDashboardData {
  codeforces: {
    handle: string;
    rating: number | null;
    avatarUrl: string | null;
    verifiedAt: string;
    profileUrl: string;
  };

  activeDays:
    CodeforcesContributionDay[];
}

async function fetchCodeforcesDashboard() {
  const response =
    await axios.get(
      'http://localhost:3000/codeforces/dashboard',
      {
        withCredentials: true,
      },
    );

  return response.data as CodeforcesDashboardData;
}

export function useCodeforcesDashboard() {
  return useQuery({
    queryKey: [
      'codeforces-dashboard',
    ],

    queryFn:
      fetchCodeforcesDashboard,

    retry: false,
  });
}