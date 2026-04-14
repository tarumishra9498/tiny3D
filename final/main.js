import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/* ---------------- TAB ELEMENTS ---------------- */
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

const MODEL_PATH = './Heart_Insideinteration2.gltf';
const viewerIds = ['viewer2']; /*removing the viewer5 from here and making a separate viewer push for it*/
const viewerIsSlice = 'viewer5'
const viewerIsAnatomy = 'viewer6'
const viewers = [];


/*Create GLB Heart Viewer for the Segmented Heart*/
function createHeartViewerGLB(container,modelPath) {

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      1000
    );
    camera.position.set(0, 1, 4);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    
    // Reflection environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMap = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.5, 0);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight1.position.set(5, 10, 7);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);
    
    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight3.position.set(0, -3, 5);
    scene.add(directionalLight3);
    
    // Load GLB
    const loader = new GLTFLoader();
    
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
    
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.castShadow = false;
            child.receiveShadow = false;
            child.material.side = THREE.DoubleSide;
    
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
    
            materials.forEach((material) => {
              if ("roughness" in material) {
                material.roughness = 0.35;
              }
    
              if ("metalness" in material) {
                material.metalness = 0.05;
              }
    
              if ("envMapIntensity" in material) {
                material.envMapIntensity = 1.1;
              }
    
              material.needsUpdate = true;
            });
          }
        });
    
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
    
        model.position.x -= center.x;
        model.position.y -= center.y;
        model.position.z -= center.z;
    
        scene.add(model);
    
        // Fit camera to model
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (camera.fov * Math.PI) / 180;
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.8;
    
        camera.position.set(0, maxDim * 0.3, cameraZ);
        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    
    // Resize
    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    
    animate();
    return viewer;
}
/*Actually create the segmented heart 1 GLB */

const viewer_1 = createHeartViewerGLB(document.getElementById("viewer1"),"UpdatedSegment2.glb");
viewers.push(viewer_1);
/*const container = document.getElementById("viewer1");
const viewer = createHeartViewer(container, "./segmented1.gltf");
viewers.push(viewer);*/

/* ---------------- CREATE WELCOME PAGE for Viewer 7---------------- */
function createHeartViewerWELCOME(container, modelPath) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 10, 50);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 5.0; // Positive for clockwise, negative for counter-clockwise
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 80;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.5;
    //controls.autoRotate = false;
    controls.target.set(0, 1, 0);
    controls.update();

    /*const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        side: THREE.DoubleSide
    });

    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(groundMesh);*/

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
    frontLight.position.set(10, 20, 10);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-10, 15, -10);
    scene.add(backLight);


    /*const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomLight.position.set(0, -20, 0);
    scene.add(bottomLight); REMOVING BOTTOM FOR WELCOM BUT KEEP FOR OTHER!*/
    /*const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);*/

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const mesh = gltf.scene;
            mesh.position.set(-4.0, -3, 0);
            mesh.scale.set(12, 12, 12);
            scene.add(mesh);
            console.log(`Model loaded successfully in ${container.id}`, mesh);
        },
        (xhr) => {
            if (xhr.total) {
                console.log(
                    `${container.id}: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`
                );
            }
        },
        (error) => {
            console.error(`Error loading model in ${container.id}:`, error);
        }
    );

    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    return viewer;
}

//Push the welcome viewer for number 7
const container_7 = document.getElementById('viewer7');
const viewer_7 = createHeartViewerWELCOME(container_7, "babywitheheart.glb");
viewers.push(viewer_7);



/* ---------------- CREATE ABOUT US PAGE ---------------- */


/* ---------------- CREATE Ventricular Septal Defect (VSD) VIEWERS 4---------------- */
/*const container_4 = document.getElementById('viewer3');
const viewer_4 = createHeartViewer(container_4, '.vsd/Heart_Insideasd.gltf');
viewers.push(viewer_4);*/

