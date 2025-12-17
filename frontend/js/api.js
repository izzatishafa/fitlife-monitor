// API Base URL
const API_BASE_URL = "http://localhost:8080/api";

// API Helper Functions
const api = {
  // ✨ Helper function to get current user ID
  getUserId() {
    const userStr =
      localStorage.getItem("fitlife_user") ||
      sessionStorage.getItem("fitlife_user");

    if (userStr) {
      const user = JSON.parse(userStr);
      console.log("👤 Parsed user object:", user);
      console.log("🆔 User ID:", user.id);
      return user.id;
    }

    console.log("❌ No user found in storage!");
    return null;
  },
  isDemoUser() {
    const userStr =
      sessionStorage.getItem("fitlife_user") ||
      localStorage.getItem("fitlife_user");

    if (!userStr) return false;

    const user = JSON.parse(userStr);
    return user.isDemo === true;
  },

  // Generic GET request
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("GET Error:", error);
      // Return null instead of throwing - let caller handle it
      return null;
    }
  },
  // Generic POST request
  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("POST Error:", error);
      showAlert("Error saving data. Please try again.", "error");
      throw error;
    }
  },
  // Generic DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error("DELETE Error:", error);
      showAlert("Error deleting data. Please try again.", "error");
      throw error;
    }
  },

  // Water API
  water: {
    getToday: () => {
      if (api.isDemoUser()) {
        return JSON.parse(sessionStorage.getItem("demo_water_today")) || [];
      }

      const userId = api.getUserId();
      return api.get(`/water/today?userId=${userId}`);
    },

    getTotal: () => {
      const userId = api.getUserId();
      console.log("🔍 getUserId() returns:", userId);
      return api.get(`/water/total?userId=${userId}`);
    },

    add: (amount) => {
      if (api.isDemoUser()) {
        const today =
          JSON.parse(sessionStorage.getItem("demo_water_today")) || [];

        today.push({
          amount,
          time: new Date().toLocaleTimeString(),
        });

        sessionStorage.setItem("demo_water_today", JSON.stringify(today));

        return Promise.resolve({ success: true });
      }

      const userId = api.getUserId();
      return api.post("/water/add", { userId, amount });
    },

    delete: (id) => api.delete(`/water/${id}`),
  },
  // Exercise API
  exercise: {
    getRecent: () => {
      const userId = api.getUserId();
      return api.get(`/exercise/recent?userId=${userId}`);
    },

    getTotal: () => {
      const userId = api.getUserId();
      return api.get(`/exercise/total?userId=${userId}`);
    },

    add: (type, duration, calories) => {
      const userId = api.getUserId();
      return api.post("/exercise/add", { userId, type, duration, calories });
    },

    delete: (id) => api.delete(`/exercise/${id}`),
  },

  // Sleep API
  sleep: {
    getRecent: () => {
      const userId = api.getUserId();
      return api.get(`/sleep/recent?userId=${userId}`);
    },

    getAverage: () => {
      const userId = api.getUserId();
      return api.get(`/sleep/average?userId=${userId}`);
    },

    add: (hours, quality) => {
      const userId = api.getUserId();
      return api.post("/sleep/add", { userId, hours, quality });
    },

    delete: (id) => api.delete(`/sleep/${id}`),
  },

  // Calories API
  calories: {
    getToday: () => {
      const userId = api.getUserId();
      return api.get(`/calories/today?userId=${userId}`);
    },

    getTotal: () => {
      const userId = api.getUserId();
      return api.get(`/calories/total?userId=${userId}`);
    },

    add: (foodName, calories) => {
      const userId = api.getUserId();
      return api.post("/calories/add", { userId, foodName, calories });
    },

    delete: (id) => api.delete(`/calories/${id}`),
  },

  // Mood API
  mood: {
    getToday: () => {
      const userId = api.getUserId();
      return api.get(`/mood/today?userId=${userId}`);
    },

    getAverage: () => {
      const userId = api.getUserId();
      return api.get(`/mood/average?userId=${userId}`);
    },

    save: (mood, note) => {
      const userId = api.getUserId();
      return api.post("/mood/save", { userId, mood, note });
    },
  },

  // Summary API
  summary: {
    getDaily: () => {
      const userId = api.getUserId();
      return api.get(`/dashboard/summary?userId=${userId}`);
    },
  },

  // Database API
  database: {
    getStats: () => {
      const userId = api.getUserId();
      return api.get(`/database/stats?userId=${userId}`);
    },

    exportCSV: () => {
      const userId = api.getUserId();
      return `${API_BASE_URL}/database/export/csv?userId=${userId}`;
    },

    exportJSON: () => {
      const userId = api.getUserId();
      return api.get(`/database/export/json?userId=${userId}`);
    },

    clearAll: (confirmation) => {
      const userId = api.getUserId();
      return api.delete(
        `/database/clear-all?confirmation=${confirmation}&userId=${userId}`
      );
    },

    cleanup: (days) => {
      if (api.isDemoUser()) {
        showAlert("Demo mode data is temporary", "info");
        return Promise.resolve(null);
      }

      const userId = api.getUserId();
      return api.delete(
        `/database/cleanup?olderThanDays=${days}&userId=${userId}`
      );
    },
  },

  // Dashboard API
  dashboard: {
    getStats: () => {
      const userId = api.getUserId();
      return api.get(`/dashboard/stats?userId=${userId}`);
    },
  },
};
// Alert Helper
function showAlert(message, type = "success") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  // Insert at the top of main content
  const main = document.querySelector("main");
  main.insertBefore(alertDiv, main.firstChild);

  // Auto remove after 3 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
