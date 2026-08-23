import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import { useGithubDashboard } from "../hooks/useGithubDashboard";

import CodeforcesDashboard from "../components/CodeforcesDashboard";
import Heatmap from "../components/Heatmap/Heatmap";
import CombinedContributions from "../components/CombinedContributions";

export default function Dashboard() {
  const {
    data,
    isLoading,
    error,
  } = useGithubDashboard();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [
    connectionMessage,
    setConnectionMessage,
  ] = useState<string | null>(null);

  useEffect(() => {
    const githubStatus =
      searchParams.get("github");

    const codeforcesStatus =
      searchParams.get("codeforces");

    if (
      !githubStatus &&
      !codeforcesStatus
    ) {
      return;
    }

    if (githubStatus === "connected") {
      setConnectionMessage(
        "GitHub connected successfully.",
      );
    }

    if (
      githubStatus ===
      "already_connected"
    ) {
      setConnectionMessage(
        "This GitHub account is already connected to another Trackiny account.",
      );
    }

    if (githubStatus === "invalid_state") {
      setConnectionMessage(
        "The GitHub connection expired. Please try again.",
      );
    }

    if (githubStatus === "error") {
      setConnectionMessage(
        "Something went wrong while connecting GitHub.",
      );
    }

    if (
      codeforcesStatus === "connected"
    ) {
      setConnectionMessage(
        "Codeforces connected successfully.",
      );
    }

    if (
      codeforcesStatus ===
      "already_connected"
    ) {
      setConnectionMessage(
        "This Codeforces account is already connected to another Trackiny account.",
      );
    }

    if (
      codeforcesStatus ===
      "invalid_state"
    ) {
      setConnectionMessage(
        "The Codeforces connection expired. Please try again.",
      );
    }

    if (
      codeforcesStatus ===
      "cancelled"
    ) {
      setConnectionMessage(
        "Codeforces connection was cancelled.",
      );
    }

    if (codeforcesStatus === "error") {
      setConnectionMessage(
        "Something went wrong while connecting Codeforces.",
      );
    }

    setSearchParams(
      {},
      {
        replace: true,
      },
    );
  }, [
    searchParams,
    setSearchParams,
  ]);

  const message =
    connectionMessage && (
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-gray-700">
            {connectionMessage}
          </p>

          <button
            onClick={() =>
              setConnectionMessage(null)
            }
            className="text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>
    );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-10">
        {message}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Your Trackiny profile
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Customize the information people
                see when they visit your profile.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {data?.userId && (
                <Link
                  to={`/users/${data.userId}`}
                  className="inline-flex rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                >
                  View public profile
                </Link>
              )}

              <Link
                to="/profile/edit"
                className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Edit profile
              </Link>
            </div>
          </div>
        </section>

        <CombinedContributions />

        {isLoading ? (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <div className="flex min-h-[180px] items-center justify-center">
              <p className="text-gray-500">
                Loading GitHub...
              </p>
            </div>
          </section>
        ) : error || !data ? (
          <section className="rounded-2xl border bg-white p-8 shadow-sm sm:p-12">
            <h1 className="text-3xl font-bold text-gray-900">
              GitHub
            </h1>

            <p className="mt-3 max-w-xl text-gray-500">
              Connect your GitHub account to start
              tracking your coding activity.
            </p>

            <a
              href={`${import.meta.env.VITE_API_URL}/github/connect`}
              className="mt-6 inline-flex rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              Connect GitHub
            </a>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <img
                  src={data.github.avatar}
                  alt={data.github.username}
                  className="h-24 w-24 rounded-full border sm:h-28 sm:w-28"
                />

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.github.name ||
                      data.github.username}
                  </h1>

                  <p className="mt-1 text-gray-500">
                    @{data.github.username}
                  </p>

                  <a
                    href={
                      data.github.profileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    View GitHub profile →
                  </a>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Repositories
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {data.github.repositories}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Followers
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {data.github.followers}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Following
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {data.github.following}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Contributions
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {
                    data.github
                      .totalContributions
                  }
                </p>
              </div>
            </section>

            <section>
              <Heatmap
                activeDays={
                  data.activeDays
                }
              />
            </section>
          </>
        )}

        <CodeforcesDashboard />
      </main>
    </>
  );
}