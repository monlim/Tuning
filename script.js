import { PitchDetector } from "https://esm.sh/pitchy@4";

document.addEventListener("DOMContentLoaded", () => {
  const audioContext = new window.AudioContext();
  const analyserNode = audioContext.createAnalyser();

  document
    .getElementById("start_demo")
    .addEventListener("click", () => audioContext.resume());

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext.createMediaStreamSource(stream).connect(analyserNode);
    const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
    const input = new Float32Array(detector.inputLength);
    updatePitch(analyserNode, detector, input, audioContext.sampleRate);
  });
});

let pitch, clarity;
function updatePitch(analyserNode, detector, input, sampleRate) {
  analyserNode.getFloatTimeDomainData(input);
  [pitch, clarity] = detector.findPitch(input, sampleRate);
  if (clarity > 0.95 && pitch > 80) makeSound(pitch);
  document.getElementById("pitch").textContent = `${Math.round(pitch)} Hz`;
  document.getElementById("clarity").textContent = `${Math.round(
    clarity * 100
  )} %`;
  window.setTimeout(
    () => updatePitch(analyserNode, detector, input, sampleRate),
    100
  );
}

const gainNode = new Tone.Gain(0).toDestination();
const osc1 = new Tone.Oscillator(440, "sine").connect(gainNode);
const osc2 = new Tone.Oscillator(440, "sawtooth").connect(gainNode);
const osc3 = new Tone.Oscillator(440, "square").connect(gainNode);

function makeSound(pitch) {
  osc1.frequency.value = pitch;
  osc2.frequency.value = pitch * 0.5;
  osc3.frequency.value = pitch * 1.5;
}

/*function incrementEventCount(){
  let counterElement = document.getElementById("num-observed-events")
  let eventCount = parseInt(counterElement.innerHTML)
  counterElement.innerHTML = eventCount + 1;
}*/

// function updateFieldIfNotNull(fieldName, value, precision=10){
//   if (value != null)
//     document.getElementById(fieldName).innerHTML = value.toFixed(precision);
// }

function handleOrientation(event) {
  //   updateFieldIfNotNull('Orientation_a', event.alpha);
  //   updateFieldIfNotNull('Orientation_b', event.beta);
  //   updateFieldIfNotNull('Orientation_g', event.gamma);
  //incrementEventCount();
  osc1.volume.value = scaleValue(event.alpha, [-180, 180], [-36, 0]);
  osc2.volume.value = scaleValue(event.beta, [-180, 180], [-36, 0]);
  osc3.volume.value = scaleValue(event.gamma, [-180, 180], [-36, 0]);
}

let accel;
function handleMotion(event) {
  //   updateFieldIfNotNull('Accelerometer_gx', event.accelerationIncludingGravity.x);
  //   updateFieldIfNotNull('Accelerometer_gy', event.accelerationIncludingGravity.y);
  //   updateFieldIfNotNull('Accelerometer_gz', event.accelerationIncludingGravity.z);
  //   updateFieldIfNotNull('Accelerometer_x', event.acceleration.x);
  //   updateFieldIfNotNull('Accelerometer_y', event.acceleration.y);
  //   updateFieldIfNotNull('Accelerometer_z', event.acceleration.z);

  accel =
    event.acceleration.x ** 2 +
    event.acceleration.y ** 2 +
    event.acceleration.z ** 2;
  //   updateFieldIfNotNull('All', accel);
  GA.volume.value = scaleValue(accel, [0, 6], [-24, 0]);

  //   updateFieldIfNotNull('Accelerometer_i', event.interval, 2);

  //   updateFieldIfNotNull('Gyroscope_z', event.rotationRate.alpha);
  //   updateFieldIfNotNull('Gyroscope_x', event.rotationRate.beta);
  //   updateFieldIfNotNull('Gyroscope_y', event.rotationRate.gamma);
  //incrementEventCount();
}

let is_running = false;
let demo_button = document.getElementById("start_demo");
demo_button.onclick = function (e) {
  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }

  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    window.removeEventListener("shake", shakeEventDidOccur, false);
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    //demo_button.classList.add('btn-success');
    //demo_button.classList.remove('btn-danger');
    myShakeEvent.stop();
    gainNode.gain.rampTo(0, 0.4);
    osc1.stop();
    osc2.stop();
    osc3.stop();
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("shake", shakeEventDidOccur, false);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
    myShakeEvent.start();
    osc1.start();
    osc2.start();
    osc3.start();
    gainNode.gain.rampTo(0.5, 0.4);
    is_running = true;
  }
};

function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

//exponential scale
let powerScale = d3
  .scalePow()
  .exponent(1.4)
  .domain([0, 6])
  .range([0, 1])
  .clamp(true);

var myShakeEvent = new Shake({
  threshold: 9, // optional shake strength threshold
  timeout: 1000, // optional, determines the frequency of event generation
});

//function to call when shake occurs
function shakeEventDidOccur() {
  //alert('shake!');
}
