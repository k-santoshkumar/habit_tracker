import api from './index';

export const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.put('/auth/me', data);
