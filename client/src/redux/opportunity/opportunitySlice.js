import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../axios';

export const fetchOpportunities = createAsyncThunk(
  'opportunity/fetchOpportunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/oppurtunities/getOpp', { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  opportunities: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const opportunitySlice = createSlice({
  name: 'opportunity',
  initialState,
  reducers: {
    clearOpportunityState: (state) => {
      state.opportunities = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpportunities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.opportunities = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearOpportunityState } = opportunitySlice.actions;

export const selectAllOpportunities = (state) => state.opportunity.opportunities;
export const selectOpportunityStatus = (state) => state.opportunity.status;
export const selectOpportunityError = (state) => state.opportunity.error;

export default opportunitySlice.reducer;
