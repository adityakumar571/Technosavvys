import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  } catch (err) {
    console.log('Login error:', JSON.stringify({
      message: err.message,
      code: err.code,
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.baseURL + err.config?.url,
    }));
    return rejectWithValue(err.response?.data?.message || err.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', userData);
    return res.data.data;
  } catch (err) {
    console.log('Register error full:', JSON.stringify({
      message: err.message,
      code: err.code,
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url,
      baseURL: err.config?.baseURL,
    }));
    return rejectWithValue(err.response?.data?.message || err.message || 'Registration failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch Me
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
