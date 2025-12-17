// API Configuration
const API_URL = "http://localhost:8080/api";

// AUTENTIKASI
function checkAuthentication() {
  const user =
    sessionStorage.getItem("fitlife_user") ||
    localStorage.getItem("fitlife_user");
  const token =
    sessionStorage.getItem("fitlife_token") ||
    localStorage.getItem("fitlife_token");

  if (!user || !token) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

function updateGreeting() {
  const greetingEl = document.getElementById("greeting");

  const user =
    JSON.parse(sessionStorage.getItem("fitlife_user")) ||
    JSON.parse(localStorage.getItem("fitlife_user"));

  const name = user?.name || "User";

  const hour = new Date().getHours();
  let greetingText = "";

  if (hour >= 5 && hour < 11) {
    greetingText = `Good Morning, ${name}! ☀️`;
  } else if (hour >= 11 && hour < 18) {
    greetingText = `Good Afternoon, ${name}! 🌤️`;
  } else if (hour >= 18 && hour < 20) {
    greetingText = `Good Evening, ${name}! 🌆`;
  } else {
    greetingText = `Good Night, ${name}! 🌙`;
  }

  greetingEl.textContent = greetingText;
}

if (!checkAuthentication()) {
  throw new Error("Not authenticated");
}

updateGreeting();
setInterval(updateGreeting, 10 * 60 * 1000);

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem("fitlife_user"));
}

function isDemoUser() {
  const user = getCurrentUser();
  return user && user.isDemo === true;
}

async function handleLogout() {
  const confirmed = await swalConfirm({
    title: "Wait 🥺",
    text: "You sure you wanna leave Fitlife?",
    confirmText: "Yes, log me out",
    icon: "warning",
  });

  if (!confirmed) return;

  const user =
    JSON.parse(sessionStorage.getItem("fitlife_user")) ||
    JSON.parse(localStorage.getItem("fitlife_user"));

  // 🧪 DEMO MODE → reset total
  if (user?.isDemo) {
    // hapus semua demo data
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith("demo_"))
      .forEach((key) => sessionStorage.removeItem(key));

    sessionStorage.clear(); // aman, demo only
  } else {
    // 👤 USER ASLI → jangan hapus localStorage selain auth
    localStorage.removeItem("fitlife_user");
    localStorage.removeItem("fitlife_token");
  }

  // auth wajib dihapus
  sessionStorage.removeItem("fitlife_user");
  sessionStorage.removeItem("fitlife_token");

  await Swal.fire({
    icon: "success",
    title: "Logged out",
    text: "See you again 👋",
    timer: 1500,
    showConfirmButton: false,
  });

  window.location.href = "login.html";
}

// Tab Management
function showTab(tabName) {
  // PAKSA BALIK KE ATAS
  window.scrollTo({ top: 0, behavior: "smooth" });

  const lastBMI = localStorage.getItem("lastBMI");
  if (lastBMI) {
    document.getElementById("dashboard-bmi").textContent = lastBMI;
  }

  // Hide ALL tabs
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.add("hidden");
    tab.classList.remove("active");
  });

  // Remove active dari semua tab button
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show ONLY the selected tab
  const selectedTab = document.getElementById(`${tabName}-tab`);
  selectedTab.classList.remove("hidden");
  selectedTab.classList.add("active");

  // Activate tab button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Load data sesuai tab
  if (tabName === "dashboard") loadDashboard();
  else if (tabName === "water") loadWaterData();
  else if (tabName === "exercise") loadExerciseData();
  else if (tabName === "sleep") loadSleepData();
  else if (tabName === "calories") loadCaloriesData();
  else if (tabName === "mood") loadMoodData();
  else if (tabName === "summary") loadSummary();
  else if (tabName === "database") loadDatabase();
}

function getActiveTab() {
  const activeBtn = document.querySelector(".tab-btn.active");
  return activeBtn ? activeBtn.dataset.tab : "dashboard";
}

// Search functionality
let isSearchOpen = false;

function toggleSearch() {
  isSearchOpen = !isSearchOpen;

  if (isSearchOpen) {
    showSearchModal();
  } else {
    hideSearchModal();
  }
}

