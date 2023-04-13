//#region Declarations & Init Sequence

window.addEventListener("load", init);

const audioContext = new AudioContext();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

const gainSliderElement = document.getElementById("gainSlider");
const gainSliderTextElement = document.getElementById("gainSlider-value");

const oscillatorFreqSliderElement = document.getElementById(
  "oscillatorFreqSlider"
);
const oscillatorFreqSliderTextElement = document.getElementById(
  "oscillatorFreqSlider-value"
);

const batchSliderElement = document.getElementById("batchSizeSlider");
const batchSliderTextElement = document.getElementById("batchSizeSlider-value");

const resolutionSliderElement = document.getElementById("resolutionSlider");
const resolutionSliderTextElement = document.getElementById(
  "resolutionSlider-value"
);

const analyserNode = audioContext.createAnalyser({ fftSize: 2048 });
const gainNode = audioContext.createGain();

const sectionHeight = canvas.height / 3;
const section1 = sectionHeight;
const section2 = sectionHeight * 2;
const cnvWidth = canvas.width;

let isTickAdvancing = false;
let tick = 0;
let timeStep = 1;

let frequencyHistory = [];
let frequencyHistoryLimit = 64;

const frequencyDataLength = analyserNode.frequencyBinCount;
const frequencyData = new Uint8Array(frequencyDataLength);

let isAnimatingOscilation = false;
let isGradient = true;
let prioritizedFreq = null;

analyserNode.connect(gainNode);
gainNode.connect(audioContext.destination);

let oscillator = null;
let isStarted = false;
//#endregion

function init() {
  uiUpdate();
  threeJS();
  draw();
}

function uiUpdate() {
  gainSliderChanged();
  batchSizeSliderChanged();
}

function draw() {
  update();
  threeJSUpdate();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (tick % timeStep == 0) {
    renderRow1();
  }
  renderRow2();
  renderRow3();
  renderDividers();
  if (isTickAdvancing) {
    requestAnimationFrame(draw);
  }
}

function update() {
  if (isTickAdvancing) {
    tick += 1;
    document.getElementById("tickDisplay").innerHTML = `Tick: ${formatNumber(
      tick
    )}`;
    if (isAnimatingOscilation) {
      oscialtePitch();
    }
  } else {
    tick = 0;
  }
}

function renderDividers() {
  ctx.beginPath();
  ctx.moveTo(0, section1);
  ctx.lineTo(canvas.width, section1);
  ctx.moveTo(0, section2);
  ctx.lineTo(canvas.width, section2);
  ctx.stroke();
}

function renderRow1() {
  let cnvHeight = section1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, cnvWidth, section1);
  ctx.clip();

  analyserNode.getByteFrequencyData(frequencyData);

  updateDimensionalData();
  for (let i = 0; i < frequencyHistory.length; i++) {
    const currentAmplitudes = frequencyHistory[i];
    for (let k = 0; k < currentAmplitudes.length; k++) {
      const amplitude = currentAmplitudes[k];
      const barWidth = 10;
      const barHeight = (amplitude / 255) * cnvHeight;
      const x = cnvWidth - i * barWidth;
      const y = cnvHeight - barHeight;
      if (isGradient) {
        ctx.fillStyle = `rgb(${amplitude}, 0, ${255 - amplitude}, 0.1)`;
        ctx.fillRect(x, y, barWidth, barHeight);
      } else {
        ctx.fillStyle = `rgb(0, 0, 0, 0.1)`;
        ctx.fillRect(x, y, barWidth, 3);
      }
    }
  }

  ctx.restore();
}

function renderRow2() {
  let cnvHeight = section1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, section1, cnvWidth, sectionHeight);
  ctx.clip();
  ctx.translate(0, section1);

  analyserNode.getByteFrequencyData(frequencyData);
  ctx.fillStyle = "red";

  const barWidth = cnvWidth / 100;
  for (let i = 0; i < frequencyData.length; i++) {
    const barHeight = (frequencyData[i] / 255) * cnvHeight;
    const x = i * barWidth;
    const y = cnvHeight - barHeight;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  //render the overall gain on the right side of the canvas
  const gainBarWidth = 20;
  ctx.fillStyle = "green";
  ctx.fillRect(
    cnvWidth - gainBarWidth,
    cnvHeight,
    gainBarWidth,
    -gainNode.gain.value * cnvHeight
  );

  // render the oscillator frequency on the right side of the canvas
  if (oscillator) {
    ctx.fillStyle = "blue";
    ctx.fillRect(
      cnvWidth - gainBarWidth * 2,
      cnvHeight,
      gainBarWidth,
      (-oscillator.frequency.value / analyserNode.frequencyBinCount) *
        cnvHeight *
        2
    );
  }

  ctx.restore();
}

function renderRow3() {
  let cnvHeight = section1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, section2, cnvWidth, sectionHeight);
  ctx.clip();
  ctx.translate(0, section2);

  // render waveform with color gradient
  analyserNode.getByteTimeDomainData(frequencyData);
  ctx.lineWidth = 2;

  // create a linear gradient that goes from blue to red
  const gradient = ctx.createLinearGradient(0, 0, 0, cnvHeight);
  gradient.addColorStop(1, "blue");
  gradient.addColorStop(0, "red");

  // render spectral centroid display
  //fill style very light black
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.fillRect(
    0,
    cnvHeight,
    cnvWidth,
    (-getSpectralCentroid() / 1000) * cnvHeight
  );

  // set the stroke style to the gradient
  ctx.strokeStyle = gradient;
  ctx.beginPath();
  const sliceWidth = (cnvWidth * 1.0) / frequencyData.length;
  let x = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    const v = frequencyData[i] / 128.0;
    const y = (v * cnvHeight) / 2;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  ctx.restore();
}

function getSpectralCentroid() {
  let sum = 0;
  let sumOfWeights = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += i * frequencyData[i];
    sumOfWeights += frequencyData[i];
  }
  return sum / sumOfWeights;
}
