import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error('API Error:', axiosError.response?.data || axiosError.message);
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      return axiosError.response.data;
    }
    return axiosError.message;
  }
  return error;
};

// Auth APIs
export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.get(`/auth/verify/${token}`),
};

// Donor APIs
export const donorService = {
  donate: (data: any) => api.post('/donor/donate', data),
  getIncomingRequests: (donorEmail: string) => api.get(`/donor/incoming-requests?donor_email=${donorEmail}`),
  acceptRequest: (notificationId: string) => api.post(`/donor/accept/${notificationId}`),
  rejectRequest: (notificationId: string) => api.post(`/donor/reject/${notificationId}`),
  approveRequest: (requestId: string) => api.post(`/donor/approve/${requestId}`),
  sendDeliveryDetails: (notificationId: string, details: any) => api.post(`/donor/send-details/${notificationId}`, details),
  getHistory: (donorEmail: string) => api.get(`/donor/history?donor_email=${donorEmail}`),
};

// Hospital APIs
export const hospitalService = {
  request: (data: any) => api.post('/hospital/request', data),
  getMyRequests: (hospitalEmail: string) => api.get(`/hospital/my-requests?hospital_email=${hospitalEmail}`),
  getRequestMatches: (requestId: string) => api.get(`/hospital/request/${requestId}/matches`),
  sendRequest: (donationId: string, payload: any) =>
    api.post(`/hospital/send-request/${donationId}`, payload),
  getAvailable: () => api.get('/hospital/available'),
  getMatches: () => api.get('/match'),
  getAcceptedRequests: () => api.get('/hospital/accepted-requests'),
  completeRequest: (notificationId: string) => api.post(`/hospital/complete-request/${notificationId}`),
  getHistory: () => api.get('/hospital/history'),
};

// Matching APIs
export const matchService = {
  getMatches: () => api.get('/match'),
};

export const recommendService = {
  getRecommendations: () => api.get('/recommend'),
  getStats: () => api.get('/recommend/stats'),
};
