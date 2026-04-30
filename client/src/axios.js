import axios from 'axios';
import { signoutSuccess } from './redux/user/userSlice';
import { profileSignOut } from './redux/profile/profileSlice';
import { store } from './redux/store';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Always send cookies with requests
  timeout: 30000, // 30s request timeout
});

/**
 * Response interceptor:
 * - On 401 (Unauthorized) or 403 (Forbidden): clear redux state and redirect to sign-in.
 * - 500 (Server Error) is NOT treated as an auth failure — it is passed through.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        store.dispatch(signoutSuccess());
        store.dispatch(profileSignOut());
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