function showSearchModal() {
  // Create search modal
  const modal = document.createElement("div");
  modal.id = "searchModal";
  modal.className =
    "fixed inset-0 z-50 flex items-start justify-center pt-20 px-4";
  modal.innerHTML = `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" onclick="toggleSearch()"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <!-- Search Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center gap-4">
          <i class="fas fa-magnifying-glass text-indigo-600 text-xl"></i>
          <input
            type="text"
            id="searchInput"
            placeholder="Search logs, dates, or metrics..."
            class="flex-1 text-lg outline-none"
            oninput="performSearch(this.value)"
            autofocus
          />
          <button onclick="toggleSearch()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>
      
      <!-- Search Filters -->
      <div class="px-6 py-4 border-b border-gray-200 flex gap-2 flex-wrap">
        <button onclick="setSearchFilter('all')" class="search-filter active px-4 py-2 rounded-full text-sm font-medium bg-indigo-600 text-white">
          All
        </button>
        <button onclick="setSearchFilter('water')" class="search-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          💧 Water
        </button>
        <button onclick="setSearchFilter('exercise')" class="search-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          🏃 Exercise
        </button>
        <button onclick="setSearchFilter('sleep')" class="search-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          🌙 Sleep
        </button>
        <button onclick="setSearchFilter('calories')" class="search-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          🍽️ Calories
        </button>
        <button onclick="setSearchFilter('mood')" class="search-filter px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
          😊 Mood
        </button>
      </div>
      
      <!-- Search Results -->
      <div id="searchResults" class="max-h-96 overflow-y-auto">
        <div class="p-8 text-center text-gray-400">
          <i class="fas fa-magnifying-glass text-4xl mb-4"></i>
          <p>Start typing to search your health logs...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Focus on search input
  setTimeout(() => {
    document.getElementById("searchInput").focus();
  }, 100);
}

function hideSearchModal() {
  const modal = document.getElementById("searchModal");
  if (modal) {
    modal.remove();
  }
  isSearchOpen = false;
  currentSearchFilter = "all";
}

// Search filter state
let currentSearchFilter = "all";

function setSearchFilter(filter) {
  currentSearchFilter = filter;

  // Update active button
  document.querySelectorAll(".search-filter").forEach((btn) => {
    btn.classList.remove("active", "bg-indigo-600", "text-white");
    btn.classList.add("bg-gray-100", "text-gray-700");
  });

  event.target.classList.add("active", "bg-indigo-600", "text-white");
  event.target.classList.remove("bg-gray-100", "text-gray-700");

  // Re-run search with current query
  const searchInput = document.getElementById("searchInput");
  if (searchInput && searchInput.value) {
    performSearch(searchInput.value);
  }
}

async function performSearch(query) {
  const resultsContainer = document.getElementById("searchResults");

  if (!query.trim()) {
    resultsContainer.innerHTML = `
      <div class="p-8 text-center text-gray-400">
        <i class="fas fa-magnifying-glass text-4xl mb-4"></i>
        <p>Start typing to search your health logs...</p>
      </div>
    `;
    return;
  }

  // Show loading
  resultsContainer.innerHTML = `
    <div class="p-8 text-center">
      <i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i>
    </div>
  `;

  // Add this right after "Show loading" to see what's happening
  console.log("Search query:", query);
  console.log("API URL:", API_URL);
  console.log("Current filter:", currentSearchFilter);

  try {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Fetch data based on filter
    if (currentSearchFilter === "all" || currentSearchFilter === "water") {
      try {
        const response = await fetch(`${API_URL}/water`);
        const waterData = await response.json();

        waterData.forEach((log) => {
          const dateStr = log.date ? log.date.toString() : "";
          const timeStr = log.time ? log.time.toString() : "";
          const amountStr = log.amount ? log.amount.toString() : "";

          if (
            dateStr.toLowerCase().includes(lowerQuery) ||
            timeStr.toLowerCase().includes(lowerQuery) ||
            amountStr.includes(lowerQuery) ||
            "water".includes(lowerQuery)
          ) {
            results.push({
              type: "water",
              icon: "💧",
              title: `Water: ${log.amount}ml`,
              subtitle: `${log.date} at ${log.time}`,
              data: log,
            });
          }
        });
      } catch (e) {
        console.error("Water search error:", e);
      }
    }

    if (currentSearchFilter === "all" || currentSearchFilter === "exercise") {
      try {
        const response = await fetch(`${API_URL}/exercise`);
        const exerciseData = await response.json();

        exerciseData.forEach((log) => {
          const dateStr = log.date ? log.date.toString() : "";
          const typeStr = log.type ? log.type.toString().toLowerCase() : "";
          const durationStr = log.duration ? log.duration.toString() : "";

          if (
            dateStr.toLowerCase().includes(lowerQuery) ||
            typeStr.includes(lowerQuery) ||
            durationStr.includes(lowerQuery) ||
            "exercise".includes(lowerQuery)
          ) {
            results.push({
              type: "exercise",
              icon: "🏃",
              title: `${log.type}: ${log.duration} min`,
              subtitle: `${log.date} at ${log.time} • ${log.calories} kcal`,
              data: log,
            });
          }
        });
      } catch (e) {
        console.error("Exercise search error:", e);
      }
    }

    if (currentSearchFilter === "all" || currentSearchFilter === "sleep") {
      try {
        const response = await fetch(`${API_URL}/sleep`);
        const sleepData = await response.json();

        sleepData.forEach((log) => {
          const dateStr = log.date ? log.date.toString() : "";
          const hoursStr = log.hours ? log.hours.toString() : "";

          if (
            dateStr.toLowerCase().includes(lowerQuery) ||
            hoursStr.includes(lowerQuery) ||
            "sleep".includes(lowerQuery)
          ) {
            results.push({
              type: "sleep",
              icon: "🌙",
              title: `Sleep: ${log.hours} hours`,
              subtitle: `${log.date} • Quality: ${log.quality}/5`,
              data: log,
            });
          }
        });
      } catch (e) {
        console.error("Sleep search error:", e);
      }
    }

    if (currentSearchFilter === "all" || currentSearchFilter === "calories") {
      try {
        const response = await fetch(`${API_URL}/calories`);
        const caloriesData = await response.json();

        caloriesData.forEach((log) => {
          const dateStr = log.date ? log.date.toString() : "";
          const foodStr = log.foodName
            ? log.foodName.toString().toLowerCase()
            : "";
          const calStr = log.calories ? log.calories.toString() : "";

          if (
            dateStr.toLowerCase().includes(lowerQuery) ||
            foodStr.includes(lowerQuery) ||
            calStr.includes(lowerQuery) ||
            "calories".includes(lowerQuery) ||
            "food".includes(lowerQuery)
          ) {
            results.push({
              type: "calories",
              icon: "🍽️",
              title: `${log.foodName}: ${log.calories} kcal`,
              subtitle: `${log.date} at ${log.time}`,
              data: log,
            });
          }
        });
      } catch (e) {
        console.error("Calories search error:", e);
      }
    }

    if (currentSearchFilter === "all" || currentSearchFilter === "mood") {
      try {
        const response = await fetch(`${API_URL}/mood`);
        const moodData = await response.json();
        const moodLabels = [
          "",
          "Very Bad",
          "Bad",
          "Neutral",
          "Good",
          "Excellent",
        ];

        moodData.forEach((log) => {
          const dateStr = log.date ? log.date.toString() : "";
          const moodLabel = moodLabels[log.mood]
            ? moodLabels[log.mood].toLowerCase()
            : "";
          const noteStr = log.note ? log.note.toString().toLowerCase() : "";

          if (
            dateStr.toLowerCase().includes(lowerQuery) ||
            moodLabel.includes(lowerQuery) ||
            noteStr.includes(lowerQuery) ||
            "mood".includes(lowerQuery)
          ) {
            results.push({
              type: "mood",
              icon: ["", "😢", "😕", "😐", "😊", "😄"][log.mood] || "😐",
              title: `Mood: ${moodLabels[log.mood] || "Unknown"}`,
              subtitle: `${log.date}${log.note ? " • " + log.note : ""}`,
              data: log,
            });
          }
        });
      } catch (e) {
        console.error("Mood search error:", e);
      }
    }

    // Sort by date (most recent first)
    results.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateB - dateA;
    });

    // Display results
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="p-8 text-center text-gray-400">
          <i class="fas fa-search text-4xl mb-4"></i>
          <p>No results found for "${query}"</p>
          <p class="text-sm mt-2">Try searching for dates (2024-12), food names, exercise types, or amounts</p>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = `
        <div class="p-4">
          <p class="text-sm text-gray-500 mb-3 px-2">${results.length} result${
        results.length > 1 ? "s" : ""
      } found</p>
          ${results
            .map(
              (result) => `
            <div class="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition flex items-start gap-3 border-b border-gray-100 last:border-0"
                 onclick="viewSearchResult('${result.type}', ${result.data.id})">
              <span class="text-2xl">${result.icon}</span>
              <div class="flex-1">
                <p class="font-semibold text-gray-800">${result.title}</p>
                <p class="text-sm text-gray-500">${result.subtitle}</p>
              </div>
              <i class="fas fa-chevron-right text-gray-400 text-sm mt-1"></i>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
  } catch (error) {
    console.error("Search error:", error);
    resultsContainer.innerHTML = `
      <div class="p-8 text-center text-red-500">
        <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
        <p>Error performing search</p>
        <p class="text-sm mt-2">${error.message}</p>
      </div>
    `;
  }
}

function viewSearchResult(type, id) {
  // Close search modal
  hideSearchModal();

  // Navigate to the appropriate section
  // You can customize this based on your app structure
  alert(
    `Viewing ${type} log with ID: ${id}\n\nYou can implement navigation to edit/view this log.`
  );

  // Example: Navigate to logs page with filter
  // window.location.href = `logs.html?type=${type}&id=${id}`;
}

// Close search on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isSearchOpen) {
    toggleSearch();
  }
});

function updateWaterGoal() {
  const newGoal = parseInt(document.getElementById("water-goal").value);

  if (newGoal > 0) {
    localStorage.setItem("waterGoal", newGoal);
    loadWaterData();
  }
}

// ==================== DASHBOARD ====================
// function updateCircularClock() {
//     const now = new Date();

//     const sec = now.getSeconds();
//     const min = now.getMinutes();
//     const hr = now.getHours();

//     // Update digital clock
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, "0");
//     const date = String(now.getDate()).padStart(2, "0");
//     const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

//     document.getElementById("c-date").textContent = `${year}.${month}.${date}`;
//     document.getElementById("c-time").textContent = now.toLocaleTimeString("en-GB");
//     document.getElementById("c-day").textContent = `${dayNames[now.getDay()]}.`;

//     // === Circular animation ===
//     const secRing = document.getElementById("second-ring");
//     const minRing = document.getElementById("minute-ring");
//     const hrRing = document.getElementById("hour-ring");

//     const secCirc = 2 * Math.PI * 30;
//     const minCirc = 2 * Math.PI * 38;
//     const hrCirc = 2 * Math.PI * 46;

//     secRing.style.strokeDasharray = secCirc;
//     minRing.style.strokeDasharray = minCirc;
//     hrRing.style.strokeDasharray = hrCirc;

//     secRing.style.strokeDashoffset = secCirc - (sec / 60) * secCirc;
//     minRing.style.strokeDashoffset = minCirc - (min / 60) * minCirc;
//     hrRing.style.strokeDashoffset = hrCirc - ((hr % 12) / 12) * hrCirc;
// }

// Run every second
// setInterval(updateCircularClock, 1000);
// updateCircularClock();
async function loadDashboard() {
  try {
    const stats = await api.dashboard.getStats();

    // Update water
    const waterGoal = parseInt(localStorage.getItem("waterGoal")) || 2000;
    document.getElementById("dashboard-water").textContent = `${
      stats.waterToday || 0
    }ml`;
    const waterPercent = Math.min(
      ((stats.waterToday || 0) / waterGoal) * 100,
      100
    );
    document.getElementById(
      "dashboard-water-progress"
    ).style.width = `${waterPercent}%`;
    document.getElementById(
      "dashboard-water-percent"
    ).textContent = `${Math.round(waterPercent)}% of ${waterGoal}ml goal`;

    // Update exercise
    document.getElementById("dashboard-exercise").textContent = `${
      stats.exerciseToday || 0
    } min`;

    // Update sleep
    const avgSleep = stats.avgSleep || 0;
    document.getElementById(
      "dashboard-sleep"
    ).textContent = `${avgSleep.toFixed(1)} hrs`;

    // Update calories
    const caloriesLimit = 2000;
    const caloriesToday = stats.caloriesToday || 0;
    document.getElementById(
      "dashboard-calories"
    ).textContent = `${caloriesToday} kcal`;
    const caloriesPercent = Math.min(
      (caloriesToday / caloriesLimit) * 100,
      100
    );
    document.getElementById(
      "dashboard-calories-progress"
    ).style.width = `${caloriesPercent}%`;
    document.getElementById(
      "dashboard-calories-percent"
    ).textContent = `${Math.round(caloriesPercent)}% of ${caloriesLimit} kcal`;

    // Update mood
    const moodEmojis = ["😐", "😢", "😟", "😐", "🙂", "😁"];
    const moodToday = stats.moodToday || 0;
    document.getElementById("dashboard-mood").textContent =
      moodEmojis[moodToday] || "😐";

    const avgMood = stats.avgMood || 0;
    if (avgMood > 0) {
      document.getElementById(
        "dashboard-mood-avg"
      ).textContent = `Weekly avg: ${avgMood.toFixed(1)} ${
        moodEmojis[Math.round(avgMood)] || "😐"
      }`;
    }

    // Load BMI (per user)
    loadUserBMI();

    await loadQuickStats();
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
}

async function loadQuickStats() {
  try {
    // Load health score preview
    const summary = await api.summary.getDaily().catch(() => null);
    if (summary) {
      const score = summary.healthScore || 0;
      document.getElementById("quick-health-score").textContent = score;
      document.getElementById(
        "quick-health-score-bar"
      ).style.width = `${score}%`;
    }

    // Load database stats preview
    const dbStats = await api.database.getStats().catch(() => null);
    if (dbStats) {
      document.getElementById("quick-total-records").textContent =
        dbStats.totalRecords || 0;

      // Estimate data size (rough calculation)
      const totalRecords = dbStats.totalRecords || 0;
      const estimatedSize = (totalRecords * 0.5).toFixed(1); // ~0.5KB per record
      document.getElementById("quick-data-size").textContent =
        estimatedSize + " KB";
    }
  } catch (error) {
    console.error("Error loading quick stats:", error);
  }
}

// ==================== WATER TRACKER ====================
async function loadWaterData() {
  // Load saved goal
  let savedGoal = parseInt(localStorage.getItem("waterGoal"));
  if (!savedGoal || savedGoal <= 0) savedGoal = 2000;

  // Set UI input value
  document.getElementById("water-goal").value = savedGoal;

  const waterGoal = savedGoal;

  try {
    const [logs, totalData] = await Promise.all([
      api.water.getToday(),
      api.water.getTotal(),
    ]);

    const waterGoal =
      parseInt(document.getElementById("water-goal").value) || 2000;
    const total = totalData.total || 0;

    // Update progress
    const percentage = Math.min((total / waterGoal) * 100, 100);
    document.getElementById(
      "water-progress-bar"
    ).style.width = `${percentage}%`;
    document.getElementById(
      "water-progress-text"
    ).textContent = `${total}ml / ${waterGoal}ml`;

    // Display logs
    const logsContainer = document.getElementById("water-logs");
    if (logs.length === 0) {
      logsContainer.innerHTML =
        '<p class="text-gray-500 text-center py-8">No water logged today. Start hydrating!</p>';
    } else {
      logsContainer.innerHTML = logs
        .map(
          (log) => `
                <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-tint text-blue-600"></i>
                        <div>
                            <p class="font-medium text-left text-gray-800">${log.amount}ml</p>
                            <p class="text-sm text-gray-600">${log.time}</p>
                        </div>
                    </div>
                    <button onclick="deleteWater(${log.id})" class="text-red-600 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading water data:", error);
  }
}

