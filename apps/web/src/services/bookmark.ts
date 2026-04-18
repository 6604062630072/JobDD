import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const bookmarkService = {
    toggle: async (candidateId: string) => {
        try {
            const { data } = await api.post(`/bookmarks/toggle/${candidateId}`);
            return data;
        } catch (error: any) {
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);
            console.error('Bookmark toggle error:', error.response?.data || error.message);
            throw error;
        }

    },

    getMyList: async () => {
        const { data } = await api.get('/bookmarks/my-list');
        return data;
    }
};