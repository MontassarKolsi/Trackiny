import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import axios from "axios";

import { useAuth } from "../context/AuthContext";
import CombinedContributions from "../components/CombinedContributions";

interface PublicProfileData {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  profilePicture: string | null;

  portfolioUrl: string | null;
  linkedinUrl: string | null;

  createdAt: string;
/*
  certifications: {
    id: string;
    name: string;
    issuer: string | null;
    issueDate: string | null;
    credentialUrl: string | null;
  }[];
  */

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

  const { user } = useAuth();

  const [profile, setProfile] =
    useState<PublicProfileData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    axios
      .get(
        `${import.meta.env.VITE_API_URL}/users/${id}`,
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

  const isOwner =
    !!user &&
    !!profile &&
    user.id === profile.id;

  const publicProfileUrl =
    profile
      ? `${window.location.origin}/users/${profile.id}`
      : "";

  async function handleShareProfile() {
    if (!publicProfileUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        publicProfileUrl,
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

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

  const displayName =
    profile.name ||
    profile.username;

  const avatar =
    profile.profilePicture ||
    profile.platforms.github
      ? profile.profilePicture ||
        `https://github.com/${encodeURIComponent(
          profile.platforms.github?.username ??
            profile.username,
        )}.png`
      : profile.platforms.codeforces
          ?.avatarUrl;

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

          <div className="flex items-center gap-3">
            {isOwner && (
              <Link
                to="/profile/edit"
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Edit profile
              </Link>
            )}

            {!user && (
              <>
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
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
        <section className="rounded-2xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-5">
              {avatar ? (
                <img
                  src={avatar}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-bold text-gray-700">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {displayName}
                </h1>

                {profile.name && (
                  <p className="mt-1 text-sm text-gray-500">
                    @{profile.username}
                  </p>
                )}

                {!profile.name && (
                  <p className="mt-1 text-sm text-gray-500">
                    Trackiny developer profile
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleShareProfile}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              {copied
                ? "Profile URL copied!"
                : "Share profile"}
            </button>
          </div>

          {profile.bio && (
            <p className="mt-6 max-w-3xl whitespace-pre-wrap text-gray-600">
              {profile.bio}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Portfolio ↗
              </a>
            )}

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                LinkedIn ↗
              </a>
            )}
          </div>
        </section>

        {/*(profile.portfolioUrl ||
          profile.linkedinUrl ||
          profile.certifications.length >
            0) && (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">
              Professional profile
            </h2>

            {profile.certifications.length >
              0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold">
                  Certifications
                </h3>

                <div className="mt-4 space-y-3">
                  {profile.certifications.map(
                    (certification) => (
                      <div
                        key={
                          certification.id
                        }
                        className="rounded-xl border p-4"
                      >
                        <p className="font-semibold text-gray-900">
                          {
                            certification.name
                          }
                        </p>

                        {certification.issuer && (
                          <p className="mt-1 text-sm text-gray-500">
                            {
                              certification.issuer
                            }
                          </p>
                        )}

                        {certification.issueDate && (
                          <p className="mt-1 text-xs text-gray-400">
                            Issued{" "}
                            {new Date(
                              certification.issueDate,
                            ).toLocaleDateString()}
                          </p>
                        )}

                        {certification.credentialUrl && (
                          <a
                            href={
                              certification.credentialUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                          >
                            View credential →
                          </a>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </section>
        )</div>*/}

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
                  {
                    profile.platforms.github
                      .username
                  }
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
                  .codeforces.rating !==
                  null && (
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
            {profile.contributions.length >
            0
              ? "Coding activity is available for this profile."
              : "No public contribution data available yet."}
          </p>
          <CombinedContributions />
        </section>
      </main>
    </div>
  );
}