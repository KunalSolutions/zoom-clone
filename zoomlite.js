// 1. users
{
  _id,
  name,
  email,
  password,
  avatar,
  role: "USER" | "ADMIN",
  status: "ACTIVE" | "INACTIVE",
  createdAt,
  updatedAt
}

{
  "name": "Kunal",
  "email": "kunal@example.com",
  "password": "hashed-password",
  "avatar": "/uploads/avatar.jpg",
  "role": "USER",
  "status": "ACTIVE"
}

// 2. meetings
{
  _id,
  meetingId,
  hostId,
  title,
  description,

  meetingType: "INSTANT" | "SCHEDULED",

  status: "WAITING" | "LIVE" | "ENDED",

  password,
  waitingRoom: true,

  settings: {
    allowParticipantVideo: true,
    allowParticipantAudio: true,
    allowScreenShare: true,
    allowChat: true,
    muteParticipantsOnEntry: false
  },

  startedAt,
  endedAt,

  createdAt,
  updatedAt
}

{
  "meetingId": "847291635",
  "hostId": "userObjectId",
  "title": "Monday Team Meeting",
  "meetingType": "INSTANT",
  "status": "LIVE",
  "password": "123456",
  "waitingRoom": true
}

// 3. meetingParticipants
{
  _id,

  meetingId,
  userId,

  role: "HOST" | "CO_HOST" | "PARTICIPANT",

  status: "INVITED" | "WAITING" | "JOINED" | "LEFT" | "REMOVED",

  audioEnabled: true,
  videoEnabled: true,
  screenSharing: false,

  joinedAt,
  leftAt,

  createdAt
}
// Who is currently in the meeting?
// Who joined?
// Who left?
// Who was removed?
// Who is the host?

// 4. meetingSessions
{
  _id,

  meetingId,
  userId,

  joinedAt,
  leftAt,

  duration,

  ipAddress,
  userAgent,

  createdAt
}
// Total meeting duration
// Individual participant duration
// Attendance reports

// 5. meetingMessages
{
  _id,

  meetingId,
  senderId,

  message,

  messageType: "TEXT" | "FILE" | "SYSTEM",

  fileUrl,

  createdAt
}

{
  "meetingId": "meeting123",
  "senderId": "user123",
  "message": "Can everyone see my screen?",
  "messageType": "TEXT"
}

// 6. scheduledMeetings
{
  _id,

  meetingId,
  hostId,

  title,
  description,

  scheduledStart,
  scheduledEnd,

  timezone,

  status: "SCHEDULED" | "STARTED" | "CANCELLED" | "COMPLETED",

  reminderMinutes: 10,

  createdAt,
  updatedAt
}

{
  "meetingId": "847291635",
  "hostId": "user123",
  "title": "Client Demo",
  "scheduledStart": "2026-10-10T11:00:00",
  "scheduledEnd": "2026-10-10T12:00:00",
  "timezone": "Asia/Kolkata",
  "status": "SCHEDULED",
  "reminderMinutes": 10
}

// 7. recordings
{
  _id,

  meetingId,
  hostId,

  fileUrl,
  fileName,

  duration,
  fileSize,

  storageProvider: "LOCAL" | "S3" | "CLOUDINARY",

  status: "PROCESSING" | "READY" | "FAILED",

  createdAt
}

// 8. notifications
{
  _id,

  userId,

  type:
    "MEETING_INVITE"
    | "MEETING_REMINDER"
    | "MEETING_STARTED"
    | "MEETING_ENDED",

  title,
  message,

  meetingId,

  isRead: false,

  createdAt
}


                         USERS
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
         MEETINGS      SCHEDULED      NOTIFICATIONS
             │          MEETINGS
             │
       ┌─────┼──────────────┐
       │     │              │
       ▼     ▼              ▼
 PARTICIPANTS MESSAGES    SESSIONS
       │
       │
       ▼
   RECORDINGS


// API 
POST   /api/v1/auth/register
POST   /api/v1/auth/login

POST   /api/v1/meetings
GET    /api/v1/meetings
GET    /api/v1/meetings/:meetingId
POST   /api/v1/meetings/:meetingId/join
POST   /api/v1/meetings/:meetingId/end

GET    /api/v1/meetings/:meetingId/participants

POST   /api/v1/meetings/:meetingId/messages
GET    /api/v1/meetings/:meetingId/messages

POST   /api/v1/scheduled-meetings
GET    /api/v1/scheduled-meetings

GET    /api/v1/recordings
GET    /api/v1/notifications  