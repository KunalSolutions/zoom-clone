import {
  ArrowRight,
  Video,
  Plus,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token, user } = useSelector(
    (state) => state.auth
  );

  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="h-16 border-b border-zinc-800 bg-[#181818] px-5 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="font-bold">Z</span>
          </div>

          <span className="text-xl font-semibold">
            ZoomLite
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="hidden sm:block text-sm text-zinc-400 mr-2">
                Hi, {user?.name || "User"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="h-10 px-4 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition flex items-center gap-2 text-sm"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="h-10 px-4 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition flex items-center gap-2 text-sm"
              >
                <LogIn size={17} />
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="h-10 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 text-sm"
              >
                <UserPlus size={17} />
                Register
              </button>
            </>
          )}
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 mb-6">
              <Video size={14} />
              Secure video meetings
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Meet. Talk.
              <span className="block text-blue-500">
                Connect.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-zinc-400 leading-7">
              Start a video meeting or join an existing
              meeting using a meeting ID.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/create")}
                className="h-12 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2 font-medium"
              >
                <Plus size={19} />
                New Meeting
              </button>

              <button
                type="button"
                onClick={() => navigate("/join")}
                className="h-12 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition flex items-center gap-2 font-medium"
              >
                <LogIn size={19} />
                Join Meeting
              </button>
            </div>

            {!isLoggedIn && (
              <p className="mt-4 text-xs text-zinc-500">
                Login or register to create and join meetings.
              </p>
            )}
          </div>

          <div className="hidden md:block">
            <div className="rounded-2xl border border-zinc-800 bg-[#181818] p-6">
              <div className="rounded-xl bg-[#111111] border border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-medium">
                    Meeting Preview
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Ready
                  </span>
                </div>

                <div className="aspect-video rounded-xl bg-zinc-900 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Video
                      size={28}
                      className="text-zinc-400"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Your meeting
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      Camera and microphone ready
                    </p>
                  </div>

                  <ArrowRight
                    size={20}
                    className="text-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;