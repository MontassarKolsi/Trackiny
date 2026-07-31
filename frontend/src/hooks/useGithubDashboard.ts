import { useQuery } from "@tanstack/react-query";
import { getGithubDashboard } from "../services/githubApi";

export function useGithubDashboard() {
  return useQuery({
    queryKey: ["github-dashboard"],
    queryFn: getGithubDashboard,
    retry: false,
  });
}