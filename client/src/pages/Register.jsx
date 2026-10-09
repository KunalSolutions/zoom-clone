import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRegisterMutation } from "../services/apiSlice";

const Register = () => {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError(
        "Name, email and password are required"
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");

      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      }).unwrap();

      navigate("/login");
    } catch (error) {
      console.error("Register error:", error);

      setError(
        error?.data?.message ||
          error?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="h-16 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={19} />
          <span className="text-sm">Back</span>
        </button>

        <div className="ml-6 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold text-sm">Z</span>
          </div>

          <span className="font-semibold">
            AVSI WORKSPACE
          </span>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-7 md:p-8">
            <div className="mx-auto h-14 w-14 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Video size={26} className="text-blue-500" />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold">
                Create Account
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Create your AVSI WORKSPACE account.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full h-12 rounded-xl border border-zinc-700 bg-[#111111] px-4 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full h-12 rounded-xl border border-zinc-700 bg-[#111111] px-4 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  className="w-full h-12 rounded-xl border border-zinc-700 bg-[#111111] px-4 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3">
                  <p className="text-sm text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={19} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:text-blue-400 transition"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;