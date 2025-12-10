// Tab Management

function showTab(tabName) {

    const lastBMI = localStorage.getItem("lastBMI");
    if (lastBMI) {
        document.getElementById('dashboard-bmi').textContent = lastBMI;
    }

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

        // Load BMI
        const savedBMI = localStorage.getItem("lastBMI");
        const savedCategory = localStorage.getItem("lastBMICategory");
        const savedClass = localStorage.getItem("lastBMICategoryClass");

        if (savedBMI) {
            document.getElementById("dashboard-bmi").textContent = savedBMI;
        }

        if (savedCategory) {
            const dashCat = document.getElementById("dashboard-bmi-category");
            dashCat.textContent = savedCategory;
            dashCat.className = `text-sm font-medium ${savedClass}`;
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
let selectedSex = null;

function selectSex(sex) {
    selectedSex = sex;

    // style button active (opsional)
    document.getElementById("btn-male").classList.toggle("border-orange-500", sex === "male");
    document.getElementById("btn-female").classList.toggle("border-orange-500", sex === "female");

    // Visual feedback
    document.getElementById('btn-male').className =
        sex === 'male'
            ? 'flex-1 w-[120px] py-1.5 border-2 border-orange-500 bg-orange-100 rounded-full transition-all'
            : 'flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all';

    document.getElementById('btn-female').className =
        sex === 'female'
            ? 'flex-1 w-[120px] py-1.5 border-2 border-orange-500 bg-orange-100 rounded-full transition-all'
            : 'flex-1 w-[120px] py-1.5 border-2 border-gray-300 rounded-full hover:border-orange-500 transition-all';
}

function validateAge() {
    const ageInput = document.getElementById('bmi-age');
    const ageError = document.getElementById('age-error');
    const age = parseInt(ageInput.value);

    if (age < 1 || age > 120 || !age) {
        ageInput.classList.remove('border-gray-300');
        ageInput.classList.add('border-red-500', 'bg-red-50');
        ageError.classList.remove('hidden');
        return false;
    } else {
        ageInput.classList.remove('border-red-500', 'bg-red-50');
        ageInput.classList.add('border-gray-300');
        ageError.classList.add('hidden');
        return true;
    }
}

function validateHeight() {
    const heightInput = document.getElementById('bmi-height');
    const heightError = document.getElementById('height-error');
    const height = parseFloat(heightInput.value);

    if (height < 50 || height > 250 || !height) {
        heightInput.classList.remove('border-gray-300');
        heightInput.classList.add('border-red-500', 'bg-red-50');
        heightError.classList.remove('hidden');
        return false;
    } else {
        heightInput.classList.remove('border-red-500', 'bg-red-50');
        heightInput.classList.add('border-gray-300');
        heightError.classList.add('hidden');
        return true;
    }
}

function validateWeight() {
    const weightInput = document.getElementById('bmi-weight');
    const weightError = document.getElementById('weight-error');
    const weight = parseFloat(weightInput.value);

    if (weight < 20 || weight > 300 || !weight) {
        weightInput.classList.remove('border-gray-300');
        weightInput.classList.add('border-red-500', 'bg-red-50');
        weightError.classList.remove('hidden');
        return false;
    } else {
        weightInput.classList.remove('border-red-500', 'bg-red-50');
        weightInput.classList.add('border-gray-300');
        weightError.classList.add('hidden');
        return true;
    }
}


function calculateBMI() {
    // Ambil value dari semua input
    const sex = selectedSex;
    const ageInput = document.getElementById('bmi-age');
    const heightInput = document.getElementById('bmi-height');
    const weightInput = document.getElementById('bmi-weight');

    const age = parseInt(ageInput.value);
    const height = parseFloat(heightInput.value);
    const weight = parseFloat(weightInput.value);

    // --- CEK INPUT KOSONG ---
    if (!sex || !ageInput.value || !heightInput.value || !weightInput.value) {
        let missingFields = [];

        if (!sex) missingFields.push("sex");
        if (!ageInput.value) missingFields.push("age");
        if (!heightInput.value) missingFields.push("height");
        if (!weightInput.value) missingFields.push("weight");

        showAlert(
            `Please fill in: ${missingFields.join(", ")}`,
            'error'
        );
        return;
    }

    // --- VALIDATE FIELDS ---
    const isAgeValid = validateAge();
    const isHeightValid = validateHeight();
    const isWeightValid = validateWeight();

    if (!isAgeValid || !isHeightValid || !isWeightValid) {
        showAlert(
            'Please correct the highlighted errors before calculating BMI.',
            'error'
        );
        return;
    }

    // --- PERHITUNGAN BMI ---
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    let category, categoryClass, advice;

    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'text-blue-600';
        advice = 'Consider consulting a nutritionist for a healthy weight gain plan.';
    } else if (bmi < 25) {
        category = 'Normal';
        categoryClass = 'text-green-600';
        advice = 'Great! Maintain your healthy lifestyle and regular exercise.';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'text-yellow-600';
        advice = 'Consider increasing physical activity and monitoring your diet.';
    } else {
        category = 'Obese';
        categoryClass = 'text-red-600';
        advice = 'We recommend consulting a healthcare professional for guidance.';
    }

    // --- TAMPILKAN HASIL ---
    document.getElementById('bmi-value').textContent = bmi;

    const categoryText = document.getElementById('bmi-category');
    categoryText.textContent = category;
    categoryText.className = `text-xl font-semibold ${categoryClass}`;

    document.getElementById('bmi-info').innerHTML = `
        <p class="text-gray-700"><strong>Sex:</strong> ${selectedSex === 'male' ? 'Male ♂' : 'Female ♀'}</p>
        <p class="text-gray-700"><strong>Age:</strong> ${age} years</p>
        <p class="text-gray-700"><strong>Height:</strong> ${height} cm</p>
        <p class="text-gray-700"><strong>Weight:</strong> ${weight} kg</p>
        <p class="text-gray-600 mt-3 italic">${advice}</p>
    `;

    document.getElementById('bmi-result').classList.remove('hidden');

    // --- DASHBOARD UPDATE ---
    document.getElementById('dashboard-bmi').textContent = bmi;

    const dashboardCategory = document.getElementById('dashboard-bmi-category');
    dashboardCategory.textContent = category;
    dashboardCategory.className = `text-sm font-medium ${categoryClass}`;

    // --- LOCAL STORAGE (BMI + CATEGORY + CLASS) ---
    localStorage.setItem("lastBMI", bmi);
    localStorage.setItem("lastBMICategory", category);
    localStorage.setItem("lastBMICategoryClass", categoryClass);

    showAlert('BMI calculated successfully!', 'success');
}


function clearBMI() {
    // Clear inputs
    document.getElementById('bmi-age').value = '';
    document.getElementById('bmi-height').value = '';
    document.getElementById('bmi-weight').value = '';

    // Reset sex selection
    selectedSex = null;
    document.getElementById('btn-male').className = 'flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-all';
    document.getElementById('btn-female').className = 'flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg hover:border-orange-500 transition-all';

    // Remove error states
    const inputs = ['bmi-age', 'bmi-height', 'bmi-weight'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove('border-red-500', 'bg-red-50');
        input.classList.add('border-gray-300');
    });

    // Hide error messages
    document.getElementById('age-error').classList.add('hidden');
    document.getElementById('height-error').classList.add('hidden');
    document.getElementById('weight-error').classList.add('hidden');

    // Hide result
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
        // Use .catch() to handle 404 errors gracefully
        const [todayMood, avgData] = await Promise.all([
            api.mood.getToday().catch(() => null), // Already has this ✅
            api.mood.getAverage().catch(() => ({ average: 0 })) // Add fallback here
        ]);

        const moodEmojis = ['😐', '😢', '😟', '😐', '🙂', '😁'];
        const moodLabels = ['Neutral', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

        // Display today's mood
        if (todayMood && todayMood.mood !== undefined) { // Better check
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
            // No mood logged yet - show default
            document.getElementById('current-mood-display').textContent = '😐';
            document.getElementById('current-mood-note').textContent = 'No mood logged yet';
            selectMood(3); // Default to neutral
        }

        // Display weekly average - handle null/undefined safely
        const avg = avgData?.average || 0;
        if (avg > 0) {
            document.getElementById('mood-weekly-avg').textContent = avg.toFixed(1);
            document.getElementById('mood-weekly-emoji').textContent = moodEmojis[Math.round(avg)] || '😐';
        } else {
            document.getElementById('mood-weekly-avg').textContent = '--';
            document.getElementById('mood-weekly-emoji').textContent = '😐';
        }

    } catch (error) {
        console.error('Error loading mood data:', error);
        // dont show error alert, just set defaults
        document.getElementById('current-mood-display').textContent = '😐';
        document.getElementById('current-mood-note').textContent = 'No mood logged yet';
        document.getElementById('mood-weekly-avg').textContent = '--';
        document.getElementById('mood-weekly-emoji').textContent = '😐';
    }
}


