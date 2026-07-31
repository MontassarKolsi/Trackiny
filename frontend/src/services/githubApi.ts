import { api } from "./api";

export async function getGithubDashboard() {
  const { data } = await api.get("/github/dashboard");

  return data;
}