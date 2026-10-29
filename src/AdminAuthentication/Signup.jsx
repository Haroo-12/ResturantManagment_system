import { useState } from "react";
import { supabase } from "../supabas.js";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/signin`,
        },
      });

      if (error) throw error;

      if (data.session) {
        // Email confirmation OFF: user is already logged in
        navigate("/signin");
      } else {
        // Email confirmation ON: user must verify email first
        setMessage("Account created. Please check your email for verification.");
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
          {/* Icon */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-2xl text-white shadow-lg shadow-red-600/20 transition duration-300 group-hover:scale-105">
            ✚
          </div>

          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Create Account
          </h1>

          <p className="mt-1 text-center text-sm text-gray-500">
            Join us and start your journey today
          </p>

          <form onSubmit={handleSignup} className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className={inputStyle}
              />
            </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
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

            <button
              type="submit"
              disabled={loading}
              className="group/btn flex w-full items-center justify-center gap-3 rounded-xl bg-[image:var(--gradient-primary)] px-5 py-3 font-semibold text-white shadow-lg shadow-red-600/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Sign Up"}
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
                message.startsWith("Account created")
                  ? "text-green-600"
                  : "text-red-600"
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
            Already have an account?{" "}
            <a
              href="/signin"
              className="font-semibold text-red-600 transition hover:text-red-800"
            >
              Sign In
            </a>
          </p>
        </div>

        {/* Bottom gradient decoration */}
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-24 w-[120%] -rotate-3 rounded-[50%] bg-[image:var(--gradient-primary)] opacity-10 blur-2xl" />
      </section>
    </main>
  );
};

export default Signup;