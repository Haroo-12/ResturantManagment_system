import { useState } from "react";
import { supabase } from "../supabas.js";
import { useNavigate } from "react-router-dom";

// Kaun sa email login kare to kis panel par jaye
const panelRoutes = {
  "ownerpanel123@gmail.com": "/owneradminpanel",
  "managerpanel123@gmail.com": "/managerpanel",
};

const Signin = () => {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setIsSuccess(true);
        setMessage("Sign in successful!");
        navigate(panelRoutes[data.user.email.toLowerCase()] || "/");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition duration-200 placeholder:text-gray-400 hover:border-red-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/10";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fffafa] px-4 py-5 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-200/40 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-rose-200/40 blur-[100px]" />

      <section className="group relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white bg-white/90 p-5 shadow-[0_15px_50px_-20px_rgba(185,28,28,0.18)] backdrop-blur-xl transition duration-300 hover:shadow-[0_20px_60px_-20px_rgba(185,28,28,0.23)] sm:p-7 md:w-1/2">
        <div className="relative z-10">
          {/* Same icon design as Signup */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-2xl text-white shadow-lg shadow-red-600/20 transition duration-300 group-hover:scale-105">
            ♙
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome Back
          </h1>

          <p className="mt-1 text-center text-sm text-gray-500">
            Sign in to continue to your account
          </p>

          <form onSubmit={handleSignin} className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className={inputStyle}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`${inputStyle} pr-16`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 transition hover:text-red-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 py-1 text-xs sm:text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-500">
                <input
                  type="checkbox"
                  name="remember"
                  className="h-4 w-4 accent-red-600"
                />
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="font-medium text-red-600 transition hover:text-red-800"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group/btn flex w-full items-center justify-center gap-3 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 font-semibold text-white shadow-lg shadow-red-600/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
              {!loading && (
                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className={`mt-3 text-center text-sm ${
                isSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <div className="my-4 flex items-center gap-4 text-xs font-medium text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />
            OR
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-red-600 transition hover:text-red-800"
            >
              Sign Up
            </a>
          </p>
        </div>

        {/* Bottom gradient decoration */}
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-24 w-[120%] -rotate-3 rounded-[50%] bg-[image:var(--gradient-primary)] opacity-10 blur-2xl" />
      </section>
    </main>
  );
};

export default Signin;