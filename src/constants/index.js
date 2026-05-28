
export const API_BASE_URL = 'http://192.168.56.1:5000/api';

export const SOCKET_URL = 'http://192.168.56.1:5000/api';

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
