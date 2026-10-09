import { Link } from "react-router-dom";
import { ShieldCheck, Users, ArrowUpRight, Video, LockKeyhole, Zap } from "lucide-react";

function Entry() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] px-5 py-12 sm:px-8">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#232466]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#EF5622]/[0.06] blur-3xl" />

      <div className="relative w-full max-w-5xl">
        <header className="mb-12 text-center sm:mb-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#232466] shadow-xl shadow-[#232466]/20">
            <Video className="h-8 w-8 text-white" strokeWidth={1.8} />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-gray-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AVSI TECHNOLOGIES
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Entry to{" "}
            <span className="text-[#232466]">AVSI WORKSPACE</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
            One workspace. Better collaboration.
            <br className="hidden sm:block" />
            Create meetings or connect with your team in seconds.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          <Link
            to="/admin/login"
            className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#232466]/30 hover:shadow-2xl hover:shadow-[#232466]/10 sm:p-9"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#232466]/[0.035] transition-colors group-hover:bg-[#232466]/[0.07]" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#232466] shadow-lg shadow-[#232466]/20 transition-transform duration-300 group-hover:scale-105">
                <ShieldCheck className="h-7 w-7 text-white" strokeWidth={1.8} />
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-hover:border-[#232466] group-hover:bg-[#232466] group-hover:text-white">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>

            <div className="relative mt-8">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#232466]">
                Administrator access
              </span>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Manage your meetings
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
                Create meeting rooms, manage access requests, and bring your
                team together from one central dashboard.
              </p>
            </div>

            <div className="relative mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="font-semibold text-[#232466]">
                Continue as Admin
              </span>
              <span className="text-xs font-medium text-gray-400">
                Secure access
              </span>
            </div>
          </Link>

          <Link
            to="/join"
            className="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#EF5622]/30 hover:shadow-2xl hover:shadow-[#EF5622]/10 sm:p-9"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#EF5622]/[0.035] transition-colors group-hover:bg-[#EF5622]/[0.07]" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EF5622] shadow-lg shadow-[#EF5622]/20 transition-transform duration-300 group-hover:scale-105">
                <Users className="h-7 w-7 text-white" strokeWidth={1.8} />
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-hover:border-[#EF5622] group-hover:bg-[#EF5622] group-hover:text-white">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>

            <div className="relative mt-8">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#EF5622]">
                Team member access
              </span>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Join a meeting
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
                Enter your name and meeting code to request access and connect
                with your colleagues.
              </p>
            </div>

            <div className="relative mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
              <span className="font-semibold text-[#EF5622]">
                Join your team
              </span>
              <span className="text-xs font-medium text-gray-400">
                Quick connection
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-xs font-medium text-gray-500 sm:mt-11 sm:gap-x-10">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 text-[#232466]" />
            Secure access
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-[#232466]" />
            Video collaboration
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#EF5622]" />
            Simple to use
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AVSI Technologies. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default Entry;