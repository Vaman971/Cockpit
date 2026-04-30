import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    error: null,
    loading: false
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    // logics or stages of user signing in.
    reducers:{
        signInStart: (state)=>{
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) =>{
            state.currentUser = action.payload; // json which we get on sign-in
            state.loading = false;
            state.error = null;
        },
        SignInFailure: (state,action) =>{
            state.loading = false;
            state.error = action.payload;
        },
        updateStart:(state) =>{
            state.loading = true;
            state.error = null;
        },
        updateSuccess:(state,action) =>{
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        updateFaiure: (state,action) =>{
            state.loading = false;
            state.error = action.payload;
        },
        deleteUserStart: (state) =>{
            state.loading = true;
            state.error = null;
        },
        deleteUserSuccess: (state, action)=>{
            state.currentUser = null; // We dont need the user's data to be there in redux store.
            state.loading = false;
            state.error = null;
        },
        deleteUserFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },
        signoutSuccess: (state) =>{
            state.currentUser = null;
            state.error = null;
            state.loading = false;
        },
    }
});

export const {signInStart, signInSuccess, SignInFailure, updateStart, updateSuccess, updateFaiure, deleteUserStart, deleteUserSuccess, deleteUserFailure,signoutSuccess} = userSlice.actions;

export default userSlice.reducer;