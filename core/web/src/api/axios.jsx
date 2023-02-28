import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';

import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : '',
  withCredentials: true,
});

instance.interceptors.request.use(
  async (request) => {
    if (request.url === '/api/sign-in/') {
      return request;
    }
    const csrf = Cookies.get('csrftoken');
    if (csrf === undefined) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      window.location.href = '/sign-in';
      return Promise.reject(request);
    }
    request.headers['X-CSRFToken'] = csrf;
    return request;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      window.location.href = '/sign-in';
      return error;
    }
    return Promise.reject(error);
  },
);

const useAxios = makeUseAxios({
  axios: instance,
});

export default useAxios;
