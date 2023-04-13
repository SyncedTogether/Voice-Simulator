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

//#endregion

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
  oscillator.type = "sin";
  oscillator.frequency.value = 440;
  oscillator.connect(analyserNode);
  oscillator.start();

  init();

  //   const width = 1; // width of each box
  //   const heightMultiplier = 2; // multiply the value of each element by this amount to get the height of the box
  //   const depth = 1; // depth of each box
  //   const spacing = 2; // spacing between each box
  //   for (let i = 0; i < frequencyHistory.length; i++) {
  //     for (let j = 0; j < frequencyHistory[i].length; j++) {
  //       const boxGeometry = new THREE.BoxGeometry(
  //         width,
  //         frequencyHistory[i][j] * heightMultiplier,
  //         depth
  //       );
  //       const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // set the color of each box to red
  //       const box = new THREE.Mesh(boxGeometry, boxMaterial);
  //       // ! make another 2d array of box objects
  //       box.position.x = (i - frequencyHistory.length / 2) * (width + spacing); // position the box in a grid
  //       box.position.y = (frequencyHistory[i][j] * heightMultiplier) / 2; // position the box so that its base is at y=0
  //       box.position.z = (j - frequencyHistory[i].length / 2) * (depth + spacing); // position the box in a grid
  //       //scene.add(box); // add the box to the scene
  //       //renderer.render(scene, camera);
  //     }
  //   }
  // }
}

function stop() {
  isTickAdvancing = false;
  oscillator.stop();
}

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
    frequencyHistory.shift();
  }
}

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

function toggleGradient() {
  isGradient = !isGradient;
}