function createHeartViewer2(container, modelPath) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    // LOWER NEAR CLIP EVEN MORE
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 2000);
    camera.position.set(0, 8, 0);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    //  ALLOW FULL ZOOM
    controls.minDistance = 0;
    controls.maxDistance = 200;

    controls.minPolarAngle = 0;           // look from directly above
    controls.maxPolarAngle = Math.PI;     // look from directly below
    controls.autoRotate = false;

    // TEMP target (will update after model loads)
    controls.target.set(0, 0, 0);
    controls.update();

    // Lights (unchanged)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
    frontLight.position.set(10, 20, 10);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-10, 15, -10);
    scene.add(backLight);

    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomLight.position.set(0, -20, 0);
    scene.add(bottomLight);

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const mesh = gltf.scene;

            // KEEP YOUR ORIGINAL POSITIONING
            mesh.position.set(-14, -170.5, 0);
            mesh.scale.set(250, 250, 250);

            scene.add(mesh);

            //  CRITICAL FIX: aim zoom at model center WITHOUT moving it
            const box = new THREE.Box3().setFromObject(mesh);
            const center = box.getCenter(new THREE.Vector3());

            controls.target.copy(center);
            controls.update();

            console.log(`Model loaded successfully in ${container.id}`, mesh);
        },
        (xhr) => {
            if (xhr.total) {
                console.log(
                    `${container.id}: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`
                );
            }
        },
        (error) => {
            console.error(`Error loading model in ${container.id}:`, error);
        }
    );

    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    function animate() {
        requestAnimationFrame(animate);

        //  prevents jitter when extremely close
        if (controls.enableDamping) controls.update();

        renderer.render(scene, camera);
    }

    animate();

    return viewer;
}

/* ---------------- CREATE ALL NORMAL HEART VIEWERS (Heart, Full Segment) (except 5 and 6)---------------- */
viewerIds.forEach((viewerId) => {
    const container = document.getElementById(viewerId);
    const viewer = createHeartViewer(container, MODEL_PATH);
    viewers.push(viewer);
});

/*ANATOMY ONE AT BOTTOM*/
const container = document.getElementById("viewer16");
const viewer = createHeartViewer2(container, "./plsdontdeleteforrendering.gltf");
viewers.push(viewer);


/* ---------------- CREATE Atrial Septal Defect (ASD) VIEWERS 3---------------- */
const container_3 = document.getElementById('viewer3');
const viewer_3 = createASDHeartViewer(container_3, './Heart_Insideasd.gltf');
viewers.push(viewer_3); 

const viewer_11 = createHeartViewerGLB(document.getElementById('viewer11'),"vsdNew.glb");
viewers.push(viewer_11);
//Top one (With segmented model)


/* ---------------- CREATE Ventricular Septal Defect (VSD) VIEWERS 4---------------- */
const container_4 = document.getElementById('viewer4');
const viewer_4 = createASDHeartViewer(container_4, './Heart_Insidevsd.gltf');
viewers.push(viewer_4); 

const viewer_10 = createHeartViewerGLB(document.getElementById('viewer10'),"vsdNew.glb");
viewers.push(viewer_10);

/* ---------------- CREATE other Septal Defect (VSD) VIEWERS 4---------------- */
const container_9 = document.getElementById('viewer9');
const viewer_9 = createASDHeartViewer(container_9, './Heart_Insidetof.gltf');
viewers.push(viewer_9);

const viewer_12 = createHeartViewerGLB(document.getElementById('viewer12'),"vsdNew.glb");
viewers.push(viewer_12);



/* ---------------- CREATE ANATOMY VIEWER 6 ---------------- */
//const container_6 = document.getElementById(viewerIsAnatomy)
const viewer_6 = create2DViewer() //Assuming that we use the same model path as we previously did
viewers.push(viewer_6)


