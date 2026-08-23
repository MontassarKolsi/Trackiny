import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

//import { authApi } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {

  const navigate =
    useNavigate();

  const {
    loadUser,
  } = useAuth();

  const [
    searchParams,
  ] = useSearchParams();

  const initialEmail =
    searchParams.get("email") ?? "";

  const [
    email,
    setEmail,
  ] = useState(initialEmail);

  const [
    code,
    setCode,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(0);

  useEffect(() => {

    if (resendCooldown <= 0) {
      return;
    }

    const timer =
      window.setInterval(() => {

        setResendCooldown(
          (value) =>
            Math.max(
              0,
              value - 1,
            ),
        );

      }, 1000);

    return () =>
      window.clearInterval(timer);

  }, [resendCooldown]);

  async function handleVerify(
    e: React.FormEvent,
  ) {

    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {

     /* await authApi.verifyEmail({
        email,
        code,
      });*/

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
        "Verification failed.",
      );

    } finally {

      setLoading(false);

    }
  }

  async function handleResend() {

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    setResendLoading(true);

    try {

     /* await authApi.resendVerification({
        email,
      });*/

      setSuccess(
        "A new verification code has been sent.",
      );

      setResendCooldown(60);

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "Unable to resend verification code.",
      );

    } finally {

      setResendLoading(false);

    }
  }

  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold">
          Verify your email
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-gray-500">
          We sent a 6-digit verification code
          to your email address.
        </p>

        <form
          onSubmit={handleVerify}
          className="mt-6 space-y-4"
        >

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border p-3 outline-none focus:border-black"
              required
            />

          </div>

          <div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Verification code
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              className="w-full rounded-lg border p-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-black"
              required
            />

          </div>

          {error && (

            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>

          )}

          {success && (

            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {success}
            </p>

          )}

          <button
            type="submit"
            disabled={
              loading ||
              code.length !== 6
            }
            className="w-full rounded-lg bg-black p-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >

            {loading
              ? "Verifying..."
              : "Verify Email"}

          </button>

        </form>

        <div className="mt-6 text-center">

          <button
            type="button"
            onClick={handleResend}
            disabled={
              resendLoading ||
              resendCooldown > 0
            }
            className="text-sm font-medium text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
          >

            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}

          </button>

        </div>

        <p className="mt-6 text-center text-sm">

          <Link
            to="/register"
            className="text-gray-500 hover:text-black"
          >
            ← Back to registration
          </Link>

        </p>

      </div>

    </div>
  );
}