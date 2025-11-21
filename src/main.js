import {
  createArray,
  shuffleBtn,
  sizeInput,
  speedInput,
  startBtn,
  state,
  updateLabels,
} from "./someJSLogichere/renderAndHelperSutff.js";
import { primeAudio } from "./someJSLogichere/audio.js";
import { startSort } from "./someJSLogichere/sorts.js";

shuffleBtn.addEventListener("click", () => {
  if (state.running) return;
  primeAudio();
  createArray();
});

startBtn.addEventListener("click", startSort);

sizeInput.addEventListener("input", () => {
  updateLabels();
  if (state.running) return;
  createArray();
});

speedInput.addEventListener("input", updateLabels);

updateLabels();
createArray();
