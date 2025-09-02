const timerDisplay = document.getElementById("timer");
const toggleBtn = document.getElementById("toggle");
const resetBtn = document.getElementById("reset");
const ring = document.querySelector(".progress-ring-fill");
const darkToggle = document.getElementById("darkModeToggle");
const focusSelect = document.getElementById("focusDuration");
const breakSelect = document.getElementById("breakDuration");
const sessionLabel = document.getElementById("sessionLabel");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const toggleHistoryBtn = document.getElementById("toggleHistory");

const FULL_DASH = 565.48;
let interval = null;
let isRunning = false;
let isFocus = true;
let time = 1500;
let focusTime = 1500;
let breakTime = 300;

function setInitialTime() {
  focusTime = parseInt(focusSelect.value) * 60;
  breakTime = parseInt(breakSelect.value) * 60;
  time = focusTime;
  isFocus = true;
  updateTimerDisplay();
  updateRing();
  sessionLabel.textContent = "Focus Time";
}

function updateTimerDisplay() {
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  timerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateRing() {
  const max = isFocus ? focusTime : breakTime;
  const progress = time / max;
  ring.style.strokeDashoffset = FULL_DASH * (1 - progress);
}

function startTimer() {
  interval = setInterval(() => {
    if (time > 0) {
      time--;
      updateTimerDisplay();
      updateRing();
    } else {
      clearInterval(interval);
      logSession();
      isRunning = false;
      isFocus = !isFocus;
      time = isFocus ? focusTime : breakTime;
      sessionLabel.textContent = isFocus ? "Focus Time" : "Break Time";
      updateTimerDisplay();
      updateRing();
      startTimer();
    }
  }, 1000);
}

function toggleTimer() {
  if (!isRunning) {
    startTimer();
    toggleBtn.textContent = "Pause";
    isRunning = true;
  } else {
    clearInterval(interval);
    toggleBtn.textContent = "Start";
    isRunning = false;
  }
}

function resetTimer() {
  clearInterval(interval);
  isRunning = false;
  toggleBtn.textContent = "Start";
  setInitialTime();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

function toggleHistoryPanel() {
  historyPanel.classList.toggle("show");
  renderHistory();
}

function logSession() {
  const now = new Date();
  const type = isFocus ? "Focus" : "Break";
  const duration = isFocus ? focusTime / 60 : breakTime / 60;
  const session = {
    type,
    duration,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  };
  const history = JSON.parse(localStorage.getItem("pom_history") || "[]");
  history.unshift(session);
  localStorage.setItem("pom_history", JSON.stringify(history));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("pom_history") || "[]");
  historyList.innerHTML = "";
  if (!history.length) {
    const empty = document.createElement("li");
    empty.innerHTML = `<em>You haven’t completed any sessions yet.</em>`;
    empty.style.fontStyle = "italic";
    empty.style.color = "gray";
    historyList.appendChild(empty);
    return;
  }
  history.forEach(entry => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${entry.type} – ${entry.duration} min</strong><br>
      <small>📅 ${entry.date} • 🕒 ${entry.time}</small>
    `;
    historyList.appendChild(li);
  });
}

toggleBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
darkToggle.addEventListener("change", toggleDarkMode);
toggleHistoryBtn.addEventListener("click", toggleHistoryPanel);
focusSelect.addEventListener("change", setInitialTime);
breakSelect.addEventListener("change", setInitialTime);

setInitialTime();
renderHistory();
