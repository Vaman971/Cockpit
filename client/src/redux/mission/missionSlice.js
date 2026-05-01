import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../axios';

export const fetchMissions = createAsyncThunk(
  'mission/fetchMissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/mission/getAll', { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  missions: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const missionSlice = createSlice({
  name: 'mission',
  initialState,
  reducers: {
    clearMissionState: (state) => {
      state.missions = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMissions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.missions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearMissionState } = missionSlice.actions;

export const selectAllMissions = (state) => state.mission.missions;
export const selectMissionStatus = (state) => state.mission.status;
export const selectMissionError = (state) => state.mission.error;

export default missionSlice.reducer;
