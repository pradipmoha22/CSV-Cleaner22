import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { startCleaning, getJobStatus, getJobResults } from '../../services/api';

export const startCleaningThunk = createAsyncThunk(
    'jobs/startCleaning',
    async ({ fileId, options }, { rejectWithValue }) => {
        try {
            const response = await startCleaning(fileId, options);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.error || 'Failed to start cleaning');
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Network error');
        }
    }
);

export const pollJobStatus = createAsyncThunk(
    'jobs/pollJobStatus',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await getJobStatus(jobId);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.error || 'Failed to get job status');
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Network error');
        }
    }
);

export const fetchJobResults = createAsyncThunk(
    'jobs/fetchJobResults',
    async (jobId, { rejectWithValue }) => {
        try {
            const response = await getJobResults(jobId);
            if (response.data.success) {
                return response.data;
            }
            return rejectWithValue(response.data.error || 'Failed to get job results');
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Network error');
        }
    }
);

const jobSlice = createSlice({
    name: 'jobs',
    initialState: {
        currentJob: null,
        jobStatus: 'idle',
        jobError: null,
        jobProgress: 0,
        jobResults: null,
        polling: false,
    },
    reducers: {
        clearCurrentJob: (state) => {
            state.currentJob = null;
            state.jobResults = null;
            state.jobProgress = 0;
        },
        stopPolling: (state) => {
            state.polling = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(startCleaningThunk.pending, (state) => {
                state.jobStatus = 'loading';
                state.jobError = null;
            })
            .addCase(startCleaningThunk.fulfilled, (state, action) => {
                state.jobStatus = 'processing';
                state.currentJob = { id: action.payload.job_id };
                state.polling = true;
            })
            .addCase(startCleaningThunk.rejected, (state, action) => {
                state.jobStatus = 'failed';
                state.jobError = action.payload;
            })
            .addCase(pollJobStatus.fulfilled, (state, action) => {
                const jobData = action.payload;
                state.jobProgress = jobData.job?.progress || 0;
                if (jobData.job?.status === 'completed') {
                    state.jobStatus = 'succeeded';
                    state.polling = false;
                } else if (jobData.job?.status === 'failed') {
                    state.jobStatus = 'failed';
                    state.polling = false;
                }
            })
            .addCase(fetchJobResults.fulfilled, (state, action) => {
                state.jobResults = action.payload.results;
                state.jobStatus = 'succeeded';
            });
    },
});

export const { clearCurrentJob, stopPolling } = jobSlice.actions;
export default jobSlice.reducer;