/* ---------------- TAB SWITCHING ---------------- */
tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetTabId = button.dataset.tab;

        tabButtons.forEach((btn) => btn.classList.remove('active'));
        tabPanels.forEach((panel) => panel.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(targetTabId).classList.add('active');
        
        if (targetTabId === "tab7") {
            document.body.classList.add("welcome-active");
            document.body.classList.remove("main-active");
        } else {
            document.body.classList.remove("welcome-active");
            document.body.classList.add("main-active");
        }

        setTimeout(() => {
            viewers.forEach((viewer) => resizeViewer(viewer));
        }, 0);
    });
});

/* ---------------- ANATOMY VIEWER CREATION ---------------- */
function create2DViewer() {
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const hexValue = document.getElementById("hexValue");
    const rgbValue = document.getElementById("rgbValue");
    const colorPreview = document.getElementById("colorPreview");
    const concreteColor = document.getElementById("concreteColor");
    const featureLabel = document.getElementById("featureLabel");

    const img = new Image();
    img.src = "newshot.png"; // Replace with your PNG filename

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    };

    const colors = [
        ["black", [0, 0, 0]],
        ["silver", [192, 192, 192]],
        ["gray", [128, 128, 128]],
        ["white", [255, 255, 255]],
        ["maroon", [128, 0, 0]],
        ["red", [255, 0, 0]],
        ["purple", [128, 0, 128]],
        ["fuchsia", [255, 0, 255]],
        ["green", [0, 128, 0]],
        ["lime", [0, 255, 0]],
        ["olive", [128, 128, 0]],
        ["yellow", [255, 200, 0]],
        ["navy", [0, 0, 128]],
        ["blue", [0, 0, 255]],
        ["teal", [0, 128, 128]],
        ["aqua", [0, 255, 255]],
        ["brown", [165, 42, 42]],
        ["orange", [255, 145, 0]],
        ["pink", [255, 192, 203]]
    ];
//Tim Roberts stack overflow source
//https://stackoverflow.com/a/70735754
    function distance(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    function findClosest(pixel) {
        let minDistance = Infinity;
        let closestColor = null;

        for (const [name, rgb] of colors) {
            const d = distance(pixel, rgb);
            if (d < minDistance) {
                minDistance = d;
                closestColor = name;
            }
        }

        return closestColor;
    }

    function getFeatureFromColor(colorName) {
        const featureMap = {
            red: "Aorta",
            maroon: "Pulmonary artery",
            brown: "Pulmonary artery",
            fuchsia: "Right atrium",
            pink: "Right atrium",
            blue: "Right ventricle",
            green: "Left ventricle",
            lime: "Left ventricle",
            orange: "Left atrium",
            yellow: "Pulmonary veins",
            purple: "Superior vena cava",
            gray: "Superior vena cava"
        };

        return featureMap[colorName] || "";
    }

    canvas.addEventListener("click", (event) => {
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = Math.floor((event.clientX - rect.left) * scaleX);
        const y = Math.floor((event.clientY - rect.top) * scaleY);

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const [r, g, b, a] = pixel;

        const hex = rgbToHex(r, g, b);
        const closestColor = findClosest([r, g, b]);
        const feature = getFeatureFromColor(closestColor);

        hexValue.textContent = hex;
        rgbValue.textContent = `rgb(${r}, ${g}, ${b})`;
        concreteColor.textContent = closestColor;
        featureLabel.textContent = `${feature}`;

        colorPreview.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    });

    function rgbToHex(r, g, b) {
        return (
            "#" +
            [r, g, b]
                .map((value) => value.toString(16).padStart(2, "0"))
                .join("")
                .toUpperCase()
        );
    }
}

