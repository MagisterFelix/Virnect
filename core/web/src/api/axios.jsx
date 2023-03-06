import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';

import Cookies from 'js-cookie';

import ENDPOINTS from '@api/endpoints';

const nonRequiredAuthorization = ['/sign-in', '/sign-up', '/reset-password'];

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : '',
  withCredentials: true,
});

instance.interceptors.request.use(
  async (request) => {
    if (request.url === ENDPOINTS.authorization) {
      return request;
    }
    const csrf = Cookies.get('csrftoken');
    if (csrf !== undefined) {
      request.headers['X-CSRFToken'] = csrf;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!nonRequiredAuthorization.some((path) => window.location.pathname.includes(path))
    && (error.response.status === 401 || error.response.status === 403)) {
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  },
);

const useAxios = makeUseAxios({
  axios: instance,
});

export default useAxios;
