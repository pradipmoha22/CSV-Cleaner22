import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { uploadFile } from '../../services/api';

export const uploadFileThunk = createAsyncThunk(
    'files/uploadFile',
    async (file, { rejectWithValue }) => {
        try {
            const response = await uploadFile(file);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.error || 'Upload failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Network error');
        }
    }
);

const fileSlice = createSlice({
    name: 'files',
    initialState: {
        currentFile: null,
        uploadStatus: 'idle',
        uploadError: null,
        uploadProgress: 0,
    },
    reducers: {
        clearCurrentFile: (state) => {
            state.currentFile = null;
            state.uploadStatus = 'idle';
            state.uploadError = null;
        },
        setUploadProgress: (state, action) => {
            state.uploadProgress = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadFileThunk.pending, (state) => {
                state.uploadStatus = 'loading';
                state.uploadError = null;
                state.uploadProgress = 10;
            })
            .addCase(uploadFileThunk.fulfilled, (state, action) => {
                state.uploadStatus = 'succeeded';
                state.currentFile = action.payload.file;
                state.uploadProgress = 100;
            })
            .addCase(uploadFileThunk.rejected, (state, action) => {
                state.uploadStatus = 'failed';
                state.uploadError = action.payload;
                state.uploadProgress = 0;
            });
    },
});

export const { clearCurrentFile, setUploadProgress } = fileSlice.actions;
export default fileSlice.reducer;