/* ---------------- NORMAL VIEWER CREATION ---------------- */
function createHeartViewer(container, modelPath) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    // LOWER NEAR CLIP EVEN MORE
    const camera = new THREE.PerspectiveCamera(50, 1, 0.001, 2000);
    camera.position.set(0, 10, 50);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;

    //  ALLOW FULL ZOOM
    controls.minDistance = 0;
    controls.maxDistance = 200;

    controls.minPolarAngle = 0;           // look from directly above
    controls.maxPolarAngle = Math.PI;     // look from directly below
    controls.autoRotate = false;

    // TEMP target (will update after model loads)
    controls.target.set(0, 0, 0);
    controls.update();

    // Lights (unchanged)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
    frontLight.position.set(10, 20, 10);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-10, 15, -10);
    scene.add(backLight);

    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomLight.position.set(0, -20, 0);
    scene.add(bottomLight);

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const mesh = gltf.scene;

            // KEEP YOUR ORIGINAL POSITIONING
            mesh.position.set(-14, -170.5, 0);
            mesh.scale.set(240, 240, 240);

            scene.add(mesh);

            // 🔥 CRITICAL FIX: aim zoom at model center WITHOUT moving it
            const box = new THREE.Box3().setFromObject(mesh);
            const center = box.getCenter(new THREE.Vector3());

            controls.target.copy(center);
            controls.update();

            console.log(`Model loaded successfully in ${container.id}`, mesh);
        },
        (xhr) => {
            if (xhr.total) {
                console.log(
                    `${container.id}: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`
                );
            }
        },
        (error) => {
            console.error(`Error loading model in ${container.id}:`, error);
        }
    );

    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    function animate() {
        requestAnimationFrame(animate);

        //  prevents jitter when extremely close
        if (controls.enableDamping) controls.update();

        renderer.render(scene, camera);
    }

    animate();

    return viewer;
}

/* ---------------- ASD HEART VIEWER CREATION ---------------- */
function createASDHeartViewer(container, modelPath) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.set(0, 10, 50);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 80;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.5;
    controls.autoRotate = false;
    controls.target.set(0, 1, 0);
    controls.update();

    /*const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    groundGeometry.rotateX(-Math.PI / 2);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        side: THREE.DoubleSide
    });

    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(groundMesh);*/

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, 1.3);
    frontLight.position.set(10, 20, 10);
    scene.add(frontLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-10, 15, -10);
    scene.add(backLight);

    /*const bottomLight = new THREE.DirectionalLight(0xffffff, 0.8);
    bottomLight.position.set(0, -20, 0);
    scene.add(bottomLight); REMOVING BOTTOM FOR WELCOM BUT KEEP FOR OTHER!*/

    const loader = new GLTFLoader();

    loader.load(
        modelPath,
        (gltf) => {
            const mesh = gltf.scene;
            mesh.position.set(-.5, -155.5, 0);
            mesh.scale.set(240, 240, 240);
            scene.add(mesh);
            console.log(`Model loaded successfully in ${container.id}`, mesh);
        },
        (xhr) => {
            if (xhr.total) {
                console.log(
                    `${container.id}: ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`
                );
            }
        },
        (error) => {
            console.error(`Error loading model in ${container.id}:`, error);
        }
    );

    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    return viewer;
}

