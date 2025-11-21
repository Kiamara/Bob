import { playTone } from "./audio.js";

export const sizeInput = document.getElementById("size");
export const speedInput = document.getElementById("speed");
export const shuffleBtn = document.getElementById("shuffle");
export const startBtn = document.getElementById("start");
export const algoSelect = document.getElementById("algo");
export const state = {
  values: [],
  running: false,
  comparisons: 0,
  swaps: 0,
};

const sizeLabel = document.getElementById("sizeLabel");
const speedLabel = document.getElementById("speedLabel");
const statusEl = document.getElementById("status");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const barsEl = document.getElementById("bars");

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const pause = () => wait(speedInput.value);

const randomValue = () => Math.floor(Math.random() * 90) + 10;

let bars = [];

export const updateLabels = () => {
  sizeLabel.textContent = sizeInput.value;
  speedLabel.textContent = `${speedInput.value} ms`;
};

export const setDisabled = (state) => {
  shuffleBtn.disabled = state;
  startBtn.disabled = state;
  algoSelect.disabled = state;
  sizeInput.disabled = state;
  speedInput.disabled = state;
};

export const updateStats = () => {
  comparisonsEl.textContent = state.comparisons.toString();
  swapsEl.textContent = state.swaps.toString();
};

export const setStatus = (text) => {
  statusEl.textContent = text;
};

const buildBars = () => {
  barsEl.innerHTML = "";
  bars = [];
  const max = Math.max(...state.values);
  const fragment = document.createDocumentFragment();
  state.values.forEach((v) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${(v / max) * 100}%`;
    fragment.appendChild(bar);
    bars.push(bar);
  });
  barsEl.appendChild(fragment);
};

export const paint = (active = [], done = []) => {
  const activeSet = new Set(active);
  const doneSet = new Set(done);
  const max = Math.max(...state.values);
  bars.forEach((bar, idx) => {
    bar.style.height = `${(state.values[idx] / max) * 100}%`;
    bar.classList.toggle("active", activeSet.has(idx));
    bar.classList.toggle("done", doneSet.has(idx));
  });
  if (state.running && active.length) {
    const first = active[0];
    playTone(state.values[first]);
  }
};

export const createArray = () => {
  const size = Number(sizeInput.value);
  state.values = Array.from({ length: size }, randomValue);
  state.comparisons = 0;
  state.swaps = 0;
  updateStats();
  setStatus("Ready");
  buildBars();
};
