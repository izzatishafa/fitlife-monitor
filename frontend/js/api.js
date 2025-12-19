// API Base URL
const API_BASE_URL = "http://localhost:8080/api";

// API Helper Functions
const api = {
  // Helper function to get current user ID
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
      if (api.isDemoUser()) {
        const today =
          JSON.parse(sessionStorage.getItem("demo_water_today")) || [];

        const total = today.reduce((sum, log) => sum + log.amount, 0);

        return Promise.resolve({ total });
      }

      const userId = api.getUserId();
      return api.get(`/water/total?userId=${userId}`);
    },

    add: (amount) => {
      if (api.isDemoUser()) {
        const today =
          JSON.parse(sessionStorage.getItem("demo_water_today")) || [];

        today.push({
          id: Date.now(), 
          amount,
          time: new Date().toLocaleTimeString("en-GB"),
        });

        sessionStorage.setItem("demo_water_today", JSON.stringify(today));

        return Promise.resolve({ success: true });
      }

      const userId = api.getUserId();
      return api.post("/water/add", { userId, amount });
    },

    delete: (id) => {
      if (api.isDemoUser()) {
        const today =
          JSON.parse(sessionStorage.getItem("demo_water_today")) || [];

        const updated = today.filter((log) => log.id !== id);
        sessionStorage.setItem("demo_water_today", JSON.stringify(updated));

        return Promise.resolve({ success: true });
      }

      return api.delete(`/water/${id}`);
    },
  },
  // Exercise API
  exercise: {
    getRecent: () => {
      if (api.isDemoUser()) {
        return JSON.parse(sessionStorage.getItem("demo_exercise")) || [];
      }

      const userId = api.getUserId();
      return api.get(`/exercise/recent?userId=${userId}`);
    },

    getTotal: () => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_exercise")) || [];
        const total = data.reduce((sum, e) => sum + e.duration, 0);
        return Promise.resolve({ total });
      }

      const userId = api.getUserId();
      return api.get(`/exercise/total?userId=${userId}`);
    },

    add: (type, duration, calories) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_exercise")) || [];

        data.push({
          id: Date.now(),
          type,
          duration,
          calories,
          date: new Date().toISOString().split("T")[0], // ✅ YYYY-MM-DD
          time: new Date().toLocaleTimeString("en-GB"),
        });

        sessionStorage.setItem("demo_exercise", JSON.stringify(data));
        return Promise.resolve({ success: true });
      }

      const userId = api.getUserId();
      return api.post("/exercise/add", { userId, type, duration, calories });
    },
    delete: (id) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_exercise")) || [];
        const updated = data.filter((e) => e.id !== id);

        sessionStorage.setItem("demo_exercise", JSON.stringify(updated));
        return Promise.resolve({ success: true });
      }

      return api.delete(`/exercise/${id}`);
    },
  },

  // Sleep API
  sleep: {
    getRecent: () => {
      if (api.isDemoUser()) {
        return JSON.parse(sessionStorage.getItem("demo_sleep")) || [];
      }

      const userId = api.getUserId();
      return api.get(`/sleep/recent?userId=${userId}`);
    },

    getAverage: () => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_sleep")) || [];
        if (data.length === 0) return Promise.resolve({ average: 0 });

        const total = data.reduce((sum, s) => sum + s.hours, 0);
        const average = Math.round((total / data.length) * 10) / 10;

        return Promise.resolve({ average });
      }

      const userId = api.getUserId();
      return api.get(`/sleep/average?userId=${userId}`);
    },

    add: (hours, quality) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_sleep")) || [];

        data.push({
          id: Date.now(), 
          hours,
          quality,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          time: new Date().toLocaleTimeString("en-GB"),
        });

        sessionStorage.setItem("demo_sleep", JSON.stringify(data));
        return Promise.resolve({ success: true });
      }

      const userId = api.getUserId();
      return api.post("/sleep/add", { userId, hours, quality });
    },
    delete: (id) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_sleep")) || [];
        const updated = data.filter((s) => s.id !== id);

        sessionStorage.setItem("demo_sleep", JSON.stringify(updated));
        return Promise.resolve({ success: true });
      }

      return api.delete(`/sleep/${id}`);
    },
  },

  // Calories API
  calories: {
    getToday: () => {
      if (api.isDemoUser()) {
        return JSON.parse(sessionStorage.getItem("demo_calories")) || [];
      }

      const userId = api.getUserId();
      return api.get(`/calories/today?userId=${userId}`);
    },

    getTotal: () => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_calories")) || [];
        const total = data.reduce((sum, c) => sum + c.calories, 0);

        return Promise.resolve({ total });
      }

      const userId = api.getUserId();
      return api.get(`/calories/total?userId=${userId}`);
    },

    add: (foodName, calories) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_calories")) || [];

        data.push({
          id: Date.now(),
          foodName,
          calories,
          date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
          time: new Date().toLocaleTimeString("en-GB"),
        });

        sessionStorage.setItem("demo_calories", JSON.stringify(data));
        return Promise.resolve({ success: true });
      }

      const userId = api.getUserId();
      return api.post("/calories/add", { userId, foodName, calories });
    },
    delete: (id) => {
      if (api.isDemoUser()) {
        const data = JSON.parse(sessionStorage.getItem("demo_calories")) || [];
        const updated = data.filter((c) => c.id !== id);

        sessionStorage.setItem("demo_calories", JSON.stringify(updated));
        return Promise.resolve({ success: true });
      }

      return api.delete(`/calories/${id}`);
    },
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
      if (api.isDemoUser()) {
        return {
          water: 1200,
          calories: 1500,
          exercise: 300,
          sleep: 7,
          mood: 4,
        };
      }

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
      // ================= DEMO USER =================
      if (api.isDemoUser()) {
        const water =
          JSON.parse(sessionStorage.getItem("demo_water_today")) || [];

        const exercise =
          JSON.parse(sessionStorage.getItem("demo_exercise")) || [];

        const calories =
          JSON.parse(sessionStorage.getItem("demo_calories")) || [];

        const sleep = JSON.parse(sessionStorage.getItem("demo_sleep")) || [];

        const mood = JSON.parse(sessionStorage.getItem("demo_mood")) || null;

        // 💧 Water
        const waterToday = water.reduce((sum, w) => sum + (w.amount || 0), 0);

        // 🏃 Exercise (minutes)
        const exerciseToday = exercise.reduce(
          (sum, e) => sum + (e.duration || 0),
          0
        );

        // 🔥 Calories
        const caloriesToday = calories.reduce(
          (sum, c) => sum + (c.calories || 0),
          0
        );

        // 😴 Sleep average
        const avgSleep =
          sleep.length === 0
            ? 0
            : Math.round(
                (sleep.reduce((sum, s) => sum + (s.hours || 0), 0) /
                  sleep.length) *
                  10
              ) / 10;

        // 🙂 Mood
        const moodToday =
          JSON.parse(sessionStorage.getItem("demo_mood_today"))?.mood ?? 3;

        const history =
          JSON.parse(sessionStorage.getItem("demo_mood_history")) || [];

        const avgMood =
          history.length === 0
            ? moodToday
            : history.reduce((s, m) => s + m.mood, 0) / history.length;

        console.log(
          waterToday,
          "exercise: ",
          exerciseToday,
          "calories: ",
          caloriesToday,
          "sleep: ",
          avgSleep,
          "mood today: ",
          moodToday,
          "average mood: ",
          avgMood
        );
        return Promise.resolve({
          waterToday,
          exerciseToday,
          caloriesToday,
          avgSleep,
          moodToday,
          avgMood,
        });
      }

      // ================= REAL USER =================
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
