import {
  ArrowLeft,
  Calendar,
  Loader2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateMeetingMutation } from "../services/apiSlice";

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [createMeeting, { isLoading }] =
    useCreateMeetingMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Meeting title is required");
      return;
    }

    try {
      setError("");

      const data = await createMeeting({
        title: title.trim(),
        description: description.trim(),
        meetingType: "INSTANT",
      }).unwrap();

      navigate(`/meeting/${data.meeting.meetingId}`);
    } catch (error) {
      console.error("Create meeting error:", error);

      setError(
        error?.data?.message ||
          error?.message ||
          "Failed to create meeting"
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
              <Video
                size={26}
                className="text-blue-500"
              />
            </div>

            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold">
                Create a Meeting
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Start a new instant meeting.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Meeting Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Team Meeting"
                  className="w-full h-12 rounded-xl border border-zinc-700 bg-[#111111] px-4 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Description
                  <span className="ml-1 text-zinc-600">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="What is this meeting about?"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-[#111111] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
                    <Calendar
                      size={18}
                      className="text-blue-500"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Instant Meeting
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      Start the meeting immediately
                    </p>
                  </div>
                </div>
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
                    <Video size={19} />
                    Create Meeting
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateMeeting;