import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBatches = createAsyncThunk('batches/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/batches', { params });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBatchById = createAsyncThunk('batches/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/batches/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBatchContent = createAsyncThunk('batches/fetchContent', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/batches/${id}/content`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const batchSlice = createSlice({
  name: 'batches',
  initialState: {
    list: [],
    selectedBatch: null,
    batchContent: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBatches.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchBatches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload.batches;
    });
    builder.addCase(fetchBatchById.fulfilled, (state, action) => {
      state.selectedBatch = action.payload.batch;
    });
    builder.addCase(fetchBatchContent.fulfilled, (state, action) => {
      state.batchContent = action.payload;
    });
  },
});

export default batchSlice.reducer;
