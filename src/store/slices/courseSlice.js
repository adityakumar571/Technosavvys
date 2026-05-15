import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/courses', { params });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch courses');
  }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/courses/${id}`);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch course');
  }
});

export const fetchEnrolledCourses = createAsyncThunk('courses/enrolled', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/courses/enrolled');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const searchCourses = createAsyncThunk('courses/search', async (query, { rejectWithValue }) => {
  try {
    const res = await api.get('/courses/search', { params: { q: query } });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    list: [],
    enrolled: [],
    searchResults: [],
    selectedCourse: null,
    isLoading: false,
    error: null,
    total: 0,
  },
  reducers: {
    clearSelectedCourse: (state) => { state.selectedCourse = null; },
    clearSearch: (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCourses.pending, (state) => { state.isLoading = true; });
    builder.addCase(fetchCourses.fulfilled, (state, action) => {
      state.isLoading = false;
      state.list = action.payload.courses;
      state.total = action.payload.total;
    });
    builder.addCase(fetchCourses.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(fetchCourseById.fulfilled, (state, action) => {
      state.selectedCourse = action.payload.course;
    });
    builder.addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
      state.enrolled = action.payload.courses;
    });
    builder.addCase(searchCourses.fulfilled, (state, action) => {
      state.searchResults = action.payload.courses;
    });
  },
});

export const { clearSelectedCourse, clearSearch } = courseSlice.actions;
export default courseSlice.reducer;
