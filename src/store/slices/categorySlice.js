import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/categories');
    return res.data.data.categories;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { list: [], isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.isLoading = false; state.list = action.payload || []; })
      .addCase(fetchCategories.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  },
});

export default categorySlice.reducer;
