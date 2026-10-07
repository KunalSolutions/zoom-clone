import apiSlice from "./apiSlice";

const meetingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMeeting: builder.mutation({
      query: (data) => ({
        url: "/meetings",
        method: "POST",
        body: data,
      }),
    }),

    getMyMeetings: builder.query({
      query: () => ({
        url: "/meetings",
        method: "GET",
      }),
    }),

    expireMeeting: builder.mutation({
      query: (meetingId) => ({
        url: `/meetings/${meetingId}/expire`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useCreateMeetingMutation,
  useGetMyMeetingsQuery,
  useExpireMeetingMutation,
} = meetingApi;

export default meetingApi;