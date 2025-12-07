// Tab Management

function showTab(tabName) {

    // Hide ALL tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('active');
    });

    // Remove active dari semua tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show ONLY the selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    selectedTab.classList.remove('hidden');
    selectedTab.classList.add('active');

    // Activate tab button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Load data sesuai tab
    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'water') loadWaterData();
    else if (tabName === 'exercise') loadExerciseData();
    else if (tabName === 'sleep') loadSleepData();
    else if (tabName === 'calories') loadCaloriesData();
    else if (tabName === 'mood') loadMoodData();
    else if (tabName === 'summary') loadSummary();
    else if (tabName === 'database') loadDatabase();
}


function getActiveTab() {
    const activeBtn = document.querySelector('.tab-btn.active');
    return activeBtn ? activeBtn.dataset.tab : 'dashboard';
}



function updateWaterGoal() {
    const newGoal = parseInt(document.getElementById('water-goal').value);

    if (newGoal > 0) {
        localStorage.setItem('waterGoal', newGoal);
        loadWaterData();
    }
}

// function updateClock() {
//     const now = new Date();

//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const date = String(now.getDate()).padStart(2, '0');

//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');

//     const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
//     const day = dayNames[now.getDay()];

//     document.getElementById("clock-date").textContent = `${year}.${month}.${date}`;
//     document.getElementById("clock-time").textContent = `${hours}:${minutes}:${seconds}`;
//     document.getElementById("clock-day").textContent = day;
// }

// // Update setiap 1 detik
// setInterval(updateClock, 1000);
// updateClock();



// ==================== DASHBOARD ====================
function updateCircularClock() {
    const now = new Date();

    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    // Update digital clock
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    document.getElementById("c-date").textContent = `${year}.${month}.${date}`;
    document.getElementById("c-time").textContent = now.toLocaleTimeString("en-GB");
    document.getElementById("c-day").textContent = `${dayNames[now.getDay()]}.`;

    // === Circular animation ===
    const secRing = document.getElementById("second-ring");
    const minRing = document.getElementById("minute-ring");
    const hrRing = document.getElementById("hour-ring");

    const secCirc = 2 * Math.PI * 30;
    const minCirc = 2 * Math.PI * 38;
    const hrCirc = 2 * Math.PI * 46;

    secRing.style.strokeDasharray = secCirc;
    minRing.style.strokeDasharray = minCirc;
    hrRing.style.strokeDasharray = hrCirc;

    secRing.style.strokeDashoffset = secCirc - (sec / 60) * secCirc;
    minRing.style.strokeDashoffset = minCirc - (min / 60) * minCirc;
    hrRing.style.strokeDashoffset = hrCirc - ((hr % 12) / 12) * hrCirc;
}

// Run every second
setInterval(updateCircularClock, 1000);
updateCircularClock();



