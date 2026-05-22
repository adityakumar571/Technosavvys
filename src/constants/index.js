export const API_BASE_URL = 'http://192.168.1.11:5000/api'; // Real device (same WiFi)
// export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
// export const API_BASE_URL = 'http://localhost:5000/api'; // iOS simulator
// export const API_BASE_URL = 'https://your-production-api.com/api'; // Production

export const SOCKET_URL = 'http://192.168.1.11:5000';

export const CATEGORIES = [
  { id: 'SSC', label: 'SSC', icon: '📋' },
  { id: 'Banking', label: 'Banking', icon: '🏦' },
  { id: 'Railway', label: 'Railway', icon: '🚂' },
  { id: 'UPSC', label: 'UPSC', icon: '🏛️' },
  { id: 'State PSC', label: 'State PSC', icon: '📜' },
  { id: 'Defence', label: 'Defence', icon: '🛡️' },
  { id: 'Teaching', label: 'Teaching', icon: '📚' },
  { id: 'Engineering', label: 'Engineering', icon: '⚙️' },
  { id: 'Medical', label: 'Medical', icon: '🏥' },
  { id: 'Other', label: 'Other', icon: '📖' },
];

export const TEST_TYPES = [
  { id: 'practice', label: 'Practice' },
  { id: 'mock', label: 'Mock Test' },
  { id: 'sectional', label: 'Sectional' },
  { id: 'previous-year', label: 'Previous Year' },
  { id: 'live', label: 'Live Test' },
];

export const RANK_LEVELS = [
  { name: 'Beginner', minPoints: 0, color: '#9CA3AF' },
  { name: 'Explorer', minPoints: 100, color: '#4CAF50' },
  { name: 'Scholar', minPoints: 500, color: '#2196F3' },
  { name: 'Expert', minPoints: 1000, color: '#9C27B0' },
  { name: 'Master', minPoints: 2500, color: '#FF9800' },
  { name: 'Champion', minPoints: 5000, color: '#F44336' },
];
