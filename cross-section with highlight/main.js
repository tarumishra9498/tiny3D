import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(800, 800);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.localClippingEnabled = true;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
camera.position.set(0, 10, 50);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target = new THREE.Vector3(0, 1, 0);

// Clipping plane
const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

// Transparent slice indicator
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

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
spotLight.position.set(0, 25, 0);
scene.add(spotLight);

// --- NEW: Store heart + outline ---
let heartRoot = null;
let sliceOutline = null;

// --- NEW: Create actual cut-edge lines for one mesh ---
function createSliceOutlineForMesh(mesh, plane) {
    const geom = mesh.geometry.clone();
    geom.applyMatrix4(mesh.matrixWorld);

    const pos = geom.attributes.position;
    const index = geom.index;
    const points = [];

    const getVertex = (i) => {
        return new THREE.Vector3(
            pos.getX(i),
            pos.getY(i),
            pos.getZ(i)
        );
    };

    const intersectEdge = (a, b, da, db) => {
        const t = da / (da - db);
        return new THREE.Vector3().lerpVectors(a, b, t);
    };

    const processTriangle = (a, b, c) => {
        const da = plane.distanceToPoint(a);
        const db = plane.distanceToPoint(b);
        const dc = plane.distanceToPoint(c);

        const intersections = [];

        if ((da > 0 && db < 0) || (da < 0 && db > 0)) {
            intersections.push(intersectEdge(a, b, da, db));
        }
        if ((db > 0 && dc < 0) || (db < 0 && dc > 0)) {
            intersections.push(intersectEdge(b, c, db, dc));
        }
        if ((dc > 0 && da < 0) || (dc < 0 && da > 0)) {
            intersections.push(intersectEdge(c, a, dc, da));
        }

        if (intersections.length === 2) {
            points.push(intersections[0], intersections[1]);
        }
    };

    if (index) {
        for (let i = 0; i < index.count; i += 3) {
            const a = getVertex(index.getX(i));
            const b = getVertex(index.getX(i + 1));
            const c = getVertex(index.getX(i + 2));
            processTriangle(a, b, c);
        }
    } else {
        for (let i = 0; i < pos.count; i += 3) {
            const a = getVertex(i);
            const b = getVertex(i + 1);
            const c = getVertex(i + 2);
            processTriangle(a, b, c);
        }
    }

    const outlineGeometry = new THREE.BufferGeometry().setFromPoints(points);

   
    const outlineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        depthTest: false
    });

    return new THREE.LineSegments(outlineGeometry, outlineMaterial);
}

// --- NEW: Rebuild full slice outline for all meshes in model ---
function updateSliceOutline(root, plane) {
    if (!root) return;

    if (sliceOutline) {
        scene.remove(sliceOutline);
        sliceOutline.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
        sliceOutline = null;
    }

    const group = new THREE.Group();

    root.updateWorldMatrix(true, true);

    root.traverse((child) => {
        if (child.isMesh && child.geometry) {
            child.updateWorldMatrix(true, false);
            const outline = createSliceOutlineForMesh(child, plane);
            group.add(outline);
        }
    });

    sliceOutline = group;
    scene.add(sliceOutline);
}

// Load heart
const loader = new GLTFLoader();
loader.load('./Heart_Insideinteration2.gltf', (gltf) => {
    const mesh = gltf.scene;
    heartRoot = mesh;

    mesh.position.set(-3.5, -39, 0);
    mesh.scale.set(60, 60, 60);

    mesh.traverse((child) => {
        if (child.isMesh) {
            child.material.clippingPlanes = [localPlane];
            child.material.clipShadows = true;
            child.material.side = THREE.DoubleSide;

            // Optional: make heart easier to see
            if (child.material.color) {
                child.material.color.set(0xaa3333);
            }
        }
    });

    scene.add(mesh);

    // --- NEW: Draw first slice outline immediately ---
    updateSliceOutline(heartRoot, localPlane);
});

// Slider
const slider = document.getElementById('sliceSlider');
if (slider) {
    slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);

        localPlane.constant = val;
        sliceIndicator.position.y = val;

        // --- NEW: Update real slice border ---
        if (heartRoot) {
            updateSliceOutline(heartRoot, localPlane);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();