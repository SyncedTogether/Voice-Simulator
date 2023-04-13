//#region Slider Handlers
function gainSliderChanged() {
  let gainValue = gainSliderElement.value;
  gainSliderTextElement.innerHTML = gainValue;
  gainNode.gain.value = gainValue / 100;
}

function oscillatorFreqSliderChanged() {
  let freqValue = oscillatorFreqSliderElement.value;
  oscillatorFreqSliderTextElement.innerHTML = freqValue;
  oscillator.frequency.value = freqValue;
}

function batchSizeSliderChanged() {
  batchSize = batchSliderElement.value;
  batchSliderTextElement.innerHTML = batchSize;
}

function historySliderChanged() {
  frequencyHistoryLimit = historySliderElement.value;
  historySliderTextElement.innerHTML = frequencyHistoryLimit;
}

function accuracySliderChanged() {
  barWidth = accuracySliderElement.value;
  accuracySliderTextElement.innerHTML = barWidth;
  frequencyHistoryLimit = Math.ceil(cnvWidth / barWidth);
  historySliderElement.max = frequencyHistoryLimit;
}

//#endregion

//#region Button Handlers
stopButton.addEventListener("click", () => {
  stop();
  isStarted = false;
});

startButton.addEventListener("click", () => {
  if (!isStarted) {
    start();
  }
  isStarted = true;
});

function start() {
  isTickAdvancing = true;
  oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 440;
  oscillator.connect(analyserNode);
  oscillator.start();

  init();
}

function stop() {
  isTickAdvancing = false;
  oscillator.stop();
}

//#endregion

//#region History Handlers
function updateDimensionalData() {
  const currentAmplitudes = [];
  for (let i = 0; i < frequencyDataLength; i++) {
    currentAmplitudes.push(frequencyData[i]);
  }
  frequencyHistory.push(currentAmplitudes);

  limitDimensionalData();
}

function limitDimensionalData() {
  if (frequencyHistory.length > frequencyHistoryLimit) {
    // remove the oldest data without shifting the history
    frequencyHistory.splice(0, frequencyHistory.length - frequencyHistoryLimit);
  }
}

//#endregion

//#region Oscilation Handlers
function sinOscilation(tick, minValue, maxValue, period) {
  const amplitude = 100; // set the amplitude of the sine wave
  const center = (maxValue + minValue) / 200; // set the center value of the sine wave
  const frequency = 1 / period; // set the frequency of the sine wave
  const position =
    Math.sin(tick * frequency * Math.PI * 2) * amplitude + center; // calculate the position value
  return position;
}

function oscialtePitch() {
  oscillatorFreqSliderElement.value = sinOscilation(
    tick,
    oscillatorFreqSliderElement.min,
    oscillatorFreqSliderElement.max,
    200
  );
  oscillator.frequency.value = sinOscilation(
    tick,
    oscillatorFreqSliderElement.min,
    oscillatorFreqSliderElement.max,
    200
  );

  oscillatorFreqSliderTextElement.innerHTML = truncate(
    oscillator.frequency.value,
    0
  );
}

function toggleSin() {
  if (document.getElementById("oscilateCheckbox").checked) {
    isAnimatingOscilation = true;
  } else {
    isAnimatingOscilation = false;
    oscillatorFreqSliderChanged();
  }
}

//#endregion

//#region Draw Handlers
function toggleGradient() {
  isGradient = !isGradient;
}

function toggleHistory() {
  isDisplayingHistory = !isDisplayingHistory;
}

function toggle3D() {
  isDisplaying3D = !isDisplaying3D;
}

function toggleWaveform() {
  isDisplayingWaveform = !isDisplayingWaveform;
}
//#endregion

//#region Nav Handlers
function navigate(page) {
  switch (page) {
    case 1:
      window.location.href = "Layout1.html";
      break;
    case 2:
      window.location.href = "Layout2.html";
      break;
  }
}
//#endregion
