import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

interface ProfileForm {
  name: string;
  bio: string;
  profilePicture: string;
  portfolioUrl: string;
  linkedinUrl: string;
}

export default function EditProfile() {
  const { user, loadUser } =
    useAuth();

  const navigate = useNavigate();

  const [form, setForm] =
    useState<ProfileForm>({
      name: "",
      bio: "",
      profilePicture: "",
      portfolioUrl: "",
      linkedinUrl: "",
    });

  const [certifications, setCertifications] =
    useState<Certification[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) {
        return;
      }

      try {
        const response =
          await axios.get(
            `http://localhost:3000/users/${user.id}`,
          );

        const profile =
          response.data;

        setForm({
          name: profile.name ?? "",
          bio: profile.bio ?? "",
          profilePicture:
            profile.profilePicture ??
            "",
          portfolioUrl:
            profile.portfolioUrl ?? "",
          linkedinUrl:
            profile.linkedinUrl ?? "",
        });

        setCertifications(
          (
            profile.certifications ??
            []
          ).map(
            (certification: any) => ({
              id:
                certification.id ??
                crypto.randomUUID(),
              name:
                certification.name ??
                "",
              issuer:
                certification.issuer ??
                "",
              issueDate:
                certification.issueDate
                  ? certification.issueDate.slice(
                      0,
                      10,
                    )
                  : "",
              credentialUrl:
                certification.credentialUrl ??
                "",
            }),
          ),
        );
      } catch {
        setError(
          "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id]);

  function updateField(
    field: keyof ProfileForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.patch(
        "http://localhost:3000/users/me/profile",
        {
          ...form,
          certifications,
        },
        {
          withCredentials: true,
        },
      );

      await loadUser();

      setSuccess(true);

      window.setTimeout(() => {
        navigate(
          `/users/${user?.id}`,
        );
      }, 700);
    } catch (requestError: any) {
      setError(
        requestError?.response?.data
          ?.message ??
          "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="text-gray-500">
            Loading profile...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Back to dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Edit your profile
          </h1>

          <p className="mt-2 text-gray-500">
            Customize the information
            visible on your public Trackiny
            profile.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Profile information
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Display name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="Your name"
                  maxLength={100}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bio
                </label>

                <textarea
                  value={form.bio}
                  onChange={(event) =>
                    updateField(
                      "bio",
                      event.target.value,
                    )
                  }
                  placeholder="Tell people a little about yourself..."
                  maxLength={1000}
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {form.bio.length}/1000
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profile picture URL
                </label>

                <input
                  type="url"
                  value={
                    form.profilePicture
                  }
                  onChange={(event) =>
                    updateField(
                      "profilePicture",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900">
              Professional links
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Portfolio
                </label>

                <input
                  type="url"
                  value={
                    form.portfolioUrl
                  }
                  onChange={(event) =>
                    updateField(
                      "portfolioUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://yourportfolio.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>

                <input
                  type="url"
                  value={
                    form.linkedinUrl
                  }
                  onChange={(event) =>
                    updateField(
                      "linkedinUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Profile updated successfully.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link
              to="/dashboard"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save profile"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}