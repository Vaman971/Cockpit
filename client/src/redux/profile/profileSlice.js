import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentProfile: null,
    error: null,
    loading: false
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    // logics or stages of user signing in.
    reducers:{
        updateProfileStart:(state) =>{
            state.loading = true;
            state.error = null;
        },
        updateProfileSuccess:(state,action) =>{
            state.currentProfile = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateProfileFailure: (state,action) =>{
            state.loading = false;
            state.error = action.payload;
        },
        profileSignOut: (state) =>{
            state.currentProfile = null;
            state.loading = false;
            state.error = null;
        }
    }
});

export const { updateProfileStart, updateProfileSuccess, updateProfileFailure, profileSignOut} = profileSlice.actions;

export default profileSlice.reducer;