async function addWater() {
  const amount = parseInt(document.getElementById("water-amount").value);

  if (!amount || amount <= 0) {
    showAlert("Please enter a valid amount", "error");
    return;
  }

  try {
    await api.water.add(amount);
    showAlert("Water logged successfully!", "success");
    loadWaterData();

    if (getActiveTab() === "dashboard") {
      loadDashboard();
    }
    document.getElementById("water-amount").value = 250;
  } catch (error) {
    console.error("Error adding water:", error);
  }
}

// Function to refresh dashboard data without switching tabs
async function refreshDashboardData() {
  try {
    const stats = await api.dashboard.getStats();

    // Update water
    const waterGoal = 2000;
    document.getElementById("dashboard-water").textContent = `${
      stats.waterToday || 0
    }ml`;
    const waterPercent = Math.min(
      ((stats.waterToday || 0) / waterGoal) * 100,
      100
    );
    document.getElementById(
      "dashboard-water-progress"
    ).style.width = `${waterPercent}%`;
    document.getElementById(
      "dashboard-water-percent"
    ).textContent = `${Math.round(waterPercent)}% of ${waterGoal}ml goal`;

    // Update exercise
    document.getElementById("dashboard-exercise").textContent = `${
      stats.exerciseToday || 0
    } min`;

    // Update sleep
    const avgSleep = stats.avgSleep || 0;
    document.getElementById(
      "dashboard-sleep"
    ).textContent = `${avgSleep.toFixed(1)} hrs`;
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
  }
}