async function loadDashboard() {
    try {
        const stats = await api.dashboard.getStats();

        // Update water
        const waterGoal = parseInt(localStorage.getItem('waterGoal')) || 2000;
        document.getElementById('dashboard-water').textContent = `${stats.waterToday || 0}ml`;
        const waterPercent = Math.min((stats.waterToday || 0) / waterGoal * 100, 100);
        document.getElementById('dashboard-water-progress').style.width = `${waterPercent}%`;
        document.getElementById('dashboard-water-percent').textContent =
            `${Math.round(waterPercent)}% of ${waterGoal}ml goal`;

        // Update exercise
        document.getElementById('dashboard-exercise').textContent = `${stats.exerciseToday || 0} min`;

        // Update sleep
        const avgSleep = stats.avgSleep || 0;
        document.getElementById('dashboard-sleep').textContent = `${avgSleep.toFixed(1)} hrs`;

        // Update calories
        const caloriesLimit = 2000;
        const caloriesToday = stats.caloriesToday || 0;
        document.getElementById('dashboard-calories').textContent = `${caloriesToday} kcal`;
        const caloriesPercent = Math.min((caloriesToday / caloriesLimit) * 100, 100);
        document.getElementById('dashboard-calories-progress').style.width = `${caloriesPercent}%`;
        document.getElementById('dashboard-calories-percent').textContent =
            `${Math.round(caloriesPercent)}% of ${caloriesLimit} kcal`;

        // Update mood
        const moodEmojis = ['😐', '😢', '😟', '😐', '🙂', '😁'];
        const moodToday = stats.moodToday || 0;
        document.getElementById('dashboard-mood').textContent = moodEmojis[moodToday] || '😐';

        const avgMood = stats.avgMood || 0;
        if (avgMood > 0) {
            document.getElementById('dashboard-mood-avg').textContent =
                `Weekly avg: ${avgMood.toFixed(1)} ${moodEmojis[Math.round(avgMood)] || '😐'}`;
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ==================== WATER TRACKER ====================
async function loadWaterData() {
    // Load saved goal
    let savedGoal = parseInt(localStorage.getItem('waterGoal'));
    if (!savedGoal || savedGoal <= 0) savedGoal = 2000;

    // Set UI input value
    document.getElementById('water-goal').value = savedGoal;

    const waterGoal = savedGoal;

    try {
        const [logs, totalData] = await Promise.all([
            api.water.getToday(),
            api.water.getTotal()
        ]);

        const waterGoal = parseInt(document.getElementById('water-goal').value) || 2000;
        const total = totalData.total || 0;

        // Update progress
        const percentage = Math.min((total / waterGoal) * 100, 100);
        document.getElementById('water-progress-bar').style.width = `${percentage}%`;
        document.getElementById('water-progress-text').textContent = `${total}ml / ${waterGoal}ml`;

        // Display logs
        const logsContainer = document.getElementById('water-logs');
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No water logged today. Start hydrating!</p>';
        } else {
            logsContainer.innerHTML = logs.map(log => `
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
            `).join('');
        }
    } catch (error) {
        console.error('Error loading water data:', error);
    }
}

async function addWater() {
    const amount = parseInt(document.getElementById('water-amount').value);

    if (!amount || amount <= 0) {
        showAlert('Please enter a valid amount', 'error');
        return;
    }

    try {
        await api.water.add(amount);
        showAlert('Water logged successfully!', 'success');
        loadWaterData();

        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
        document.getElementById('water-amount').value = 250;
    } catch (error) {
        console.error('Error adding water:', error);
    }
}

// Function to refresh dashboard data without switching tabs
async function refreshDashboardData() {
    try {
        const stats = await api.dashboard.getStats();

        // Update water
        const waterGoal = 2000;
        document.getElementById('dashboard-water').textContent = `${stats.waterToday || 0}ml`;
        const waterPercent = Math.min((stats.waterToday || 0) / waterGoal * 100, 100);
        document.getElementById('dashboard-water-progress').style.width = `${waterPercent}%`;
        document.getElementById('dashboard-water-percent').textContent =
            `${Math.round(waterPercent)}% of ${waterGoal}ml goal`;

        // Update exercise
        document.getElementById('dashboard-exercise').textContent = `${stats.exerciseToday || 0} min`;

        // Update sleep
        const avgSleep = stats.avgSleep || 0;
        document.getElementById('dashboard-sleep').textContent = `${avgSleep.toFixed(1)} hrs`;

    } catch (error) {
        console.error('Error refreshing dashboard:', error);
    }
}

async function deleteWater(id) {
    if (!confirm('Delete this water log?')) return;

    try {
        await api.water.delete(id);
        showAlert('Water log deleted!', 'success');
        loadWaterData();
        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        console.error('Error deleting water:', error);
    }
}

// ==================== EXERCISE LOGGER ====================
async function loadExerciseData() {
    try {
        const [logs, totalData] = await Promise.all([
            api.exercise.getRecent(),
            api.exercise.getTotal()
        ]);

        // Update total
        document.getElementById('exercise-total').textContent =
            `Today's Total: ${totalData.total || 0} minutes`;

        // Display logs
        const logsContainer = document.getElementById('exercise-logs');
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No exercises logged yet. Start moving!</p>';
        } else {
            logsContainer.innerHTML = logs.map(log => `
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
            `).join('');
        }
    } catch (error) {
        console.error('Error loading exercise data:', error);
    }
}

async function addExercise() {
    const type = document.getElementById('exercise-type').value;
    const duration = parseInt(document.getElementById('exercise-duration').value);
    const calories = parseInt(document.getElementById('exercise-calories').value);

    if (!duration || duration <= 0 || !calories || calories <= 0) {
        showAlert('Please enter valid values', 'error');
        return;
    }

    try {
        await api.exercise.add(type, duration, calories);
        showAlert('Exercise logged successfully!', 'success');
        loadExerciseData();
        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
        document.getElementById('exercise-duration').value = '';
        document.getElementById('exercise-calories').value = '';
    } catch (error) {
        console.error('Error adding exercise:', error);
    }
}

async function deleteExercise(id) {
    if (!confirm('Delete this exercise log?')) return;

    try {
        await api.exercise.delete(id);
        showAlert('Exercise log deleted!', 'success');
        loadExerciseData();
        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        console.error('Error deleting exercise:', error);
    }
}

// ==================== SLEEP TRACKER ====================
async function loadSleepData() {
    try {
        const [logs, avgData] = await Promise.all([
            api.sleep.getRecent(),
            api.sleep.getAverage()
        ]);

        // Update average
        const avg = avgData.average || 0;
        document.getElementById('sleep-average').textContent =
            `Average Sleep: ${avg.toFixed(1)} hours`;

        // Display logs
        const logsContainer = document.getElementById('sleep-logs');
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="text-gray-500 py-8">No sleep logs yet. Track your rest!</p>';
        } else {
            logsContainer.innerHTML = logs.map(log => {
                const stars = '⭐'.repeat(log.quality);
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
            }).join('');
        }
    } catch (error) {
        console.error('Error loading sleep data:', error);
    }
}

