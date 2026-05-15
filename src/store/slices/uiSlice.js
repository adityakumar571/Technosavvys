import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isDarkMode: false,
    isLoading: false,
    toastMessage: null,
    selectedCategory: null,
  },
  reducers: {
    toggleDarkMode: (state) => { state.isDarkMode = !state.isDarkMode; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    showToast: (state, action) => { state.toastMessage = action.payload; },
    hideToast: (state) => { state.toastMessage = null; },
    setCategory: (state, action) => { state.selectedCategory = action.payload; },
  },
});

export const { toggleDarkMode, setLoading, showToast, hideToast, setCategory } = uiSlice.actions;
export default uiSlice.reducer;
