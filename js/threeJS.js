const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  threeJSDisplay.clientWidth / threeJSDisplay.clientHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const clock = new THREE.Clock();

const terrainWidth = 50;
const terrainDepth = 50;
const terrainMaxHeight = 10;
const terrainRoughness = 0.5;

const terrainGeometry = new THREE.PlaneBufferGeometry(
  terrainWidth,
  terrainDepth,
  terrainWidth - 1,
  terrainDepth - 1
);

const heights = new Float32Array(terrainGeometry.attributes.position.count);

for (let i = 0; i < terrainGeometry.attributes.position.count; i++) {
  const x = terrainGeometry.attributes.position.getX(i);
  const y = terrainGeometry.attributes.position.getY(i);

  let z = Math.random() * terrainMaxHeight;
  const octaveCount = 4;
  const lacunarity = 2;
  const persistence = 0.5;

  for (let octave = 0; octave < octaveCount; octave++) {
    const frequency = Math.pow(lacunarity, octave);
    const amplitude = Math.pow(persistence, octave);

    const noiseValue =
      noise.perlin3(x * frequency, y * frequency, clock.getElapsedTime()) *
      amplitude *
      terrainMaxHeight *
      Math.pow(terrainRoughness, octave);

    if (!isNaN(noiseValue)) {
      z += noiseValue;
    } else {
      z += 0; // or any other default value
    }
  }

  if (!isNaN(z)) {
    terrainGeometry.attributes.position.setZ(i, z);
    heights[i] = z; // set the height value in the heights array
  } else {
    terrainGeometry.attributes.position.setZ(i, 0); // or any other default value
    heights[i] = 0; // set the default height value in the heights array
  }
}

const colors = new Float32Array(terrainGeometry.attributes.position.count * 3);

terrainGeometry.computeVertexNormals();
const terrainMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotation.x = -Math.PI / 2;
scene.add(terrainMesh);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

camera.position.set(0, terrainMaxHeight * 2, terrainDepth);
renderer.setSize(threeJSDisplay.clientWidth, threeJSDisplay.clientHeight);
document.getElementById("threeJSDisplay").appendChild(renderer.domElement);

const bufferLength = frequencyDataLength;
const dataArray = new Float32Array(bufferLength);

let batchSize = 100; // Number of vertices to update per frame
let vertexIndex = 0; // Index of the vertex to start updating

function updateTerrain() {
  const time = clock.getElapsedTime();
  analyserNode.getFloatFrequencyData(dataArray);

  for (let i = 0; i < batchSize; i++) {
    if (vertexIndex >= terrainGeometry.attributes.position.count) {
      // All vertices have been updated, reset the index
      vertexIndex = 0;
    }

    const x = terrainGeometry.attributes.position.getX(vertexIndex);
    const y = terrainGeometry.attributes.position.getY(vertexIndex);

    let z = 0;

    // Map the frequencies to the terrain vertices
    for (let j = 0; j < dataArray.length; j++) {
      const frequency = j / dataArray.length;
      const amplitude = dataArray[j] / 5000;

      const noiseValue =
        noise.perlin3(x * frequency, y * frequency, time) * amplitude;

      z += noiseValue;
    }

    if (!isNaN(z)) {
      terrainGeometry.attributes.position.setZ(vertexIndex, z);
    } else {
      terrainGeometry.attributes.position.setZ(vertexIndex, 0); // or any other default value
    }

    vertexIndex++;
  }

  terrainGeometry.computeVertexNormals();
  terrainGeometry.attributes.position.needsUpdate = true;
  terrainGeometry.attributes.normal.needsUpdate = true;
}

function threeJSUpdate() {
  updateTerrain();
  updateCamera();
  renderer.render(scene, camera);
}

let cameraRadius = 50; // the distance of the camera from the center point
let cameraAngle = 0; // the current angle of the camera around the center point
const cameraSpeed = 0.01; // the speed of the camera rotation

function updateCamera() {
  // calculate the new position of the camera
  const cameraX = cameraRadius * Math.sin(cameraAngle);
  const cameraZ = cameraRadius * Math.cos(cameraAngle);

  // update the position of the camera
  camera.position.set(cameraX, terrainMaxHeight * 2, cameraZ);

  // look at the center point
  camera.lookAt(terrainMesh.position);

  // update the camera angle for the next frame
  cameraAngle += cameraSpeed;
}
