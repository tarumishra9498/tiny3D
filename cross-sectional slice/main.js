import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(800, 800);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

// --- NEW: Enable Clipping ---
renderer.localClippingEnabled = true;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Fixed aspect ratio to 1 for the 800x800 box
const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, 10, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target = new THREE.Vector3(0, 1, 0);

// --- NEW: Create the Clipping Plane ---
// Normal (0, -1, 0) means it cuts everything ABOVE the plane.
// Constant is the height of the cut.
const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

// --- NEW: Create a Transparent "Slice" Indicator ---
const sliceGeo = new THREE.PlaneGeometry(20, 20);
sliceGeo.rotateX(-Math.PI / 2);
const sliceMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
});
const sliceIndicator = new THREE.Mesh(sliceGeo, sliceMat);
scene.add(sliceIndicator);

const groundGeometry = new THREE.PlaneGeometry(20, 20);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
spotLight.position.set(0, 25, 0);
scene.add(spotLight);

const loader = new GLTFLoader();
loader.load('./Heart_Insideinteration2.gltf', (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(-3.5, -39, 0);
    mesh.scale.set(60, 60, 60);

    // --- NEW: Apply the clipping plane to every part of the heart ---
    mesh.traverse((child) => {
        if (child.isMesh) {
            child.material.clippingPlanes = [localPlane];
            child.material.clipShadows = true;
            // Show the inside of the heart walls
            child.material.side = THREE.DoubleSide; 
        }
    });

    scene.add(mesh);
});

// --- NEW: Connect to the HTML Slider ---
// Make sure you have <input type="range" id="sliceSlider"> in your HTML
const slider = document.getElementById('sliceSlider');
if (slider) {
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        localPlane.constant = val;       // Move the "kill zone"
        sliceIndicator.position.y = val; // Move the transparent white box
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();