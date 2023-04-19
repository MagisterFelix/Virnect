const baseWS = `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${process.env.NODE_ENV === 'development' ? '127.0.0.1:8000' : window.location.host}`;

const ENDPOINTS = {
  authorization: '/api/sign-in/',
  registration: '/api/sign-up/',
  deauthorization: '/api/sign-out/',
  passwordReset: '/api/reset-password/',
  profile: '/api/profile/',
  notifications: '/api/notifications/',
  notification: '/api/notification/',
  user: '/api/user/',
  reports: '/api/reports/',
  report: '/api/report/',
  topics: '/api/topics/',
  topic: '/api/topic/',
  tags: '/api/tags/',
  tag: '/api/tag/',
  rooms: '/api/rooms/',
  room: '/api/room/',
  messages: '/api/messages/',
  message: '/api/message/',
  wsNotificationList: `${baseWS}/ws/notification-list/`,
  wsRoomList: `${baseWS}/ws/room-list/`,
  wsRoom: `${baseWS}/ws/room/`,
};

export default ENDPOINTS;
