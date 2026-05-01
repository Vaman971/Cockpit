jest.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    default: {
      create: jest.fn(() => mockAxiosInstance),
    }
  };
});

import api from './axios';
import { toast } from 'react-toastify';
import { store } from './redux/store';
import { signoutSuccess } from './redux/user/userSlice';
import { profileSignOut } from './redux/profile/profileSlice';

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('./redux/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('./redux/user/userSlice', () => ({
  signoutSuccess: () => ({ type: 'user/signoutSuccess' }),
}));

jest.mock('./redux/profile/profileSlice', () => ({
  profileSignOut: () => ({ type: 'profile/profileSignOut' }),
}));

describe('Axios Interceptor', () => {
  let originalLocation;
  let errorHandler;

  beforeAll(() => {
    // Mock window.location
    originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    // Extract handler before mocks are cleared
    errorHandler = api.interceptors.response.use.mock.calls[0][1];
  });

  afterAll(() => {
    // Restore window.location
    window.location = originalLocation;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
  });

  it('should handle network errors', async () => {
    const error = { message: 'Network Error' };
    
    // Extract the response interceptor error handler
    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledWith('Network error — please check your connection.');
  });

  it('should dispatch signout and redirect on 401', async () => {
    const error = {
      response: { status: 401 }
    };
    

    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'user/signoutSuccess' });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'profile/profileSignOut' });
    expect(window.location.href).toBe('/sign-in');
  });

  it('should dispatch signout and redirect on 403', async () => {
    const error = {
      response: { status: 403 }
    };
    

    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'user/signoutSuccess' });
    expect(store.dispatch).toHaveBeenCalledWith({ type: 'profile/profileSignOut' });
    expect(window.location.href).toBe('/sign-in');
  });

  it('should show toast errors on 422 with validation details', async () => {
    const error = {
      response: {
        status: 422,
        data: {
          error: {
            details: [
              { field: 'email', message: 'Invalid email' },
              { field: 'password', message: 'Too short' }
            ]
          }
        }
      }
    };
    

    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledWith('email: Invalid email', { autoClose: 6000 });
    expect(toast.error).toHaveBeenCalledWith('password: Too short', { autoClose: 6000 });
  });

  it('should show generic toast error on 422 without details', async () => {
    const error = {
      response: {
        status: 422,
        data: {
          error: {
            message: 'Some generic validation error'
          }
        }
      }
    };
    

    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledWith('Some generic validation error');
  });

  it('should handle 500 error', async () => {
    const error = {
      response: {
        status: 500,
        data: {
          message: 'Internal Server Error'
        }
      }
    };
    

    
    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(toast.error).toHaveBeenCalledWith('Server error — please try again or contact support.');
  });
});