// ==================== SUMMARY OF TODAY ====================
async function loadSummary() {
    try {
        const summary = await api.summary.getDaily();

        // Update Health Score
        const score = summary.healthScore || 0;
        document.getElementById('health-score-value').textContent = score;

        // Update score circle color based on score
        const scoreCircle = document.getElementById('health-score-circle');
        if (score >= 80) {
            scoreCircle.style.borderColor = '#10b981'; // Green
            document.getElementById('health-score-label').textContent = 'Excellent! 🎉';
        } else if (score >= 60) {
            scoreCircle.style.borderColor = '#3b82f6'; // Blue
            document.getElementById('health-score-label').textContent = 'Good Job! 👍';
        } else if (score >= 40) {
            scoreCircle.style.borderColor = '#f59e0b'; // Orange
            document.getElementById('health-score-label').textContent = 'Keep Going! 💪';
        } else {
            scoreCircle.style.borderColor = '#ef4444'; // Red
            document.getElementById('health-score-label').textContent = 'Needs Improvement 📈';
        }

        // Water Summary
        const water = summary.water;
        document.getElementById('summary-water-text').textContent = `${water.total}ml / ${water.goal}ml`;
        document.getElementById('summary-water-progress').style.width = `${water.percentage}%`;
        document.getElementById('summary-water-status').textContent =
            water.status === 'achieved' ? '✓ Achieved' : 'In Progress';
        document.getElementById('summary-water-status').className =
            water.status === 'achieved'
                ? 'px-2 py-1 text-xs rounded-full bg-green-200 text-green-800'
                : 'px-2 py-1 text-xs rounded-full bg-blue-200 text-blue-800';

        // Exercise Summary
        const exercise = summary.exercise;
        document.getElementById('summary-exercise-text').textContent = `${exercise.total} min / ${exercise.goal} min`;
        document.getElementById('summary-exercise-progress').style.width = `${exercise.percentage}%`;
        document.getElementById('summary-exercise-status').textContent =
            exercise.status === 'achieved' ? '✓ Achieved' : 'In Progress';
        document.getElementById('summary-exercise-status').className =
            exercise.status === 'achieved'
                ? 'px-2 py-1 text-xs rounded-full bg-green-200 text-green-800'
                : 'px-2 py-1 text-xs rounded-full bg-green-200 text-green-800';

        // Sleep Summary
        const sleep = summary.sleep;
        document.getElementById('summary-sleep-text').textContent = `${sleep.average.toFixed(1)} hrs (avg)`;
        document.getElementById('summary-sleep-status').textContent =
            sleep.status === 'optimal' ? '✓ Optimal' : 'Needs Improvement';
        document.getElementById('summary-sleep-status').className =
            sleep.status === 'optimal'
                ? 'px-2 py-1 text-xs rounded-full bg-green-200 text-green-800'
                : 'px-2 py-1 text-xs rounded-full bg-orange-200 text-orange-800';

        // Calories Summary
        const calories = summary.calories;
        document.getElementById('summary-calories-text').textContent = `${calories.total} kcal / ${calories.goal} kcal`;
        document.getElementById('summary-calories-progress').style.width = `${calories.percentage}%`;
        document.getElementById('summary-calories-status').textContent =
            calories.status === 'good' ? '✓ Good' : '⚠ Exceeded';
        document.getElementById('summary-calories-status').className =
            calories.status === 'good'
                ? 'px-2 py-1 text-xs rounded-full bg-green-200 text-green-800'
                : 'px-2 py-1 text-xs rounded-full bg-red-200 text-red-800';

        // Recommendations
        const recommendations = summary.recommendations || [];
        const recList = document.getElementById('recommendations-list');
        if (recommendations.length === 0) {
            recList.innerHTML = '<li class="text-gray-700 flex items-start gap-2"><span>🎉</span><span>Great job! All goals achieved today!</span></li>';
        } else {
            recList.innerHTML = recommendations.map(rec =>
                `<li class="text-gray-700 flex items-start gap-2">
                    <span class="mt-1">•</span>
                    <span>${rec}</span>
                </li>`
            ).join('');
        }

    } catch (error) {
        console.error('Error loading summary:', error);
        showAlert('Error loading summary data. Make sure backend is running.', 'error');
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
        document.getElementById('db-water-count').textContent = stats.waterLogs || 0;
        document.getElementById('db-exercise-count').textContent = stats.exerciseLogs || 0;
        document.getElementById('db-sleep-count').textContent = stats.sleepLogs || 0;
        document.getElementById('db-calories-count').textContent = stats.caloriesLogs || 0;
        document.getElementById('db-mood-count').textContent = stats.moodLogs || 0;
        document.getElementById('db-total-count').textContent = stats.totalRecords || 0;

        // Update date range
        const dateRange = `${stats.oldestRecord} to ${stats.newestRecord}`;
        document.getElementById('db-date-range').textContent = dateRange;

        console.log('✅ Database stats loaded');

    } catch (error) {
        console.error('Error loading database stats:', error);
        showAlert('Error loading database statistics', 'error');
    }
}

