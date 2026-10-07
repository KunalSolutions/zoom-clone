import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import JoinMeeting from "./pages/JoinMeeting";
import WaitingRoom from "./pages/WaitingRoom";
import AdminDashboard from "./pages/AdminDashboard";
import MeetingRoom from "./pages/MeetingRoom";
import Entry from "./pages/Entry";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <Entry />
          }
        />

        {/* Admin */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Employee / Participant */}
        <Route
          path="/join"
          element={<JoinMeeting />}
        />

        <Route
          path="/waiting/:participantId"
          element={<WaitingRoom />}
        />

        {/* Meeting Room */}
        <Route
          path="/meeting/:meetingId"
          element={<MeetingRoom />}
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;