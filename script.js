const today = new Date();
today.setHours(0, 0, 0, 0);

const performanceDate = new Date(2026, 7, 8);
performanceDate.setHours(0, 0, 0, 0);

const millisecondsPerDay = 1000 * 60 * 60 * 24;
const daysUntilPerformance = Math.ceil(
  (performanceDate - today) / millisecondsPerDay
);
const countdown = document.getElementById("倒數");

if (daysUntilPerformance > 0) {
  countdown.textContent = `距離首場演出還有 ${daysUntilPerformance} 天`;
} else if (daysUntilPerformance === 0) {
  countdown.textContent = "今天就是首場演出！";
} else {
  countdown.textContent = "2026 巡演已圓滿結束，期待下次見！";
}

const playButton = document.getElementById("play-button");
const playIcon = playButton.querySelector(".play-icon");
const progressBar = document.getElementById("progress-bar");
const playerTime = document.getElementById("player-time");
const playerStatus = document.getElementById("player-status");
const previewDuration = 168;
let audioContext;
let oscillator;
let gainNode;
let animationFrame;
let previewStartedAt = 0;
let elapsed = 0;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function stopPreview() {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function updateProgress() {
  elapsed = Math.min((performance.now() - previewStartedAt) / 1000, previewDuration);
  progressBar.style.width = `${(elapsed / previewDuration) * 100}%`;
  playerTime.textContent = formatTime(elapsed);

  if (elapsed < previewDuration) {
    animationFrame = requestAnimationFrame(updateProgress);
  } else {
    stopPreview();
    playButton.setAttribute("aria-pressed", "false");
    playIcon.textContent = "▶";
    playerStatus.textContent = "試聽結束，再聽一次吧。";
  }
}

playButton.addEventListener("click", () => {
  if (oscillator) {
    stopPreview();
    playButton.setAttribute("aria-pressed", "false");
    playIcon.textContent = "▶";
    playerStatus.textContent = "試聽已暫停。";
    return;
  }

  audioContext = audioContext || new AudioContext();
  oscillator = audioContext.createOscillator();
  gainNode = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 196;
  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.06, audioContext.currentTime + 0.3);
  oscillator.connect(gainNode).connect(audioContext.destination);
  oscillator.start();
  previewStartedAt = performance.now() - (elapsed * 1000);
  playButton.setAttribute("aria-pressed", "true");
  playIcon.textContent = "Ⅱ";
  playerStatus.textContent = "正在播放新曲試聽。";
  updateProgress();
});
