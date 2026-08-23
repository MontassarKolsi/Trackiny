import { useState } from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { authApi } from "../services/authApi";

import { useAuth } from "../context/AuthContext";

export default function Login() {

  const navigate =
    useNavigate();

  const {
    loadUser,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent,
  ) {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await authApi.login({
        email,
        password,
      });

      await loadUser();

      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "Login failed.",
      );

    } finally {

      setLoading(false);

    }
  }

  function continueWithGoogle() {
    window.location.href =
      `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  function continueWithGithub() {
    window.location.href =
      `${import.meta.env.VITE_API_URL}/auth/github`;
  }

  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold">
          Welcome back
        </h1>

        <p className="mb-6 text-center text-sm text-gray-500">
          Login to Trackiny
        </p>

        <div className="space-y-3">

          <button
            type="button"
            onClick={continueWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white p-3 font-medium text-gray-800 transition hover:bg-gray-50"
          >
            <span className="text-lg font-bold">
              G
            </span>

            Continue with Google
          </button>

          <button
            type="button"
            onClick={continueWithGithub}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 p-3 font-medium text-white transition hover:bg-gray-800"
          >
            <span className="text-lg">
              GitHub
            </span>

            Continue with GitHub
          </button>

        </div>

        <div className="my-6 flex items-center gap-3">

          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200" />

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border p-3 outline-none focus:border-black"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            minLength={6}
            className="w-full rounded-lg border p-3 outline-none focus:border-black"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          {error && (

            <p className="text-sm text-red-500">
              {error}
            </p>

          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm">

          Don't have an account?

          <Link
            to="/register"
            className="ml-2 font-medium text-blue-600 hover:underline"
          >
            Register
          </Link>

        </p>

      </div>

    </div>
  );
}