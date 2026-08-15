import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

interface PublicProfileData {
  id: string;
  username: string;
  createdAt: string;

  platforms: {
    github: {
      username: string;
      profileUrl: string;
    } | null;

    codeforces: {
      handle: string;
      rating: number | null;
      avatarUrl: string | null;
      profileUrl: string;
    } | null;
  };

  contributions: unknown[];
}

export default function PublicProfile() {
  const { id } = useParams();

  const [profile, setProfile] =
    useState<PublicProfileData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    axios
      .get(
        `http://localhost:3000/users/${id}`,
      )
      .then((response) => {
        setProfile(response.data);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-bold">
          Profile not found
        </h1>

        <Link
          to="/"
          className="mt-5 text-blue-600 hover:underline"
        >
          Back to Trackiny
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900"
          >
            Trackiny
          </Link>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-700">
              {profile.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.username}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Trackiny developer profile
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Connected platforms
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {profile.platforms.github && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  GitHub
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  {profile.platforms.github.username}
                </h3>

                <a
                  href={
                    profile.platforms.github
                      .profileUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  View GitHub profile →
                </a>
              </div>
            )}

            {profile.platforms.codeforces && (
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Codeforces
                </p>

                <h3 className="mt-2 text-xl font-semibold">
                  {
                    profile.platforms
                      .codeforces.handle
                  }
                </h3>

                {profile.platforms
                  .codeforces.rating !== null && (
                  <p className="mt-2 text-gray-600">
                    Rating:{" "}
                    <strong>
                      {
                        profile.platforms
                          .codeforces.rating
                      }
                    </strong>
                  </p>
                )}

                <a
                  href={
                    profile.platforms
                      .codeforces.profileUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  View Codeforces profile →
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">
            Achievements
          </h2>

          <p className="mt-2 text-gray-500">
            {profile.contributions.length > 0
              ? "Coding activity is available for this profile."
              : "No public contribution data available yet."}
          </p>
        </section>
      </main>
    </div>
  );
}