async function deleteWater(id) {
  const confirmed = await swalConfirm({
    title: "Delete Water Log?",
    text: "This water log will be permanently deleted.",
    confirmText: "Delete",
  });
  if (!confirmed) return;

  try {
    await api.water.delete(id);
    Swal.fire("Deleted!", "Water log deleted successfully.", "success");
    loadWaterData();
    if (getActiveTab() === "dashboard") loadDashboard();
  } catch (error) {
    console.error("Error deleting water:", error);
    Swal.fire("Error", "Failed to delete water log.", "error");
  }
}

// ==================== EXERCISE LOGGER ====================
async function loadExerciseData() {
  try {
    const [logs, totalData] = await Promise.all([
      api.exercise.getRecent(),
      api.exercise.getTotal(),
    ]);

    // Update total
    document.getElementById("exercise-total").textContent = `Today's Total: ${
      totalData.total || 0
    } minutes`;

    // Display logs
    const logsContainer = document.getElementById("exercise-logs");
    if (logs.length === 0) {
      logsContainer.innerHTML =
        '<p class="text-gray-500 text-center py-8">No exercises logged yet. Start moving!</p>';
    } else {
      logsContainer.innerHTML = logs
        .map(
          (log) => `
                <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-running text-green-600"></i>
                        <div>
                            <p class="font-medium text-left text-gray-800">${log.type} - ${log.duration} min</p>
                            <p class="text-sm text-gray-600">${log.calories} cal • ${log.date} ${log.time}</p>
                        </div>
                    </div>
                    <button onclick="deleteExercise(${log.id})" class="text-red-600 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading exercise data:", error);
  }
}

async function addExercise() {
  const type = document.getElementById("exercise-type").value;
  const duration = parseInt(document.getElementById("exercise-duration").value);
  const calories = parseInt(document.getElementById("exercise-calories").value);

  if (!duration || duration <= 0 || !calories || calories <= 0) {
    showAlert("Please enter valid values", "error");
    return;
  }

  try {
    await api.exercise.add(type, duration, calories);
    showAlert("Exercise logged successfully!", "success");
    loadExerciseData();
    if (getActiveTab() === "dashboard") {
      loadDashboard();
    }
    document.getElementById("exercise-duration").value = "";
    document.getElementById("exercise-calories").value = "";
  } catch (error) {
    console.error("Error adding exercise:", error);
  }
}

async function deleteExercise(id) {
  const confirmed = await swalConfirm({
    title: "Delete Exercise Log?",
    text: "This exercise log will be permanently deleted.",
    confirmText: "Delete",
  });
  if (!confirmed) return;

  try {
    await api.exercise.delete(id);
    Swal.fire("Deleted!", "Exercise log deleted successfully.", "success");
    loadExerciseData();
    if (getActiveTab() === "dashboard") loadDashboard();
  } catch (error) {
    console.error("Error deleting exercise:", error);
    Swal.fire("Error", "Failed to delete exercise log.", "error");
  }
}

// ==================== SLEEP TRACKER ====================
async function loadSleepData() {
  try {
    const [logs, avgData] = await Promise.all([
      api.sleep.getRecent(),
      api.sleep.getAverage(),
    ]);

    // Update average
    const avg = avgData.average || 0;
    document.getElementById(
      "sleep-average"
    ).textContent = `Average Sleep: ${avg.toFixed(1)} hours`;

    // Display logs
    const logsContainer = document.getElementById("sleep-logs");
    if (logs.length === 0) {
      logsContainer.innerHTML =
        '<p class="text-gray-500 py-8">No sleep logs yet. Track your rest!</p>';
    } else {
      logsContainer.innerHTML = logs
        .map((log) => {
          const stars = "⭐".repeat(log.quality);
          return `
                    <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                        <div class="flex items-center gap-3">
                            <i class="fas fa-moon text-purple-600"></i>
                            <div>
                                <p class="font-medium text-gray-800 text-left">${log.hours} hours</p>
                                <p class="text-sm text-gray-600">${stars} • ${log.date}</p>
                            </div>
                        </div>
                        <button onclick="deleteSleep(${log.id})" class="text-red-600 hover:text-red-700 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
        })
        .join("");
    }
  } catch (error) {
    console.error("Error loading sleep data:", error);
  }
}