function exportCSV() {
    try {
        const csvUrl = api.database.exportCSV();
        window.open(csvUrl, '_blank');
        showAlert('CSV export started! Check your downloads folder.', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showAlert('Error exporting CSV', 'error');
    }
}

async function exportJSON() {
    try {
        const data = await api.database.exportJSON();

        // create downloadable JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `fitlife_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        showAlert('JSON export completed! Check your downloads folder.', 'success');
    } catch (error) {
        console.error('Error exporting JSON:', error);
        showAlert('Error exporting JSON data', 'error');
    }
}

async function cleanupOldData() {
    const days = parseInt(document.getElementById('cleanup-days').value);

    if (!days || days < 1) {
        showAlert('Please enter a valid number of days (minimum 1)', 'error');
        return;
    }

    const confirm = window.confirm(
        `⚠️ Are you sure you want to delete all data older than ${days} days?\n\nThis action cannot be undone!`
    );
    if (!confirm) return;

    try {
        const result = await api.database.cleanup(days);
        const totalDeleted = result.totalDeleted || 0;

        showAlert(
            `Successfully deleted ${totalDeleted} old records!\n\n` +
            `Water: ${result.waterDeleted}\n` +
            `Exercise: ${result.exerciseDeleted}\n` +
            `Sleep: ${result.sleepDeleted}\n` +
            `Calories: ${result.caloriesDeleted}\n` +
            `Mood: ${result.moodDeleted}`,
            'success'
        );

        await loadDatabaseStats();
        await loadDashboard();
    } catch (error) {
        console.error('Error cleaning up data:', error);
        showAlert('Error cleaning up old data', 'error');
    }
}

async function clearAllData() {
    // First confirmation
    const confirm1 = window.confirm(
        '⚠️⚠️⚠️ FINAL WARNING ⚠️⚠️⚠️\n\n' +
        'This will DELETE ALL YOUR DATA PERMANENTLY!\n\n' +
        '• All water logs\n' +
        '• All exercise logs\n' +
        '• All sleep logs\n' +
        '• All calories logs\n' +
        '• All mood logs\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Are you ABSOLUTELY SURE you want to continue?'
    );

    if (!confirm1) {
        showAlert('Deletion cancelled. Your data is safe.', 'success');
        return;
    }

    // Second confirmation - must type exact text
    const confirm2 = window.prompt(
        '⚠️ FINAL CONFIRMATION ⚠️\n\n' +
        'To confirm deletion of ALL data, type exactly:\n\n' +
        'DELETE_ALL_DATA\n\n' +
        '(case sensitive)'
    );

    if (confirm2 !== 'DELETE_ALL_DATA') {
        showAlert('Incorrect confirmation text. Deletion cancelled.', 'error');
        return;
    }

    try {
        await api.database.clearAll('DELETE_ALL_DATA');
        showAlert(
            '✅ All data has been permanently deleted!\n\n' +
            'The database is now empty. You can start fresh.',
            'success'
        );

        // Refresh all displays
        await loadDatabaseStats();
        await loadDashboard();

        // Clear localStorage
        localStorage.removeItem('waterGoal');

    } catch (error) {
        console.error('Error clearing all data:', error);
        showAlert('Error clearing all data. Please try again.', 'error');
    }
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