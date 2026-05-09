import { configureStore } from '@reduxjs/toolkit';
import fileReducer from './slices/fileSlice';
import jobReducer from './slices/jobSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        files: fileReducer,
        jobs: jobReducer,
        ui: uiReducer,
    },
});