async function addSleep() {
  const hours = parseFloat(document.getElementById("sleep-hours").value);
  const quality = parseInt(document.getElementById("sleep-quality").value);

  if (!hours || hours <= 0 || hours > 24) {
    showAlert("Please enter valid sleep hours (0-24)", "error");
    return;
  }

  try {
    await api.sleep.add(hours, quality);
    showAlert("Sleep logged successfully!", "success");
    loadSleepData();
    if (getActiveTab() === "dashboard") {
      loadDashboard();
    }
    document.getElementById("sleep-hours").value = "";
  } catch (error) {
    console.error("Error adding sleep:", error);
  }
}

async function deleteSleep(id) {
  const confirmed = await swalConfirm({
    title: "Delete Sleep Log?",
    text: "This sleep log will be permanently deleted.",
    confirmText: "Delete",
  });
  if (!confirmed) return;

  try {
    await api.sleep.delete(id);
    Swal.fire("Deleted!", "Sleep log deleted successfully.", "success");
    loadSleepData();
    if (getActiveTab() === "dashboard") loadDashboard();
  } catch (error) {
    console.error("Error deleting sleep:", error);
    Swal.fire("Error", "Failed to delete sleep log.", "error");
  }
}

// ==================== BMI CALCULATOR ====================
// ==================== BMI STORAGE (PER USER) ====================
function getBMIStorageKey() {
  const user = JSON.parse(sessionStorage.getItem("fitlife_user"));
  return user && user.isDemo ? "demo_bmi" : `bmi_user_${user.id}`;
}

let selectedSex = null;

function selectSex(sex) {
  selectedSex = sex;

  // style button active (opsional)
  document
    .getElementById("btn-male")
    .classList.toggle("border-orange-500", sex === "male");
  document
    .getElementById("btn-female")
    .classList.toggle("border-orange-500", sex === "female");

  // Visual feedback
  document.getElementById("btn-male").className =
    sex === "male"
      ? "flex-1 w-[120px] py-1.5 border-2 border-orange-500 bg-orange-100 rounded-full transition-all"
      : "flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all";

  document.getElementById("btn-female").className =
    sex === "female"
      ? "flex-1 w-[120px] py-1.5 border-2 border-orange-500 bg-orange-100 rounded-full transition-all"
      : "flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all";
}

function validateAge() {
  const ageInput = document.getElementById("bmi-age");
  const ageError = document.getElementById("age-error");
  const age = parseInt(ageInput.value);

  if (age < 1 || age > 120 || !age) {
    ageInput.classList.remove("border-gray-300");
    ageInput.classList.add("border-red-500", "bg-red-50");
    ageError.classList.remove("hidden");
    return false;
  } else {
    ageInput.classList.remove("border-red-500", "bg-red-50");
    ageInput.classList.add("border-gray-300");
    ageError.classList.add("hidden");
    return true;
  }
}

function validateHeight() {
  const heightInput = document.getElementById("bmi-height");
  const heightError = document.getElementById("height-error");
  const height = parseFloat(heightInput.value);

  if (height < 50 || height > 250 || !height) {
    heightInput.classList.remove("border-gray-300");
    heightInput.classList.add("border-red-500", "bg-red-50");
    heightError.classList.remove("hidden");
    return false;
  } else {
    heightInput.classList.remove("border-red-500", "bg-red-50");
    heightInput.classList.add("border-gray-300");
    heightError.classList.add("hidden");
    return true;
  }
}

function validateWeight() {
  const weightInput = document.getElementById("bmi-weight");
  const weightError = document.getElementById("weight-error");
  const weight = parseFloat(weightInput.value);

  if (weight < 20 || weight > 300 || !weight) {
    weightInput.classList.remove("border-gray-300");
    weightInput.classList.add("border-red-500", "bg-red-50");
    weightError.classList.remove("hidden");
    return false;
  } else {
    weightInput.classList.remove("border-red-500", "bg-red-50");
    weightInput.classList.add("border-gray-300");
    weightError.classList.add("hidden");
    return true;
  }
}

function calculateBMI() {
  const sex = selectedSex;
  const ageInput = document.getElementById("bmi-age");
  const heightInput = document.getElementById("bmi-height");
  const weightInput = document.getElementById("bmi-weight");

  const age = parseInt(ageInput.value);
  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);

  if (!sex || !age || !height || !weight) {
    showAlert("Please complete all BMI fields.", "error");
    return;
  }

  if (!validateAge() || !validateHeight() || !validateWeight()) {
    showAlert("Please fix invalid BMI inputs.", "error");
    return;
  }

  const heightMeter = height / 100;
  const bmi = (weight / (heightMeter * heightMeter)).toFixed(1);

  let category, categoryClass, advice;

  if (bmi < 18.5) {
    category = "Underweight";
    categoryClass = "text-blue-600";
    advice = "Consider consulting a nutritionist for healthy weight gain.";
  } else if (bmi < 25) {
    category = "Normal";
    categoryClass = "text-green-600";
    advice = "Great! Maintain your healthy lifestyle.";
  } else if (bmi < 30) {
    category = "Overweight";
    categoryClass = "text-yellow-600";
    advice = "Increase activity and monitor diet.";
  } else {
    category = "Obese";
    categoryClass = "text-red-600";
    advice = "Consult a healthcare professional.";
  }

  // UI Result
  document.getElementById("bmi-value").textContent = bmi;
  const catText = document.getElementById("bmi-category");
  catText.textContent = category;
  catText.className = `text-xl font-semibold ${categoryClass}`;

  document.getElementById("bmi-info").innerHTML = `
    <p><strong>Sex:</strong> ${sex === "male" ? "Male ♂" : "Female ♀"}</p>
    <p><strong>Age:</strong> ${age} years</p>
    <p><strong>Height:</strong> ${height} cm</p>
    <p><strong>Weight:</strong> ${weight} kg</p>
    <p class="italic mt-2">${advice}</p>
  `;

  document.getElementById("bmi-result").classList.remove("hidden");

  // DASHBOARD
  document.getElementById("dashboard-bmi").textContent = bmi;
  const dashCat = document.getElementById("dashboard-bmi-category");
  dashCat.textContent = category;
  dashCat.className = `text-sm font-medium ${categoryClass}`;

  // 🔥 SAVE PER USER
  const bmiKey = getBMIStorageKey();
  if (bmiKey) {
    localStorage.setItem(
      bmiKey,
      JSON.stringify({
        bmi,
        category,
        categoryClass,
        updatedAt: new Date().toISOString(),
      })
    );
  }

  showAlert("BMI calculated successfully!", "success");
}

