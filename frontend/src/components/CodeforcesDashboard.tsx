import {
  useEffect,
  useState,
} from "react";

import {
  useCodeforcesDashboard,
} from "../hooks/useCodeforcesDashboard";

import Heatmap from "./Heatmap/Heatmap";

export default function CodeforcesDashboard() {
  const {
    data,
    isLoading,
    error,
  } = useCodeforcesDashboard();

  if (isLoading) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-4 w-56 rounded bg-gray-100" />
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Codeforces
        </h2>

        <p className="mt-2 text-gray-500">
          Connect your Codeforces account to
          display your activity.
        </p>

        <a
          href="http://localhost:3000/codeforces/connect"
          className="mt-5 inline-flex rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Connect Codeforces
        </a>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {data.codeforces.avatarUrl ? (
              <img
                src={data.codeforces.avatarUrl}
                alt={data.codeforces.handle}
                className="h-20 w-20 rounded-full border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold">
                {data.codeforces.handle
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {data.codeforces.handle}
              </h2>

              <p className="mt-1 text-gray-500">
                Codeforces
              </p>

              <a
                href={data.codeforces.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View Codeforces profile →
              </a>
            </div>
          </div>

          {data.codeforces.rating !== null && (
            <div className="rounded-xl bg-gray-50 px-5 py-4">
              <p className="text-sm text-gray-500">
                Rating
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {data.codeforces.rating}
              </p>
            </div>
          )}
        </div>
      </section>

      <Heatmap
        activeDays={data.activeDays.map(
          (day) => ({
            date: day.date,
            contributionCount:
              day.count,
          }),
        )}
      />
    </div>
  );
}