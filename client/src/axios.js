import axios from 'axios';
import { toast } from 'react-toastify';
import { signoutSuccess } from './redux/user/userSlice';
import { profileSignOut } from './redux/profile/profileSlice';
import { store } from './redux/store';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Always send cookies with requests
  timeout: 30000,        // 30s request timeout
});

/**
 * Response interceptor:
 * - 401 / 403 → clear Redux state, redirect to /sign-in
 * - 422 → show Zod validation error details as a toast
 * - 500 → show generic server error toast
 * - Network errors → show connectivity toast
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network / timeout error
      toast.error('Network error — please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401 || status === 403) {
      store.dispatch(signoutSuccess());
      store.dispatch(profileSignOut());
      window.location.href = '/sign-in';
      return Promise.reject(error);
    }

    if (status === 422) {
      // Zod validation errors — show each field error
      const details = data?.error?.details;
      if (details && details.length > 0) {
        details.forEach((d) =>
          toast.error(`${d.field ? d.field + ': ' : ''}${d.message}`, { autoClose: 6000 })
        );
      } else {
        toast.error(data?.error?.message || 'Validation failed.');
      }
      return Promise.reject(error);
    }

    if (status === 500) {
      toast.error('Server error — please try again or contact support.');
    }

    return Promise.reject(error);
  }
);

export default api;

