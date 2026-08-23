import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

interface SearchUser {
  id: string;
  username: string;
  github: string | null;
  codeforces: string | null;
}

export default function Landing() {
  const navigate = useNavigate();

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<SearchUser[]>([]);

  const [searching, setSearching] =
    useState(false);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setResults([]);
      return;
    }

    const timeout =
      setTimeout(async () => {
        try {
          setSearching(true);

          const response =
            await axios.get(
              `${import.meta.env.VITE_API_URL}/users/search`,
              {
                params: {
                  q: value,
                },
              },
            );

          setResults(response.data);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);

    return () =>
      clearTimeout(timeout);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-gray-900"
          >
            Trackiny
          </Link>

          <div className="flex items-center gap-3">
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

      <main>
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Your coding journey
          </p>

          <h1 className="mt-5 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            One profile.
            <br />
            Every achievement.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Track your coding activity across the
            platforms you use and build a single
            profile that represents your journey.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-black px-6 py-3 font-medium text-white shadow-sm hover:bg-gray-800"
            >
              Create your Trackiny
            </Link>

            <Link
              to="/login"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-800 hover:bg-gray-50"
            >
              Login
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-center text-xl font-semibold text-gray-900">
              Find a developer
            </h2>

            <p className="mt-2 text-center text-sm text-gray-500">
              Search public Trackiny profiles and
              explore their achievements.
            </p>

            <div className="relative mt-6">
              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search by GitHub username or Codeforces handle..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />

              {query.trim() && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border bg-white shadow-lg">
                  {searching && (
                    <div className="p-4 text-sm text-gray-500">
                      Searching...
                    </div>
                  )}

                  {!searching &&
                    results.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">
                        No Trackiny users found.
                      </div>
                    )}

                  {!searching &&
                    results.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() =>
                          navigate(
                            `/users/${user.id}`,
                          )
                        }
                        className="block w-full border-b px-4 py-4 text-left last:border-b-0 hover:bg-gray-50"
                      >
                        <p className="font-medium text-gray-900">
                          {user.username}
                        </p>

                        <div className="mt-1 flex gap-3 text-xs text-gray-500">
                          {user.github && (
                            <span>
                              GitHub: {user.github}
                            </span>
                          )}

                          {user.codeforces && (
                            <span>
                              Codeforces:{" "}
                              {user.codeforces}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-3">
            <Feature
              title="One identity"
              text="Bring your coding achievements together in one public profile."
            />

            <Feature
              title="Track progress"
              text="See your activity and contributions over time."
            />

            <Feature
              title="Share achievements"
              text="Give others a simple way to discover your coding journey."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-600">
        {text}
      </p>
    </div>
  );
}