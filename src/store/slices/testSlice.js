import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTests = createAsyncThunk('tests/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/tests', { params });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchTestById = createAsyncThunk('tests/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/tests/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const submitTest = createAsyncThunk('tests/submit', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/tests/${id}/submit`, data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const testSlice = createSlice({
  name: 'tests',
  initialState: {
    list: [],
    selectedTest: null,
    currentAttempt: null,
    result: null,
    isLoading: false,
    error: null,
    answers: {},
    currentQuestion: 0,
    timeLeft: 0,
    isSubmitting: false,
  },
  reducers: {
    setAnswer: (state, action) => {
      const { questionIndex, selectedOption } = action.payload;
      state.answers[questionIndex] = selectedOption;
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    resetTest: (state) => {
      state.answers = {};
      state.currentQuestion = 0;
      state.timeLeft = 0;
      state.result = null;
      state.selectedTest = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTests.fulfilled, (state, action) => {
      state.list = action.payload.tests;
    });
    builder.addCase(fetchTestById.fulfilled, (state, action) => {
      state.selectedTest = action.payload.test;
      state.timeLeft = action.payload.test.duration * 60;
    });
    builder.addCase(submitTest.pending, (state) => { state.isSubmitting = true; });
    builder.addCase(submitTest.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.result = action.payload;
    });
    builder.addCase(submitTest.rejected, (state) => { state.isSubmitting = false; });
  },
});

export const { setAnswer, setCurrentQuestion, setTimeLeft, resetTest } = testSlice.actions;
export default testSlice.reducer;