/* ---------------- SLICER VIEWER CREATION ---------------- */
function createSlicerViewer(container, slider, modelPath) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(800, 800);
    renderer.setClearColor(0x000000);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.localClippingEnabled = true;

    container.appendChild(renderer.domElement);

    const btnApical = document.getElementById('btn-apical');
    const btnThreeVessel = document.getElementById('btn-three-vessel');
    const btnRvot = document.getElementById('btn-rvot');
    const btnLvot = document.getElementById('btn-lvot');

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 2000);
    camera.position.set(0, 10, 50);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 300;
    controls.target.set(0, 1, 0);
    controls.update();

    // Clipping plane
    const localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const initialSliceValue = parseFloat(slider.value);
    localPlane.constant = initialSliceValue;

    // Slice indicator
    const sliceGeo = new THREE.PlaneGeometry(20, 20);
    sliceGeo.rotateX(-Math.PI / 2);
    const sliceMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    const sliceIndicator = new THREE.Mesh(sliceGeo, sliceMat);
    sliceIndicator.position.y = initialSliceValue;
    scene.add(sliceIndicator);

    // Ground mesh
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    scene.add(groundMesh);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);

    let heartRoot = null;
    let sliceOutline = null;
    let sliceSurface = null;

    function createSliceOutlineForMesh(mesh, plane) {
        const geom = mesh.geometry.clone();
        mesh.updateWorldMatrix(true, false);
        geom.applyMatrix4(mesh.matrixWorld);

        const pos = geom.attributes.position;
        const index = geom.index;

        const segmentGroup = new THREE.Group();

        const getVertex = (i) =>
            new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));

        const intersectEdge = (a, b, da, db) =>
            new THREE.Vector3().lerpVectors(a, b, da / (da - db));

        const makeTubeBetweenPoints = (p1, p2) => {
            const direction = new THREE.Vector3().subVectors(p2, p1);
            const length = direction.length();
            if (length < 0.001) return;

            const radius = 0.1;
            const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0x000000,
                depthTest: false
            });

            const cylinder = new THREE.Mesh(geometry, material);

            const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            cylinder.position.copy(midpoint);

            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
            );

            segmentGroup.add(cylinder);
        };

        const processTriangle = (a, b, c) => {
            const da = plane.distanceToPoint(a);
            const db = plane.distanceToPoint(b);
            const dc = plane.distanceToPoint(c);

            const intersections = [];
            if ((da > 0 && db < 0) || (da < 0 && db > 0)) intersections.push(intersectEdge(a, b, da, db));
            if ((db > 0 && dc < 0) || (db < 0 && dc > 0)) intersections.push(intersectEdge(b, c, db, dc));
            if ((dc > 0 && da < 0) || (dc < 0 && da > 0)) intersections.push(intersectEdge(c, a, dc, da));

            if (intersections.length === 2) {
                makeTubeBetweenPoints(intersections[0], intersections[1]);
            }
        };

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                processTriangle(
                    getVertex(index.getX(i)),
                    getVertex(index.getX(i + 1)),
                    getVertex(index.getX(i + 2))
                );
            }
        } else {
            for (let i = 0; i < pos.count; i += 3) {
                processTriangle(getVertex(i), getVertex(i + 1), getVertex(i + 2));
            }
        }

        return segmentGroup;
    }

    function createSliceSurfaceForMesh(mesh, plane) {
        const geom = mesh.geometry.clone();
        mesh.updateWorldMatrix(true, false);
        geom.applyMatrix4(mesh.matrixWorld);

        const pos = geom.attributes.position;
        const index = geom.index;
        const surfacePoints = [];

        const getVertex = (i) =>
            new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));

        const intersectEdge = (a, b, da, db) =>
            new THREE.Vector3().lerpVectors(a, b, da / (da - db));

        const processTriangle = (a, b, c) => {
            const da = plane.distanceToPoint(a);
            const db = plane.distanceToPoint(b);
            const dc = plane.distanceToPoint(c);

            const intersections = [];
            if ((da > 0 && db < 0) || (da < 0 && db > 0)) intersections.push(intersectEdge(a, b, da, db));
            if ((db > 0 && dc < 0) || (db < 0 && dc > 0)) intersections.push(intersectEdge(b, c, db, dc));
            if ((dc > 0 && da < 0) || (dc < 0 && da > 0)) intersections.push(intersectEdge(c, a, dc, da));

            if (intersections.length === 2) {
                surfacePoints.push(
                    intersections[0],
                    intersections[1],
                    intersections[0].clone().lerp(intersections[1], 0.5)
                );
            }
        };

        if (index) {
            for (let i = 0; i < index.count; i += 3) {
                processTriangle(
                    getVertex(index.getX(i)),
                    getVertex(index.getX(i + 1)),
                    getVertex(index.getX(i + 2))
                );
            }
        } else {
            for (let i = 0; i < pos.count; i += 3) {
                processTriangle(getVertex(i), getVertex(i + 1), getVertex(i + 2));
            }
        }

        if (surfacePoints.length === 0) return null;

        const surfaceGeom = new THREE.BufferGeometry().setFromPoints(surfacePoints);
        surfaceGeom.computeVertexNormals();

        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide,
            depthTest: false
        });

        return new THREE.Mesh(surfaceGeom, material);
    }

    function updateSliceVisualization(root, plane) {
        if (!root) return;

        if (sliceOutline) {
            scene.remove(sliceOutline);
            sliceOutline.traverse((c) => {
                if (c.geometry) c.geometry.dispose();
                if (c.material) c.material.dispose();
            });
            sliceOutline = null;
        }

        if (sliceSurface) {
            scene.remove(sliceSurface);
            sliceSurface.traverse((c) => {
                if (c.geometry) c.geometry.dispose();
                if (c.material) c.material.dispose();
            });
            sliceSurface = null;
        }

        const outlineGroup = new THREE.Group();
        const surfaceGroup = new THREE.Group();

        root.updateWorldMatrix(true, true);

        root.traverse((child) => {
            if (child.isMesh && child.geometry) {
                outlineGroup.add(createSliceOutlineForMesh(child, plane));
                const surf = createSliceSurfaceForMesh(child, plane);
                if (surf) surfaceGroup.add(surf);
            }
        });

        sliceOutline = outlineGroup;
        sliceSurface = surfaceGroup;

        scene.add(sliceOutline);
        scene.add(sliceSurface);
    }

    function setNamedHeartView(camera, controls, model, direction, fit = 1.8) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        const fov = THREE.MathUtils.degToRad(camera.fov);
        let distance = (maxDim / 2) / Math.tan(fov / 2);
        distance *= fit;

        const pos = center.clone().add(
            direction.clone().normalize().multiplyScalar(distance)
        );

        camera.position.copy(pos);
        camera.near = Math.max(0.01, maxDim / 500);
        camera.far = Math.max(1000, maxDim * 20);
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.update();
    }

    function setApical() {
        if (!heartRoot) return;
        setNamedHeartView(camera, controls, heartRoot, new THREE.Vector3(0, 0.15, -1), 1.7);
    }

    function setThreeVessel() {
        if (!heartRoot) return;
        setNamedHeartView(camera, controls, heartRoot, new THREE.Vector3(0, 0.9, -1), 1.9);
    }

    function setRVOT() {
        if (!heartRoot) return;
        setNamedHeartView(camera, controls, heartRoot, new THREE.Vector3(1, 0.45, -0.55), 1.8);
    }

    function setLVOT() {
        if (!heartRoot) return;
        setNamedHeartView(camera, controls, heartRoot, new THREE.Vector3(-1, 0.45, -0.55), 1.8);
    }

    const loader = new GLTFLoader();

    loader.load(modelPath, (gltf) => {
        const model = gltf.scene;
        heartRoot = model;

        model.position.set(0, 4.5, 0);
        model.scale.set(60, 60, 60);

        model.traverse((child) => {
            if (child.isMesh && child.material) {
                child.castShadow = false;
                child.receiveShadow = false;

                const materials = Array.isArray(child.material)
                    ? child.material
                    : [child.material];

                materials.forEach((material) => {
                    material.side = THREE.DoubleSide;
                    material.clippingPlanes = [localPlane];
                    material.clipShadows = true;

                    if ("roughness" in material) material.roughness = 0.28;
                    if ("metalness" in material) material.metalness = 0.05;
                    if ("envMapIntensity" in material) material.envMapIntensity = 1.4;

                    material.needsUpdate = true;
                });
            }
        });

        scene.add(model);

        updateSliceVisualization(heartRoot, localPlane);

        setNamedHeartView(camera, controls, model, new THREE.Vector3(0, 0.2, -1), 1.8);

        if (btnApical) btnApical.addEventListener("click", setApical);
        if (btnThreeVessel) btnThreeVessel.addEventListener("click", setThreeVessel);
        if (btnRvot) btnRvot.addEventListener("click", setRVOT);
        if (btnLvot) btnLvot.addEventListener("click", setLVOT);
    });

    if (slider) {
        slider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            localPlane.constant = val;
            sliceIndicator.position.y = val;

            if (heartRoot) {
                updateSliceVisualization(heartRoot, localPlane);
            }
        });
    }

    const viewer = { container, scene, camera, renderer, controls };
    resizeViewer(viewer);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
    return viewer;
}
/* ---------------- Code for Orienting Buttons ---------------- */
// Camera positioning functions for specific views

