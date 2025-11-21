import { primeAudio } from "./audio.js";
import {
  algoSelect,
  pause,
  paint,
  setDisabled,
  setStatus,
  state,
  updateStats,
} from "./renderAndHelperSutff.js";

export const startSort = async () => {
  if (state.running) return;
  primeAudio();
  state.running = true;
  setDisabled(true);
  setStatus("Sorting");
  const algo = algoSelect.value;
  if (algo === "bubble") await bubbleSort();
  if (algo === "selection") await selectionSort();
  if (algo === "insertion") await insertionSort();
  if (algo === "merge") await mergeSort();
  paint([], state.values.map((_, idx) => idx));
  setStatus("Done");
  state.running = false;
  setDisabled(false);
};

const bubbleSort = async () => {
  const done = [];
  for (let i = 0; i < state.values.length; i++) {
    for (let j = 0; j < state.values.length - i - 1; j++) {
      state.comparisons++;
      paint([j, j + 1], done);
      updateStats();
      await pause();
      if (state.values[j] > state.values[j + 1]) {
        [state.values[j], state.values[j + 1]] = [
          state.values[j + 1],
          state.values[j],
        ];
        state.swaps++;
        paint([j, j + 1], done);
        updateStats();
        await pause();
      }
    }
    done.unshift(state.values.length - i - 1);
  }
};

const selectionSort = async () => {
  const done = [];
  for (let i = 0; i < state.values.length; i++) {
    let min = i;
    for (let j = i + 1; j < state.values.length; j++) {
      state.comparisons++;
      if (state.values[j] < state.values[min]) min = j;
      paint([min, j], done);
      updateStats();
      await pause();
    }
    if (min !== i) {
      [state.values[i], state.values[min]] = [
        state.values[min],
        state.values[i],
      ];
      state.swaps++;
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
  for (let i = 1; i < state.values.length; i++) {
    let key = state.values[i];
    let j = i - 1;
    while (j >= 0 && state.values[j] > key) {
      state.comparisons++;
      state.values[j + 1] = state.values[j];
      state.swaps++;
      paint([j, j + 1], done);
      updateStats();
      await pause();
      j--;
    }
    state.values[j + 1] = key;
    if (i === state.values.length - 1) done.push(i);
    paint([j + 1], done);
    updateStats();
    await pause();
  }
  paint([], state.values.map((_, idx) => idx));
};

const mergeSort = async () => {
  const mergeRange = async (start, mid, end) => {
    const left = state.values.slice(start, mid + 1);
    const right = state.values.slice(mid + 1, end + 1);
    let i = 0;
    let j = 0;
    let k = start;
    while (i < left.length && j < right.length) {
      state.comparisons++;
      if (left[i] <= right[j]) {
        state.values[k] = left[i];
        i++;
      } else {
        state.values[k] = right[j];
        j++;
      }
      state.swaps++;
      paint([k], []);
      updateStats();
      await pause();
      k++;
    }
    while (i < left.length) {
      state.values[k] = left[i];
      i++;
      k++;
      state.swaps++;
      paint([k - 1], []);
      updateStats();
      await pause();
    }
    while (j < right.length) {
      state.values[k] = right[j];
      j++;
      k++;
      state.swaps++;
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

  await split(0, state.values.length - 1);
};
