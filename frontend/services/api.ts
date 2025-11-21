import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.45.39:4311/api'; // Change to your local IP

// Token management
const TOKEN_KEY = '@neurolock_token';
const USER_KEY = '@neurolock_user';

export const getToken = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

export const setToken = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error setting token:', error);
    }
};

export const removeToken = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

export const setUser = async (user: any): Promise<void> => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error setting user:', error);
    }
};

export const getUser = async (): Promise<any | null> => {
    try {
        const userStr = await AsyncStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

// API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getToken();
    
    const headers = new Headers(options.headers as HeadersInit);
    headers.set('Content-Type', 'application/json');
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    const config: RequestInit = {
        ...options,
        headers,
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
    }
    
    return data;
}

// Authentication API
export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await apiRequest<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (response.data.token) {
            await setToken(response.data.token);
            await setUser(response.data.staff);
        }
        
        return response;
    },
    
    register: async (email: string, password: string, name: string, role: string) => {
        return await apiRequest<any>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        });
    },
    
    logout: async () => {
        await removeToken();
        return await apiRequest<any>('/auth/logout', {
            method: 'POST',
        });
    },
    
    getMe: async () => {
        return await apiRequest<any>('/auth/me');
    },
};

// Patient API
export const patientAPI = {
    getAll: async () => {
        return await apiRequest<any>('/patients');
    },
    
    getById: async (id: number) => {
        return await apiRequest<any>(`/patients/${id}`);
    },
    
    getByMRN: async (mrn: string) => {
        return await apiRequest<any>(`/patients/mrn/${mrn}`);
    },
    
    create: async (patient: {
        mrn: string;
        full_name: string;
        dob?: string;
        phone?: string;
        email?: string;
    }) => {
        return await apiRequest<any>('/patients', {
            method: 'POST',
            body: JSON.stringify(patient),
        });
    },
    
    update: async (id: number, patient: Partial<{
        full_name: string;
        dob: string;
        phone: string;
        email: string;
        status: string;
        gender: string;
        diagnosis: string;
        ward: string;
        room: string;
        attending_physician: string;
        assigned_therapist: string;
    }>) => {
        return await apiRequest<any>(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patient),
        });
    },
    
    delete: async (id: number) => {
        return await apiRequest<any>(`/patients/${id}`, {
            method: 'DELETE',
        });
    },
};

// Therapy Notes API
export const therapyNoteAPI = {
    getAll: async () => {
        return await apiRequest<any>('/therapy-notes');
    },
    
    getByPatientId: async (patientId: number) => {
        return await apiRequest<any>(`/therapy-notes/patient/${patientId}`);
    },
    
    getById: async (id: number | string) => {
        return await apiRequest<any>(`/therapy-notes/${id}`);
    },
    
    getDecrypted: async (id: number) => {
        return await apiRequest<any>(`/therapy-notes/${id}`);
    },
    
    create: async (data: {
        patient_mrn?: string;
        patient_id?: number;
        staff_id?: string;
        note_content?: string;
        content?: string;
    }) => {
        return await apiRequest<any>('/therapy-notes', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    delete: async (id: number) => {
        return await apiRequest<any>(`/therapy-notes/${id}`, {
            method: 'DELETE',
        });
    },
};


// Staff API
export const staffAPI = {
    getAll: async () => {
        return await apiRequest<any>('/staff');
    },
    
    getById: async (id: number) => {
        return await apiRequest<any>(`/staff/${id}`);
    },
    
    update: async (id: number, staff: Partial<{
        name: string;
        email: string;
        role: string;
        status: string;
    }>) => {
        return await apiRequest<any>(`/staff/${id}`, {
            method: 'PUT',
            body: JSON.stringify(staff),
        });
    },
    
    deactivate: async (id: number) => {
        return await apiRequest<any>(`/staff/${id}`, {
            method: 'DELETE',
        });
    },
};

// Assessment API
export const assessmentAPI = {
    getAll: async () => {
        return await apiRequest<any>('/assessments');
    },
    
    getById: async (id: number) => {
        return await apiRequest<any>(`/assessments/${id}`);
    },
    
    getByPatientId: async (patientId: number) => {
        return await apiRequest<any>(`/assessments/patient/${patientId}`);
    },
    
    create: async (data: {
        patient_id?: number;
        patient_mrn?: string;
        assessment_type?: string;
        type?: string;
        scheduled_by?: string;
        status?: string;
        scheduled_date?: string;
        date?: string;
        notes?: string;
        assessment_notes?: string;
    }) => {
        return await apiRequest<any>('/assessments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    
    update: async (id: number, data: Partial<{
        status: string;
        scheduled_date: string;
        notes: string;
    }>) => {
        return await apiRequest<any>(`/assessments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    
    delete: async (id: number) => {
        return await apiRequest<any>(`/assessments/${id}`, {
            method: 'DELETE',
        });
    },
};

export default {
    auth: authAPI,
    patient: patientAPI,
    therapyNote: therapyNoteAPI,
    staff: staffAPI,
    assessment: assessmentAPI,
};
