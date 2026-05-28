import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import batchReducer from './slices/batchSlice';
import liveReducer from './slices/liveSlice';
import notificationReducer from './slices/notificationSlice';
import testReducer from './slices/testSlice';
import uiReducer from './slices/uiSlice';
import bannerReducer from './slices/bannerSlice';
import categoryReducer from './slices/categorySlice';

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  blacklist: ['isLoading', 'error'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  courses: courseReducer,
  batches: batchReducer,
  live: liveReducer,
  notifications: notificationReducer,
  tests: testReducer,
  ui: uiReducer,
  banners: bannerReducer,
  categories: categoryReducer,
});

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