function clearBMI() {
  document.getElementById("bmi-age").value = "";
  document.getElementById("bmi-height").value = "";
  document.getElementById("bmi-weight").value = "";

  selectedSex = null;
  document.getElementById("btn-male").className =
    "flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all";
  document.getElementById("btn-female").className =
    "flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all";

  const inputs = ["bmi-age", "bmi-height", "bmi-weight"];
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    input.classList.remove("border-red-500", "bg-red-50");
    input.classList.add("border-gray-300");
  });

  document.getElementById("age-error").classList.add("hidden");
  document.getElementById("height-error").classList.add("hidden");
  document.getElementById("weight-error").classList.add("hidden");

  document.getElementById("bmi-result").classList.add("hidden");
}

function loadUserBMI() {
  const bmiKey = getBMIStorageKey();
  if (!bmiKey) return;

  const raw = localStorage.getItem(bmiKey);
  if (!raw) return;

  const data = JSON.parse(raw);

  document.getElementById("dashboard-bmi").textContent = data.bmi;

  const cat = document.getElementById("dashboard-bmi-category");
  cat.textContent = data.category;
  cat.className = `text-sm font-medium ${data.categoryClass}`;
}

// ==================== CALORIES TRACKER ====================
async function loadCaloriesData() {
  try {
    const [logs, totalData] = await Promise.all([
      api.calories.getToday(),
      api.calories.getTotal(),
    ]);

    const caloriesLimit =
      parseInt(document.getElementById("calories-limit").value) || 2000;
    const total = totalData.total || 0;

    // Update progress
    const percentage = Math.min((total / caloriesLimit) * 100, 100);
    document.getElementById(
      "calories-progress-bar"
    ).style.width = `${percentage}%`;
    document.getElementById(
      "calories-progress-text"
    ).textContent = `${total} kcal / ${caloriesLimit} kcal`;

    // Update status message
    const remaining = caloriesLimit - total;
    if (remaining > 0) {
      document.getElementById(
        "calories-status"
      ).textContent = `You can still eat ${remaining} kcal today`;
      document.getElementById("calories-status").className =
        "text-sm text-green-600 mt-2";
    } else {
      document.getElementById(
        "calories-status"
      ).textContent = `You exceeded your limit by ${Math.abs(remaining)} kcal`;
      document.getElementById("calories-status").className =
        "text-sm text-red-600 mt-2";
    }

    // Display logs
    const logsContainer = document.getElementById("calories-logs");
    if (logs.length === 0) {
      logsContainer.innerHTML =
        '<p class="text-gray-500 text-center py-8">No food logged today. Start tracking!</p>';
    } else {
      logsContainer.innerHTML = logs
        .map(
          (log) => `
                <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-utensils text-yellow-600"></i>
                        <div>
                            <p class="font-medium text-gray-800">${log.foodName}</p>
                            <p class="text-sm text-gray-600">${log.calories} kcal • ${log.time}</p>
                        </div>
                    </div>
                    <button onclick="deleteCalories(${log.id})" class="text-red-600 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading calories data:", error);
  }
}

async function addCalories() {
  const foodName = document.getElementById("calories-food").value.trim();
  const calories = parseInt(document.getElementById("calories-amount").value);

  if (!foodName || !calories || calories <= 0) {
    showAlert("Please enter valid food name and calories", "error");
    return;
  }

  try {
    await api.calories.add(foodName, calories);
    showAlert("Food logged successfully!", "success");
    await loadCaloriesData();
    await refreshDashboardData();
    document.getElementById("calories-food").value = "";
    document.getElementById("calories-amount").value = "";
  } catch (error) {
    console.error("Error adding calories:", error);
  }
}

async function deleteCalories(id) {
  const confirmed = await swalConfirm({
    title: "Delete Food Log?",
    text: "This food log will be permanently deleted.",
    confirmText: "Delete",
  });
  if (!confirmed) return;

  try {
    await api.calories.delete(id);
    Swal.fire("Deleted!", "Food log deleted successfully.", "success");
    await loadCaloriesData();
    await refreshDashboardData();
  } catch (error) {
    console.error("Error deleting calories:", error);
    Swal.fire("Error", "Failed to delete food log.", "error");
  }
}

// ==================== MOOD TRACKER ====================
let selectedMoodValue = 3; // Default neutral

function selectMood(mood) {
  selectedMoodValue = mood;

  // Visual feedback - highlight selected mood
  document.querySelectorAll(".mood-btn").forEach((btn) => {
    btn.style.opacity = "0.4";
    btn.style.transform = "scale(1)";
  });

  const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
  selectedBtn.style.opacity = "1";
  selectedBtn.style.transform = "scale(1.2)";
}

async function saveMood() {
  const note = document.getElementById("mood-note").value.trim();

  try {
    await api.mood.save(selectedMoodValue, note);
    showAlert("Mood saved successfully!", "success");
    await loadMoodData();
    await refreshDashboardData();
  } catch (error) {
    console.error("Error saving mood:", error);
  }
}

async function loadMoodData() {
  try {
    // Use .catch() to handle 404 errors gracefully
    const [todayMood, avgData] = await Promise.all([
      api.mood.getToday().catch(() => null), // Already has this ✅
      api.mood.getAverage().catch(() => ({ average: 0 })), // Add fallback here
    ]);

    const moodEmojis = ["😐", "😢", "😟", "😐", "🙂", "😁"];
    const moodLabels = [
      "Neutral",
      "Very Sad",
      "Sad",
      "Neutral",
      "Happy",
      "Very Happy",
    ];

    // Display today's mood
    if (todayMood && todayMood.mood !== undefined) {
      // Better check
      const mood = todayMood.mood;
      document.getElementById("current-mood-display").textContent =
        moodEmojis[mood] || "😐";
      document.getElementById("current-mood-note").textContent =
        todayMood.note?.trim() || moodLabels[mood] || "No mood logged";

      // Highlight selected mood
      selectMood(mood);

      // Fill textarea if note exists
      if (todayMood.note) {
        document.getElementById("mood-note").value = todayMood.note;
      }
    } else {
      // No mood logged yet - show default
      document.getElementById("current-mood-display").textContent = "😐";
      document.getElementById("current-mood-note").textContent =
        "No mood logged yet";
      selectMood(3); // Default to neutral
    }

    // Display weekly average - handle null/undefined safely
    const avg = avgData?.average || 0;
    if (avg > 0) {
      document.getElementById("mood-weekly-avg").textContent = avg.toFixed(1);
      document.getElementById("mood-weekly-emoji").textContent =
        moodEmojis[Math.round(avg)] || "😐";
    } else {
      document.getElementById("mood-weekly-avg").textContent = "--";
      document.getElementById("mood-weekly-emoji").textContent = "😐";
    }
  } catch (error) {
    console.error("Error loading mood data:", error);
    // dont show error alert, just set defaults
    document.getElementById("current-mood-display").textContent = "😐";
    document.getElementById("current-mood-note").textContent =
      "No mood logged yet";
    document.getElementById("mood-weekly-avg").textContent = "--";
    document.getElementById("mood-weekly-emoji").textContent = "😐";
  }
}

// ==================== SUMMARY OF TODAY ====================
async function loadSummary() {
  try {
    const summary = await api.summary.getDaily();

    // Update Health Score
    const score = summary.healthScore || 0;
    document.getElementById("health-score-value").textContent = score;

    // Update score circle color based on score
    const scoreCircle = document.getElementById("health-score-circle");
    if (score >= 80) {
      scoreCircle.style.borderColor = "#10b981"; // Green
      document.getElementById("health-score-label").textContent =
        "Excellent! 🎉";
    } else if (score >= 60) {
      scoreCircle.style.borderColor = "#3b82f6"; // Blue
      document.getElementById("health-score-label").textContent =
        "Good Job! 👍";
    } else if (score >= 40) {
      scoreCircle.style.borderColor = "#f59e0b"; // Orange
      document.getElementById("health-score-label").textContent =
        "Keep Going! 💪";
    } else {
      scoreCircle.style.borderColor = "#ef4444"; // Red
      document.getElementById("health-score-label").textContent =
        "Needs Improvement 📈";
    }

    // Water Summary
    const water = summary.water;
    document.getElementById(
      "summary-water-text"
    ).textContent = `${water.total}ml / ${water.goal}ml`;
    document.getElementById(
      "summary-water-progress"
    ).style.width = `${water.percentage}%`;
    document.getElementById("summary-water-status").textContent =
      water.status === "achieved" ? "✓ Achieved" : "In Progress";
    document.getElementById("summary-water-status").className =
      water.status === "achieved"
        ? "px-2 py-1 text-xs rounded-full bg-green-200 text-green-800"
        : "px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800";

    // Exercise Summary
    const exercise = summary.exercise;
    document.getElementById(
      "summary-exercise-text"
    ).textContent = `${exercise.total} min / ${exercise.goal} min`;
    document.getElementById(
      "summary-exercise-progress"
    ).style.width = `${exercise.percentage}%`;
    document.getElementById("summary-exercise-status").textContent =
      exercise.status === "achieved" ? "✓ Achieved" : "In Progress";
    document.getElementById("summary-exercise-status").className =
      exercise.status === "achieved"
        ? "px-2 py-1 text-xs rounded-full bg-green-200 text-green-800"
        : "px-2 py-1 text-xs rounded-full bg-green-200 text-green-800";

    // Sleep Summary
    const sleep = summary.sleep;
    document.getElementById(
      "summary-sleep-text"
    ).textContent = `${sleep.average.toFixed(1)} hrs (avg)`;
    document.getElementById("summary-sleep-status").textContent =
      sleep.status === "optimal" ? "✓ Optimal" : "Needs Improvement";
    document.getElementById("summary-sleep-status").className =
      sleep.status === "optimal"
        ? "px-2 py-1 text-xs rounded-full bg-green-200 text-green-800"
        : "px-2 py-1 text-xs rounded-full bg-orange-200 text-orange-800";

    // Calories Summary
    const calories = summary.calories;
    document.getElementById(
      "summary-calories-text"
    ).textContent = `${calories.total} kcal / ${calories.goal} kcal`;
    document.getElementById(
      "summary-calories-progress"
    ).style.width = `${calories.percentage}%`;
    document.getElementById("summary-calories-status").textContent =
      calories.status === "good" ? "✓ Good" : "⚠ Exceeded";
    document.getElementById("summary-calories-status").className =
      calories.status === "good"
        ? "px-2 py-1 text-xs rounded-full bg-green-200 text-green-800"
        : "px-2 py-1 text-xs rounded-full bg-red-200 text-red-800";

    // Recommendations
    const recommendations = summary.recommendations || [];
    const recList = document.getElementById("recommendations-list");
    if (recommendations.length === 0) {
      recList.innerHTML =
        '<li class="text-gray-700 flex items-start gap-2"><span>🎉</span><span>Great job! All goals achieved today!</span></li>';
    } else {
      recList.innerHTML = recommendations
        .map(
          (rec) =>
            `<li class="text-gray-700 flex items-start gap-2">
                    <span class="mt-1">•</span>
                    <span>${rec}</span>
                </li>`
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading summary:", error);
    showAlert(
      "Error loading summary data. Make sure backend is running.",
      "error"
    );
  }
}

// ==================== DATABASE MANAGEMENT ====================
async function loadDatabase() {
  await loadDatabaseStats();
}

async function loadDatabaseStats() {
  try {
    const stats = await api.database.getStats();

    // Update counts
    document.getElementById("db-water-count").textContent =
      stats.waterLogs || 0;
    document.getElementById("db-exercise-count").textContent =
      stats.exerciseLogs || 0;
    document.getElementById("db-sleep-count").textContent =
      stats.sleepLogs || 0;
    document.getElementById("db-calories-count").textContent =
      stats.caloriesLogs || 0;
    document.getElementById("db-mood-count").textContent = stats.moodLogs || 0;
    document.getElementById("db-total-count").textContent =
      stats.totalRecords || 0;

    // Update date range
    const dateRange = `${stats.oldestRecord} to ${stats.newestRecord}`;
    document.getElementById("db-date-range").textContent = dateRange;
  } catch (error) {
    console.error("Error loading database stats:", error);
    showAlert("Error loading database statistics", "error");
  }
}

function setShowContent(show) {
  const el = document.getElementById("print-report");
  el.classList.toggle("hidden", !show);
}

async function printReport(event) {
  let button;
  let originalContent;

  try {
    const userId = api.getUserId(); // 🔥 ambil userId

    button = event.target.closest("button");
    originalContent = button.innerHTML;

    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    button.disabled = true;

    const response = await fetch(
      `http://localhost:8080/api/database/export/pdf?userId=${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitlife-report-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    Swal.fire({
      icon: "success",
      title: "Report Generated 🎉",
      text: "Your PDF report has been downloaded successfully!",
      confirmButtonColor: "#0ea5e9",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);

    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: "Failed to generate PDF report.",
      confirmButtonColor: "#ef4444",
    });
  } finally {
    if (button) {
      button.innerHTML = originalContent;
      button.disabled = false;
    }
  }
}

