import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { authApi } from "../services/authApi";

export default function Register() {
  const navigate = useNavigate();

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
      await authApi.register({
        email,
        password,
      });

      /*
       * ============================================================
       * EMAIL VERIFICATION TEMPORARILY DISABLED
       * ============================================================
       *
       * When Resend/domain configuration is ready again, remove
       * the comment around this navigation and use it instead of
       * navigating directly to login.
       *
       * navigate(
       *   `/verify-email?email=${encodeURIComponent(email)}`,
       *   {
       *     replace: true,
       *   },
       * );
       *
       * ============================================================
       */

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-6 text-center text-sm text-gray-500">
          Create your Trackiny account
        </p>

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
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?

          <Link
            to="/login"
            className="ml-2 text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}