import { configureStore, combineReducers } from '@reduxjs/toolkit'
import userReducer from './user/userSlice'
import profileReducer from './profile/profileSlice';
import { persistReducer,  persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import themeConfigSlice from './themeConfigSlice';
import projectReducer from './project/projectSlice';
import opportunityReducer from './opportunity/opportunitySlice';
import missionReducer from './mission/missionSlice';


const rootReducer = combineReducers(
  {
    user: userReducer,
    profile: profileReducer,
    themeConfig: themeConfigSlice,
    project: projectReducer,
    opportunity: opportunityReducer,
    mission: missionReducer,
  }
);

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }), // to prevent the default error 
});


 
export const persistor = persistStore(store);