async function exportJSON() {
  try {
    const data = await api.database.exportJSON();

    // create downloadable JSON file
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `fitlife_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showAlert("JSON export completed! Check your downloads folder.", "success");
  } catch (error) {
    console.error("Error exporting JSON:", error);
    showAlert("Error exporting JSON data", "error");
  }
}

async function cleanupOldData() {
  const days = parseInt(document.getElementById("cleanup-days").value);

  if (!days || days < 1) {
    Swal.fire("Invalid Input", "Please enter at least 1 day.", "error");
    return;
  }

  const confirmed = await swalConfirm({
    title: "Cleanup Old Data?",
    text: `Delete all data older than ${days} days? This action cannot be undone.`,
    confirmText: "Delete",
  });
  if (!confirmed) return;

  try {
    const result = await api.database.cleanup(days);

    Swal.fire({
      title: "Cleanup Completed!",
      icon: "success",
      html: `
                <p><b>Total Deleted:</b> ${result.totalDeleted}</p>
                <ul style="text-align:left">
                    <li>Water: ${result.waterDeleted}</li>
                    <li>Exercise: ${result.exerciseDeleted}</li>
                    <li>Sleep: ${result.sleepDeleted}</li>
                    <li>Calories: ${result.caloriesDeleted}</li>
                    <li>Mood: ${result.moodDeleted}</li>
                </ul>
            `,
    });

    await loadDatabaseStats();
    await loadDashboard();
  } catch (error) {
    console.error("Error cleaning up data:", error);
    Swal.fire("Error", "Failed to cleanup old data.", "error");
  }
}

function renderTable(title, headers, data, rowRenderer) {
  if (!data || data.length === 0) {
    return `<h2>${title}</h2><p>No data available.</p>`;
  }

  return `
        <h2>${title}</h2>
        <table>
            <thead>
                <tr>
                    ${headers.map((h) => `<th>${h}</th>`).join("")}
                </tr>
            </thead>
            <tbody>
                ${data.map(rowRenderer).join("")}
            </tbody>
        </table>
    `;
}

async function clearAllData() {
  const step1 = await Swal.fire({
    title: "FINAL WARNING",
    icon: "error",
    html: `
        <div style="">
            <p>This will <b>DELETE ALL DATA permanently</b>:</p>
            <ol style="text-align:left; font-size:15px; display:inline-block;   ">
                <li>1. Water</li>
                <li>2. Exercise</li>
                <li>3. Sleep</li>
                <li>4. Calories</li>
                <li>5. Mood</li>
            </ol>
            <p>This action <b>CANNOT</b> be undone.</p>
        </div>
        `,
    showCancelButton: true,
    confirmButtonText: "I Understand",
    cancelButtonText: "Cancel",
  });

  if (!step1.isConfirmed) {
    Swal.fire("Cancelled", "Your data is safe 💖", "info");
    return;
  }

  const step2 = await Swal.fire({
    title: "Type Confirmation",
    input: "text",
    inputPlaceholder: "DELETE_ALL_DATA",
    text: "Type DELETE_ALL_DATA to confirm",
    showCancelButton: true,
  });

  if (step2.value !== "DELETE_ALL_DATA") {
    Swal.fire("Incorrect", "Confirmation text does not match.", "error");
    return;
  }

  try {
    await api.database.clearAll("DELETE_ALL_DATA");

    Swal.fire("Deleted!", "All data has been permanently deleted.", "success");

    await loadDatabaseStats();
    await loadDashboard();
    localStorage.removeItem("waterGoal");
  } catch (error) {
    console.error("Error clearing all data:", error);
    Swal.fire("Error", "Failed to clear all data.", "error");
  }
}

async function swalConfirm({
  title,
  text,
  confirmText = "Yes",
  icon = "warning",
}) {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
    customClass: {
      popup: "swal-small",
    },
  });
  return result.isConfirmed;
}

// DEMO STORAGE
const demoStorage = {
  get(key) {
    return JSON.parse(sessionStorage.getItem(`demo_${key}`)) || [];
  },

  set(key, data) {
    sessionStorage.setItem(`demo_${key}`, JSON.stringify(data));
  },

  add(key, item) {
    const data = this.get(key);
    data.push(item);
    this.set(key, data);
  },

  clearAll() {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith("demo_"))
      .forEach((k) => sessionStorage.removeItem(k));
  },
};

// ==================== INITIALIZATION ====================
// Load dashboard on page load
window.addEventListener("DOMContentLoaded", () => {
  showTab("dashboard");

  // Test backend connection
  api.dashboard
    .getStats()
    .then(() => {
      console.log("✅ Backend connection successful");
    })
    .catch(() => {
      showAlert(
        "⚠️ Cannot connect to backend. Please make sure the Spring Boot server is running on port 8080.",
        "error"
      );
    });
});