function setNamedHeartView(camera, controls, currentModel, direction, fitMultiplier = 1.8) {
    if (!currentModel) {
      console.log("No model loaded yet");
      return;
    }
  
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
  
    const fov = THREE.MathUtils.degToRad(camera.fov);
    let distance = (maxDim * 0.5) / Math.tan(fov * 0.5);
    distance *= fitMultiplier;
  
    const dir = direction.clone().normalize();
    const newPos = center.clone().add(dir.multiplyScalar(distance));
  
    camera.position.copy(newPos);
    camera.near = Math.max(0.01, maxDim / 500);
    camera.far = Math.max(1000, maxDim * 20);
    camera.updateProjectionMatrix();
  
    controls.target.copy(center);
    controls.update();
  }
  
  function setApicalFourChamberView(camera, controls, currentModel) {
    console.log("Setting Four Chamber View");
    setNamedHeartView(
      camera,
      controls,
      currentModel,
      new THREE.Vector3(0, 0.15, -1),
      1.7
    );
  }
  
  function setThreeVesselView(camera, controls, currentModel) {
    console.log("Setting Three Vessel View");
    setNamedHeartView(
      camera,
      controls,
      currentModel,
      new THREE.Vector3(0, 0.9, -1),
      1.9
    );
  }
  
  function setRVOTView(camera, controls, currentModel) {
    console.log("Setting Right Ventricular Outflow Tract View");
    setNamedHeartView(
      camera,
      controls,
      currentModel,
      new THREE.Vector3(1, 0.45, -0.55),
      1.8
    );
  }
  
  function setLVOTView(camera, controls, currentModel) {
    console.log("Setting Left Ventricular Outflow Tract View");
    setNamedHeartView(
      camera,
      controls,
      currentModel,
      new THREE.Vector3(-1, 0.45, -0.55),
      1.8
    );
  }

  /* ---------------- CREATE SLICER VIEWERS 5---------------- */
const slider = document.getElementById('sliceSlider'); //Constant reference to the slicer
const container_5 = document.getElementById(viewerIsSlice)
const viewer_5 = createSlicerViewer(container_5, slider, "updatedForamen.glb") //Assuming that we use the same model path as we previously did
viewers.push(viewer_5)


/* ---------------- RESIZE HELPER ---------------- */
function resizeViewer(viewer) {
    const { container, camera, renderer } = viewer;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

/* ---------------- WINDOW RESIZE ---------------- */
window.addEventListener('resize', () => {
    viewers.forEach((viewer) => resizeViewer(viewer));
});

/* ---------------- INITIAL POST-LAYOUT FIX ---------------- */
window.addEventListener('load', () => {
    if (document.getElementById("tab7").classList.contains("active")) {
        document.body.classList.add("welcome-active");
    } else {
        document.body.classList.add("main-active");
    }
});

// Set correct state on initial load
if (document.getElementById("tab7").classList.contains("active")) {
    document.body.classList.add("welcome-active");
}