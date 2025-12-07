// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';
// API Helper Functions
const api = {
    // Generic GET request
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            showAlert('Error loading data. Please check if the backend is running.', 'error');
            throw error;
        }
    },
    // Generic POST request
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            showAlert('Error saving data. Please try again.', 'error');
            throw error;
        }
    },
    // Generic DELETE request
    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return true;
        } catch (error) {
            console.error('DELETE Error:', error);
            showAlert('Error deleting data. Please try again.', 'error');
            throw error;
        }
    },
    // Water API
    water: {
        getToday: () => api.get('/water/today'),
        getTotal: () => api.get('/water/total'),
        add: (amount) => api.post('/water/add', { amount }),
        delete: (id) => api.delete(`/water/${id}`)
    },
    // Exercise API
    exercise: {
        getRecent: () => api.get('/exercise/recent'),
        getTotal: () => api.get('/exercise/total'),
        add: (type, duration, calories) => api.post('/exercise/add', { type, duration, calories }),
        delete: (id) => api.delete(`/exercise/${id}`)
    },
    // Sleep API
    sleep: {
        getRecent: () => api.get('/sleep/recent'),
        getAverage: () => api.get('/sleep/average'),
        add: (hours, quality) => api.post('/sleep/add', { hours, quality }),
        delete: (id) => api.delete(`/sleep/${id}`)
    },
    // Calories API
    calories: {
        getToday: () => api.get('/calories/today'),
        getTotal: () => api.get('/calories/total'),
        add: (foodName, calories) => api.post('/calories/add', { foodName, calories }),
        delete: (id) => api.delete(`/calories/${id}`)
    },

    // Mood API
    mood: {
        getToday: () => api.get('/mood/today'),
        getAverage: () => api.get('/mood/average'),
        save: (mood, note) => api.post('/mood/save', { mood, note })
    },
    // Summary API
    summary: {
        getDaily: () => api.get('/dashboard/summary')
    },

    // Database API
    database: {
        getStats: () => api.get('/database/stats'),
        exportCSV: () => `${API_BASE_URL}/database/export/csv`,
        exportJSON: () => api.get('/database/export/json'),
        clearAll: (confirmation) => api.delete(`/database/clear-all?confirmation=${confirmation}`),
        cleanup: (days) => api.delete(`/database/cleanup?olderThanDays=${days}`)
    },
    // Dashboard API
    dashboard: {
        getStats: () => api.get('/dashboard/stats')
    }
};
// Alert Helper
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insert at the top of main content
    const main = document.querySelector('main');
    main.insertBefore(alertDiv, main.firstChild);

    // Auto remove after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}
