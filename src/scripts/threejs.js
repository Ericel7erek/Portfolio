import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(300, 400);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Set up ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);
camera.position.z = 4;
camera.position.y = -1.5;
camera.position.x = 0;

// Add controls
new OrbitControls(camera, renderer.domElement);

// Set up GLTFLoader with DRACOLoader
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);

let model, mixer, boxingAction, hoverText, boxingAnimation, waveAnimation, waveAction;
let clock = new THREE.Clock();

async function loadModel() {
    return new Promise((resolve, reject) => {
        loader.load(
            new URL('../../static/model/Avatarismo.glb', import.meta.url).toString(),
            (gltf) => {
                model = gltf.scene;
                model.scale.setScalar(5);
                model.position.y = -9;
                
                mixer = new THREE.AnimationMixer(model);

                boxingAnimation = gltf.animations[0];
				waveAnimation = gltf.animations[1]

                if (boxingAnimation&& waveAnimation) {
                    boxingAction = mixer.clipAction(boxingAnimation);
                    waveAction = mixer.clipAction(waveAnimation);
                    boxingAction.play();
                }
                
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

async function loadFont() {
    return new Promise((resolve, reject) => {
        const fontLoader = new FontLoader();
        fontLoader.load(
            'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
                const textGeometry = new TextGeometry('Hover me', {
                    font: font,
                    size: 0.5,
                    height: 0.2,
                });
                const textMaterial = new THREE.MeshBasicMaterial({ color: 0xfffffff });
                hoverText = new THREE.Mesh(textGeometry, textMaterial);
                hoverText.position.set(-1.5, 1, 0); // Position above the model
                hoverText.rotation.set(.5, 0, 0); // Position above the model
                scene.add(hoverText);
                resolve();
            },
            undefined,
            (error) => {
                console.error(error);
                reject(error); // Reject the promise if font loading fails
            }
        );
    });
}

async function init() {
    await loadModel(); // Wait until the model and animations are loaded
    await loadFont();  // Wait until the font and text are loaded
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
        // If intersecting, fade from boxing to waving
        if (boxingAction.isRunning() && !waveAction.isRunning()) {
            waveAction.reset().play();
            waveAction.crossFadeFrom(boxingAction, 0.2, true);
        }
    } else {
        // If not intersecting, fade from waving to boxing
        if (waveAction.isRunning() && !boxingAction.isRunning()) {
            boxingAction.reset().play();
            boxingAction.crossFadeFrom(waveAction, 0.2, true);
        }
    }

    // Update the mixer for any active animation
    mixer.update(dt);
    renderer.render(scene, camera);
}



init().catch((error) => {
    console.error("Initialization failed:", error);
});