async function addSleep() {
    const hours = parseFloat(document.getElementById('sleep-hours').value);
    const quality = parseInt(document.getElementById('sleep-quality').value);

    if (!hours || hours <= 0 || hours > 24) {
        showAlert('Please enter valid sleep hours (0-24)', 'error');
        return;
    }

    try {
        await api.sleep.add(hours, quality);
        showAlert('Sleep logged successfully!', 'success');
        loadSleepData();
        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
        document.getElementById('sleep-hours').value = '';
    } catch (error) {
        console.error('Error adding sleep:', error);
    }
}

async function deleteSleep(id) {
    if (!confirm('Delete this sleep log?')) return;

    try {
        await api.sleep.delete(id);
        showAlert('Sleep log deleted!', 'success');
        loadSleepData();
        if (getActiveTab() === 'dashboard') {
            loadDashboard();
        }
    } catch (error) {
        console.error('Error deleting sleep:', error);
    }
}

// ==================== BMI CALCULATOR ====================
function calculateBMI() {
    const height = parseFloat(document.getElementById('bmi-height').value);
    const weight = parseFloat(document.getElementById('bmi-weight').value);

    if (!height || !weight || height <= 0 || weight <= 0) {
        showAlert('Please enter valid height and weight', 'error');
        return;
    }

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Determine category
    let category, categoryClass;
    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'text-blue-600';
    } else if (bmi < 25) {
        category = 'Normal';
        categoryClass = 'text-green-600';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'text-yellow-600';
    } else {
        category = 'Obese';
        categoryClass = 'text-red-600';
    }

    // Display result
    document.getElementById('bmi-value').textContent = bmi;
    document.getElementById('bmi-category').textContent = category;
    document.getElementById('bmi-category').className = `text-xl font-semibold ${categoryClass}`;
    document.getElementById('bmi-result').classList.remove('hidden');

    // Update dashboard
    document.getElementById('dashboard-bmi').textContent = bmi;
}

function clearBMI() {
    document.getElementById('bmi-height').value = '';
    document.getElementById('bmi-weight').value = '';
    document.getElementById('bmi-result').classList.add('hidden');
}

// ==================== CALORIES TRACKER ====================
async function loadCaloriesData() {
    try {
        const [logs, totalData] = await Promise.all([
            api.calories.getToday(),
            api.calories.getTotal()
        ]);

        const caloriesLimit = parseInt(document.getElementById('calories-limit').value) || 2000;
        const total = totalData.total || 0;

        // Update progress
        const percentage = Math.min((total / caloriesLimit) * 100, 100);
        document.getElementById('calories-progress-bar').style.width = `${percentage}%`;
        document.getElementById('calories-progress-text').textContent = `${total} kcal / ${caloriesLimit} kcal`;

        // Update status message
        const remaining = caloriesLimit - total;
        if (remaining > 0) {
            document.getElementById('calories-status').textContent = `You can still eat ${remaining} kcal today`;
            document.getElementById('calories-status').className = 'text-sm text-green-600 mt-2';
        } else {
            document.getElementById('calories-status').textContent = `You exceeded your limit by ${Math.abs(remaining)} kcal`;
            document.getElementById('calories-status').className = 'text-sm text-red-600 mt-2';
        }

        // Display logs
        const logsContainer = document.getElementById('calories-logs');
        if (logs.length === 0) {
            logsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No food logged today. Start tracking!</p>';
        } else {
            logsContainer.innerHTML = logs.map(log => `
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
            `).join('');
        }
    } catch (error) {
        console.error('Error loading calories data:', error);
    }
}

