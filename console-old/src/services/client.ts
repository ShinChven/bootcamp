const feathers = require('@feathersjs/feathers');
const socketIO = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
const auth = require('@feathersjs/authentication-client');
const http = require('superagent');

export const devNSP = 'http://localhost:3030'; // 本机

export const authStorageKey = 'auth';

let socket = io(); // 生产环境下访问本机
if (window.location.hostname === 'localhost') {
  socket = io(devNSP);
}

const client = feathers();
client
  .configure(
    socketIO(socket, {
      transports: ['websocket'],
      upgrade: false,
      timeout: 60000,
    }),
  )
  .configure(
    auth({
      storageKey: authStorageKey,
      storage: window.localStorage,
    }),
  );
export default client;

/**
 * 开发模式下获取完整URL
 * @param filePath
 */
export const serverUrl = (filePath: string): string | undefined => {
  if (filePath.indexOf('http') !== 0) {
    if (window.location.hostname === 'localhost' && parseInt(window.location.port, 10) >= 8000) {
      return `${devNSP}${filePath}`;
    }
  }
  return filePath;
};

export const usersService = client.service('api/users');

export const enableSession = () => {
  return http
    .get(serverUrl('/action/open-session'))
    .set('Authorization', localStorage.getItem(authStorageKey));
};

export interface ErrorResponse {
  code: number
  message?: string
  name?: string
  className?: string
  errors?: any
}

export interface FeathersRESTfulResponse<T> {
  total: number
  limit: number
  skip: number
  data: Array<T>
}
