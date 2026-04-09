import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- DOM Elements ---
const container = document.getElementById('canvas-container');
const statusTextEl = document.getElementById('status-text');
const colorNameEl = document.getElementById('color-name');
const colorHexEl = document.getElementById('color-hex');
const colorSwatchEl = document.getElementById('color-swatch');
const meshNameEl = document.getElementById('mesh-name');

// --- Main Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.01,   // FIX: prevents model disappearing when zooming in
  5000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 0.1;   // FIX: prevents zooming inside the model
controls.maxDistance = 500;

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 2.5));
const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
scene.add(mainLight);

// --- Picking Scene ---
let pickingScene = new THREE.Scene();
let pickingTexture = new THREE.WebGLRenderTarget(
  container.clientWidth,
  container.clientHeight,
  { type: THREE.UnsignedByteType }
);

let idToMesh = new Map();
let nextID = 1;

function resizePickingTexture() {
  pickingTexture.setSize(container.clientWidth, container.clientHeight);
}

// --- UI Helper ---
function setPanel(status, name, hex, meshName) {
  statusTextEl.textContent = status;
  colorNameEl.textContent = name;
  colorHexEl.textContent = hex;
  meshNameEl.textContent = meshName || '--';
  colorSwatchEl.style.backgroundColor = hex !== '--' ? hex : '#222';
}

// --- Color Name Map ---
const colorMap = {
  '#cd4949': 'Red',
  '#5a8dee': 'Blue',
  '#6bbf59': 'Green',
  '#f2c14e': 'Yellow',
  '#ffffff': 'White'
};

function getClosestColorName(hex) {
  return colorMap[hex] || "Custom Color";
}

// --- Load Model ---
const loader = new GLTFLoader();
let loadedModel = null;

loader.load('./plsdontdelete2.glb', (gltf) => {
  loadedModel = gltf.scene;
  scene.add(loadedModel);

  // Center camera
  const box = new THREE.Box3().setFromObject(loadedModel);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  camera.position.set(center.x, center.y, center.z + maxDim * 2);
  controls.target.copy(center);
  controls.update();

  // Build picking scene
  loadedModel.updateMatrixWorld(true);

  loadedModel.traverse((child) => {
    if (child.isMesh) {
      const id = nextID++;

      // Generate bright, unique ID color
      const color = new THREE.Color(
        (id * 50 % 255) / 255,
        (id * 80 % 255) / 255,
        (id * 130 % 255) / 255
      );

      idToMesh.set(id, child);

      const pickingMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      });

      const pickingMesh = new THREE.Mesh(child.geometry, pickingMaterial);
      pickingMesh.applyMatrix4(child.matrixWorld);

      pickingScene.add(pickingMesh);
    }
  });

  setPanel('Model Loaded', 'None', '--', '--');
});

// --- Click Handler ---
renderer.domElement.addEventListener('click', (e) => {
  if (!loadedModel) return;

  const rect = renderer.domElement.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(rect.height - (e.clientY - rect.top));

  const pixel = new Uint8Array(4);

  // Render picking scene
  renderer.setRenderTarget(pickingTexture);
  renderer.render(pickingScene, camera);
  renderer.readRenderTargetPixels(pickingTexture, x, y, 1, 1, pixel);
  renderer.setRenderTarget(null);

  console.log("Picked pixel RGBA:", pixel);

  // Convert RGB to ID
  const id =
    pixel[0] +
    pixel[1] * 256 +
    pixel[2] * 65536;

  console.log("Picked ID:", id);

  const mesh = idToMesh.get(id);

  if (mesh) {
    const hex = "#" + mesh.material.color.getHexString();
    console.log("Detected HEX:", hex);

    const name = getClosestColorName(hex);
    setPanel("Detected!", name, hex, mesh.name);
  } else {
    console.log("No mesh found at click");
    setPanel("No mesh hit", "--", "--", "--");
  }
});

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
  resizePickingTexture();
});

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  mainLight.position.copy(camera.position);
  controls.update();
  renderer.render(scene, camera);
}
animate();
