import axios from 'axios';
import { makeUseAxios } from 'axios-hooks';

import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : '',
  withCredentials: true,
});

instance.interceptors.request.use(
  async (request) => {
    const csrf = Cookies.get('csrftoken');
    if (csrf !== undefined) {
      request.headers['X-CSRFToken'] = csrf;
    }
    return request;
  },
  (error) => Promise.reject(error),
);

const useAxios = makeUseAxios({
  axios: instance,
});

export default useAxios;
