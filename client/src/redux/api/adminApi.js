import apiSlice from "./apiSlice";

const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/register",
        method: "POST",
        body: data,
      }),
    }),

    loginAdmin: builder.mutation({
      query: (data) => ({
        url: "/admin/login",
        method: "POST",
        body: data,
      }),
    }),

    getAdminProfile: builder.query({
      query: () => ({
        url: "/admin/profile",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterAdminMutation,
  useLoginAdminMutation,
  useGetAdminProfileQuery,
} = adminApi;

export default adminApi;