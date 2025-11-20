const barsEl = document.getElementById("bars");
const shuffleBtn = document.getElementById("shuffle");
const startBtn = document.getElementById("start");
const algoSelect = document.getElementById("algo");
const sizeInput = document.getElementById("size");
const speedInput = document.getElementById("speed");
const sizeLabel = document.getElementById("sizeLabel");
const speedLabel = document.getElementById("speedLabel");
const statusEl = document.getElementById("status");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");

let values = [];
let bars = [];
let running = false;
let comparisons = 0;
let swaps = 0;
let audioCtx;
let lastToneTime = 0;

const minToneHz = 180;
const maxToneHz = 1100;

const initAudio = () => {
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
};

const primeAudio = () => {
  initAudio();
  if (audioCtx?.state === "suspended") {
    audioCtx.resume();
  }
};

const playTone = (value) => {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  if (now - lastToneTime < 0.015) return;
  lastToneTime = now;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const norm = Math.min(Math.max((value - 10) / 90, 0), 1);
  const freq = minToneHz + norm * (maxToneHz - minToneHz);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomValue = () => Math.floor(Math.random() * 90) + 10;

const updateLabels = () => {
  sizeLabel.textContent = sizeInput.value;
  speedLabel.textContent = `${speedInput.value} ms`;
};

const updateStats = () => {
  comparisonsEl.textContent = comparisons.toString();
  swapsEl.textContent = swaps.toString();
};

const setStatus = (text) => {
  statusEl.textContent = text;
};

const setDisabled = (state) => {
  shuffleBtn.disabled = state;
  startBtn.disabled = state;
  algoSelect.disabled = state;
  sizeInput.disabled = state;
  speedInput.disabled = state;
};

const buildBars = () => {
  barsEl.innerHTML = "";
  bars = [];
  const max = Math.max(...values);
  const fragment = document.createDocumentFragment();
  values.forEach((v) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${(v / max) * 100}%`;
    fragment.appendChild(bar);
    bars.push(bar);
  });
  barsEl.appendChild(fragment);
};

const paint = (active = [], done = []) => {
  const activeSet = new Set(active);
  const doneSet = new Set(done);
  const max = Math.max(...values);
  bars.forEach((bar, idx) => {
    bar.style.height = `${(values[idx] / max) * 100}%`;
    bar.classList.toggle("active", activeSet.has(idx));
    bar.classList.toggle("done", doneSet.has(idx));
  });
  if (running && active.length) {
    const first = active[0];
    playTone(values[first]);
  }
};

const pause = () => wait(Number(speedInput.value));

const createArray = () => {
  const size = Number(sizeInput.value);
  values = Array.from({ length: size }, randomValue);
  comparisons = 0;
  swaps = 0;
  updateStats();
  setStatus("Ready");
  buildBars();
};

const startSort = async () => {
  if (running) return;
  primeAudio();
  running = true;
  setDisabled(true);
  setStatus("Sorting");
  const algo = algoSelect.value;
  if (algo === "bubble") await bubbleSort();
  if (algo === "selection") await selectionSort();
  if (algo === "insertion") await insertionSort();
  if (algo === "merge") await mergeSort();
  paint([], values.map((_, idx) => idx));
  setStatus("Done");
  running = false;
  setDisabled(false);
};

const bubbleSort = async () => {
  const done = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values.length - i - 1; j++) {
      comparisons++;
      paint([j, j + 1], done);
      updateStats();
      await pause();
      if (values[j] > values[j + 1]) {
        [values[j], values[j + 1]] = [values[j + 1], values[j]];
        swaps++;
        paint([j, j + 1], done);
        updateStats();
        await pause();
      }
    }
    done.unshift(values.length - i - 1);
  }
};

const selectionSort = async () => {
  const done = [];
  for (let i = 0; i < values.length; i++) {
    let min = i;
    for (let j = i + 1; j < values.length; j++) {
      comparisons++;
      if (values[j] < values[min]) min = j;
      paint([min, j], done);
      updateStats();
      await pause();
    }
    if (min !== i) {
      [values[i], values[min]] = [values[min], values[i]];
      swaps++;
    }
    done.push(i);
    paint([i], done);
    updateStats();
    await pause();
  }
};

const insertionSort = async () => {
  const done = [];
  done.push(0);
  for (let i = 1; i < values.length; i++) {
    let key = values[i];
    let j = i - 1;
    while (j >= 0 && values[j] > key) {
      comparisons++;
      values[j + 1] = values[j];
      swaps++;
      paint([j, j + 1], done);
      updateStats();
      await pause();
      j--;
    }
    values[j + 1] = key;
    if (i === values.length - 1) done.push(i);
    paint([j + 1], done);
    updateStats();
    await pause();
  }
  paint([], values.map((_, idx) => idx));
};

const mergeSort = async () => {
  const mergeRange = async (start, mid, end) => {
    const left = values.slice(start, mid + 1);
    const right = values.slice(mid + 1, end + 1);
    let i = 0;
    let j = 0;
    let k = start;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i] <= right[j]) {
        values[k] = left[i];
        i++;
      } else {
        values[k] = right[j];
        j++;
      }
      swaps++;
      paint([k], []);
      updateStats();
      await pause();
      k++;
    }
    while (i < left.length) {
      values[k] = left[i];
      i++;
      k++;
      swaps++;
      paint([k - 1], []);
      updateStats();
      await pause();
    }
    while (j < right.length) {
      values[k] = right[j];
      j++;
      k++;
      swaps++;
      paint([k - 1], []);
      updateStats();
      await pause();
    }
  };

  const split = async (start, end) => {
    if (start >= end) return;
    const mid = Math.floor((start + end) / 2);
    await split(start, mid);
    await split(mid + 1, end);
    await mergeRange(start, mid, end);
  };

  await split(0, values.length - 1);
};

shuffleBtn.addEventListener("click", () => {
  if (running) return;
  primeAudio();
  createArray();
});

startBtn.addEventListener("click", startSort);

sizeInput.addEventListener("input", () => {
  updateLabels();
  if (running) return;
  createArray();
});

speedInput.addEventListener("input", updateLabels);

updateLabels();
createArray();
