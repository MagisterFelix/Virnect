const baseWS = `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${process.env.NODE_ENV === 'development' ? '127.0.0.1:8000' : window.location.host}`;

const ENDPOINTS = {
  authorization: '/api/sign-in/',
  registration: '/api/sign-up/',
  deauthorization: '/api/sign-out/',
  passwordReset: '/api/reset-password/',
  profile: '/api/profile/',
  user: '/api/user/',
  report: '/api/reports/',
  topics: '/api/topics/',
  tags: '/api/tags/',
  tag: '/api/tag/',
  rooms: '/api/rooms/',
  room: '/api/room/',
  connecting: '/api/connect/',
  disconnecting: '/api/disconnect/',
  wsRoomList: `${baseWS}/room-list/`,
  wsRoom: `${baseWS}/room/`,
};

export default ENDPOINTS;
