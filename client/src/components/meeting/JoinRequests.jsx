import { Users, Check, X } from "lucide-react";

const JoinRequests = ({
  pendingData,
  pendingLoading,
  pendingParticipants,
  accepting,
  rejecting,
  handleAccept,
  handleReject,
}) => {
  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0 border-l border-zinc-800 bg-[#181818] flex flex-col">
      <div className="h-16 px-5 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Join Requests</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Waiting for approval
          </p>
        </div>

        <div className="h-7 min-w-7 px-2 rounded-full bg-yellow-950 text-yellow-400 flex items-center justify-center text-xs font-semibold">
          {pendingData?.count || 0}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {pendingLoading ? (
          <div className="py-10 text-center">
            <div className="h-7 w-7 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <p className="mt-3 text-sm text-zinc-500">
              Checking requests...
            </p>
          </div>
        ) : pendingParticipants.length === 0 ? (
          <div className="py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-zinc-900 flex items-center justify-center mx-auto">
              <Users size={24} className="text-zinc-600" />
            </div>

            <h3 className="mt-4 text-sm font-medium">
              No join requests
            </h3>

            <p className="mt-2 text-xs text-zinc-600">
              New requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingParticipants.map((participant) => (
              <div
                key={participant._id}
                className="rounded-xl border border-zinc-800 bg-[#111111] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="font-semibold">
                      {participant.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {participant.name}
                    </p>
                    <p className="text-xs text-yellow-500 mt-1">
                      Wants to join
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    disabled={accepting || rejecting}
                    onClick={() => handleAccept(participant._id)}
                    className="h-9 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Check size={16} />
                    Accept
                  </button>

                  <button
                    type="button"
                    disabled={accepting || rejecting}
                    onClick={() => handleReject(participant._id)}
                    className="h-9 rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-400 disabled:opacity-50 transition flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default JoinRequests;