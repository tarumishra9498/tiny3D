import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Import all of the neccessary libraries

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.outputColorSpace = THREE.SRGBColorSpace;

//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(800, 800);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,1,1000);
//camera.position.set(4, 5, 11);
camera.position.set(0, 10, 50);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

//camera.position.set(4,5,11);
//camera.lookAt(0,0,0);

const groundGeometry = new THREE.PlaneGeometry(20,20,32,32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide
});
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff,3,100,0.2,0.5);
spotLight.position.set(0,25,0);
scene.add(spotLight);

const loader = new GLTFLoader().setPath()
loader.load( './Heart_Insideinteration2.gltf', (gltf) => {
    const mesh = gltf.scene;
    mesh.position.set(-3.5, -39, 0);
    //mesh.position.set(0,1.05,-1);
    mesh.scale.set(60, 60, 60); // or try 1,1,1 or 10,10,10
    scene.add(mesh);
    console.log("Model loaded successfully!", mesh);
    }, 
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, 
    (error) => {
        console.error('An error happened:', error);
});

//loader.load('/Users/tarumishra/test_website/Heart_Insideinteration2.glb', (gltf) => {
//   scene.add(gltf.scene);
// });

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();


