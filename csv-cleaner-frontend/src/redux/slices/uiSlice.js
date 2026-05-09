import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        isLoading: false,
        currentPage: 'upload',
    },
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
    },
});

export const { setLoading, setCurrentPage } = uiSlice.actions;
export default uiSlice.reducer;