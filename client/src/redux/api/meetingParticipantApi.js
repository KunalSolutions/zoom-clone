import apiSlice from "./apiSlice";

const meetingParticipantApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    requestToJoinMeeting: builder.mutation({
      query: (data) => ({
        url: "/meeting-participants/join",
        method: "POST",
        body: data,
      }),
    }),

    getPendingRequests: builder.query({
      query: (meetingId) => ({
        url: `/meeting-participants/${meetingId}/pending`,
        method: "GET",
      }),
    }),

    acceptParticipant: builder.mutation({
      query: (participantId) => ({
        url: `/meeting-participants/${participantId}/accept`,
        method: "PATCH",
      }),
    }),

    rejectParticipant: builder.mutation({
      query: (participantId) => ({
        url: `/meeting-participants/${participantId}/reject`,
        method: "PATCH",
      }),
    }),

    getParticipantStatus: builder.query({
      query: (participantId) => ({
        url: `/meeting-participants/${participantId}/status`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRequestToJoinMeetingMutation,
  useGetPendingRequestsQuery,
  useAcceptParticipantMutation,
  useRejectParticipantMutation,
  useGetParticipantStatusQuery,
} = meetingParticipantApi;

export default meetingParticipantApi;