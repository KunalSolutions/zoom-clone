import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://zoom-clone-wnsp.onrender.com/api/v1",

    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
  }),

  tagTypes: ["Auth", "Meeting", "Participant"],

  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
    }),

    createMeeting: builder.mutation({
      query: (body) => ({
        url: "/meetings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meeting"],
    }),

    getMeetings: builder.query({
      query: () => "/meetings",
      providesTags: ["Meeting"],
    }),

    getMeeting: builder.query({
      query: (meetingId) => `/meetings/${meetingId}`,
      providesTags: (result, error, meetingId) => [
        { type: "Meeting", id: meetingId },
      ],
    }),

    joinMeeting: builder.mutation({
      query: ({ meetingId, password }) => ({
        url: `/meetings/${meetingId}/join`,
        method: "POST",
        body: password ? { password } : {},
      }),
      invalidatesTags: ["Participant"],
    }),

    getMeetingParticipants: builder.query({
      query: (meetingId) =>
        `/meetings/${meetingId}/participants`,
      providesTags: (result, error, meetingId) => [
        { type: "Participant", id: meetingId },
      ],
    }),

    leaveMeeting: builder.mutation({
      query: (meetingId) => ({
        url: `/meetings/${meetingId}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),

    startMeeting: builder.mutation({
      query: (meetingId) => ({
        url: `/meetings/${meetingId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting"],
    }),

    endMeeting: builder.mutation({
      query: (meetingId) => ({
        url: `/meetings/${meetingId}/end`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,

  useCreateMeetingMutation,
  useGetMeetingsQuery,
  useGetMeetingQuery,

  useJoinMeetingMutation,
  useGetMeetingParticipantsQuery,
  useLeaveMeetingMutation,
  useStartMeetingMutation,
  useEndMeetingMutation,
} = apiSlice;