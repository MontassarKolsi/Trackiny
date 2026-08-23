import { useMemo, useState } from "react";

import { useGithubDashboard } from "../hooks/useGithubDashboard";
import { useCodeforcesDashboard } from "../hooks/useCodeforcesDashboard";

import Heatmap from "./Heatmap/Heatmap";

type Platform = "all" | "github" | "codeforces";

interface ContributionDay {
    date: string;
    count: number;
}

export default function CombinedContributions() {
    const {
        data: githubData,
        isLoading: githubLoading,
    } = useGithubDashboard();

    const {
        data: codeforcesData,
        isLoading: codeforcesLoading,
    } = useCodeforcesDashboard();

    const [platform, setPlatform] =
        useState<Platform>("all");

    const githubDays: ContributionDay[] =
        useMemo(() => {
            return (
                githubData?.activeDays?.map(
                    (day: any) => ({
                        date: day.date,
                        count:
                            day.contributionCount,
                    }),
                ) ?? []
            );
        }, [githubData]);

    const codeforcesDays: ContributionDay[] =
        useMemo(() => {
            return (
                codeforcesData?.activeDays?.map(
                    (day) => ({
                        date: day.date,
                        count: day.count,
                    }),
                ) ?? []
            );
        }, [codeforcesData]);

    /*
     * Combine contributions from every platform.
     *
     * Example:
     *
     * GitHub       2026-08-15 -> 5
     * Codeforces   2026-08-15 -> 3
     *
     * All platforms -> 8
     */
    const combinedDays =
        useMemo(() => {
            const map =
                new Map<string, number>();

            for (const day of githubDays) {
                map.set(
                    day.date,
                    (map.get(day.date) ?? 0) +
                        day.count,
                );
            }

            for (const day of codeforcesDays) {
                map.set(
                    day.date,
                    (map.get(day.date) ?? 0) +
                        day.count,
                );
            }

            return Array.from(
                map.entries(),
            )
                .map(
                    ([date, count]) => ({
                        date,
                        count,
                    }),
                )
                .sort((a, b) =>
                    a.date.localeCompare(
                        b.date,
                    ),
                );
        }, [
            githubDays,
            codeforcesDays,
        ]);

    const selectedDays =
        platform === "github"
            ? githubDays
            : platform === "codeforces"
              ? codeforcesDays
              : combinedDays;

    const hasGithub =
        Boolean(githubData);

    const hasCodeforces =
        Boolean(codeforcesData);

    const loading =
        githubLoading ||
        codeforcesLoading;

    /*
     * The individual dashboard queries can fail
     * when a platform isn't connected.
     *
     * That is expected.
     *
     * We only need to wait while they are loading.
     */
    if (loading) {
        return (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex min-h-[220px] items-center justify-center">
                    <p className="text-gray-500">
                        Loading contributions...
                    </p>
                </div>
            </section>
        );
    }

    /*
     * Nothing connected.
     */
    if (!hasGithub && !hasCodeforces) {
        return (
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900">
                    Contributions
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Connect GitHub or Codeforces to
                    start tracking your coding activity.
                </p>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Coding activity
                    </h2>

                    <p className="text-sm text-gray-500">
                        Contributions across your connected platforms
                    </p>
                </div>

                <label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">
                        Platform
                    </span>

                    <select
                        value={platform}
                        onChange={(e) =>
                            setPlatform(
                                e.target
                                    .value as Platform,
                            )
                        }
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    >
                        <option value="all">
                            All platforms
                        </option>

                        {hasGithub && (
                            <option value="github">
                                GitHub
                            </option>
                        )}

                        {hasCodeforces && (
                            <option value="codeforces">
                                Codeforces
                            </option>
                        )}
                    </select>
                </label>
            </div>

            <Heatmap
                activeDays={selectedDays.map(
                    (day) => ({
                        date: day.date,
                        contributionCount:
                            day.count,
                    }),
                )}
            />
        </section>
    );
}