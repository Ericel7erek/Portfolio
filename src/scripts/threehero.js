import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const canvas = document.getElementById('three');
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Set up ambient light
// const ambientLight = new THREE.AmbientLight(0xffffff, 99);
// scene.add(ambientLight);
camera.position.z = 100
camera.position.x = 400
camera.position.y = 400
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5, 5, 5);
scene.add(light)

// Add controls
new OrbitControls(camera, renderer.domElement);

// Set up GLTFLoader with DRACOLoader
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

let model
let clock = new THREE.Clock();

async function loadModel() {
    return new Promise((resolve, reject) => {
        loader.load(
            new URL('../../static/model/MacbookPro.glb', import.meta.url).toString(),
            (gltf) => {
                console.log(gltf);
                
                model = gltf.scene;
                model.scale.setScalar(5);
                model.position.y = -9;

                scene.add(model);
                resolve(); // Resolve the promise after the model and animations are set up
            },
            undefined,
            (error) => {
                console.error(error);
                reject(error); // Reject the promise if loading fails
            }
        );
    });
}


async function init() {
    await loadModel(); // Wait until the model and animations are loaded
    
    renderer.setAnimationLoop(animate); // Start the animation loop after everything is set up
}

// Initialize raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Calculate normalized device coordinates for the mouse relative to the canvas
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

window.addEventListener('mousemove', onMouseMove);

function animate() {
    const dt = clock.getDelta();

    // Update the raycaster based on the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if the raycaster intersects with the model
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
        
    } else {

    }
    model.rotation.y +=0.001
    // Update the mixer for any active animation
    renderer.render(scene, camera);
}



init().catch((error) => {
    console.error("Initialization failed:", error);
});
