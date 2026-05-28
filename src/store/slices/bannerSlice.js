import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBanners = createAsyncThunk('banners/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/banners');
    return res.data.data.banners;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch banners');
  }
});

const bannerSlice = createSlice({
  name: 'banners',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBanners.fulfilled, (state, action) => { state.isLoading = false; state.list = action.payload || []; })
      .addCase(fetchBanners.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  },
});

export default bannerSlice.reducer;
