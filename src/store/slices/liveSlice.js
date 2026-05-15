import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchLiveClasses = createAsyncThunk('live/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/live', { params });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const joinLiveClass = createAsyncThunk('live/join', async (id, { rejectWithValue }) => {
  try {
    const res = await api.post(`/live/${id}/join`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const liveSlice = createSlice({
  name: 'live',
  initialState: {
    classes: [],
    currentClass: null,
    isLoading: false,
    error: null,
    chatMessages: [],
  },
  reducers: {
    setCurrentClass: (state, action) => { state.currentClass = action.payload; },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    clearChat: (state) => { state.chatMessages = []; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLiveClasses.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchLiveClasses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.classes = action.payload.liveClasses;
    });
    builder.addCase(joinLiveClass.fulfilled, (state, action) => {
      state.currentClass = action.payload.liveClass;
    });
  },
});

export const { setCurrentClass, addChatMessage, clearChat } = liveSlice.actions;
export default liveSlice.reducer;