async function addCalories() {
    const foodName = document.getElementById('calories-food').value.trim();
    const calories = parseInt(document.getElementById('calories-amount').value);

    if (!foodName || !calories || calories <= 0) {
        showAlert('Please enter valid food name and calories', 'error');
        return;
    }

    try {
        await api.calories.add(foodName, calories);
        showAlert('Food logged successfully!', 'success');
        await loadCaloriesData();
        await refreshDashboardData();
        document.getElementById('calories-food').value = '';
        document.getElementById('calories-amount').value = '';
    } catch (error) {
        console.error('Error adding calories:', error);
    }
}

async function deleteCalories(id) {
    if (!confirm('Delete this food log?')) return;

    try {
        await api.calories.delete(id);
        showAlert('Food log deleted!', 'success');
        await loadCaloriesData();
        await refreshDashboardData();
    } catch (error) {
        console.error('Error deleting calories:', error);
    }
}

// ==================== MOOD TRACKER ====================
let selectedMoodValue = 3; // Default neutral

function selectMood(mood) {
    selectedMoodValue = mood;

    // Visual feedback - highlight selected mood
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.style.opacity = '0.4';
        btn.style.transform = 'scale(1)';
    });

    const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
    selectedBtn.style.opacity = '1';
    selectedBtn.style.transform = 'scale(1.2)';
}

async function saveMood() {
    const note = document.getElementById('mood-note').value.trim();

    try {
        await api.mood.save(selectedMoodValue, note);
        showAlert('Mood saved successfully!', 'success');
        await loadMoodData();
        await refreshDashboardData();
    } catch (error) {
        console.error('Error saving mood:', error);
    }
}

async function loadMoodData() {
    try {
        const [todayMood, avgData] = await Promise.all([
            api.mood.getToday().catch(() => null),
            api.mood.getAverage()
        ]);

        const moodEmojis = ['😐', '😢', '😟', '😐', '🙂', '😁'];
        const moodLabels = ['Neutral', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

        // Display today's mood
        if (todayMood && typeof todayMood.mood === "number") {
            const mood = todayMood.mood;

            document.getElementById('current-mood-display').textContent = moodEmojis[mood] || '😐';
            document.getElementById('current-mood-note').textContent =
                todayMood.note?.trim() || moodLabels[mood] || 'No mood logged';

            // Highlight selected mood
            selectMood(mood);

            // Fill textarea if note exists
            if (todayMood.note) {
                document.getElementById('mood-note').value = todayMood.note;
            }
        } else {
            document.getElementById('current-mood-display').textContent = '😐';
            document.getElementById('current-mood-note').textContent = 'No mood logged yet';
        }


        // Display weekly average
        const avg = avgData.average || 0;
        if (avg > 0) {
            document.getElementById('mood-weekly-avg').textContent = avg.toFixed(1);
            document.getElementById('mood-weekly-emoji').textContent = moodEmojis[Math.round(avg)];
        } else {
            document.getElementById('mood-weekly-avg').textContent = '--';
            document.getElementById('mood-weekly-emoji').textContent = '😐';
        }

    } catch (error) {
        console.error('Error loading mood data:', error);
    }
}

// SUMMARY OF TODAY
async function loadSummary() {


}

//DATABASE
async function loadDatabase() {


}

// ==================== INITIALIZATION ====================
// Load dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
    showTab('dashboard');

    // Test backend connection
    api.dashboard.getStats()
        .then(() => {
            console.log('✅ Backend connection successful');
        })
        .catch(() => {
            showAlert('⚠️ Cannot connect to backend. Please make sure the Spring Boot server is running on port 8080.', 'error');
        });
});