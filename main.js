import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './environments/RoomEnvironment.js';

let scene, camera, renderer, controls;

let trashcan; 
let velocity = 0;
let direction = 0;

let keysPressed = {
    W: false,
    A: false,
    S: false,
    D: false
  };
  
init();

// keyboard controls for trashcan
window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
        velocity = 0.02;
        keysPressed.W = true;
        break;
      case 's':
        velocity = -0.02;
        keysPressed.S = true;
        break;
      case 'a':
        direction = 0.03;
        keysPressed.A = true;
        break;
      case 'd':
        direction = -0.03;
        keysPressed.D = true;
        break;
    }
  });
  
  window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
        keysPressed.W = false;
        velocity = 0;
        break;
      case 's':
        keysPressed.S = false;
        velocity = 0;
        break;
      case 'a':
        keysPressed.A = false;
        direction = 0;
        break;
      case 'd':
        keysPressed.D = false;
        direction = 0;
        break;
    }
  });
  

async function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(5, 4, 7);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // PMREM + Room Environment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envMap = pmremGenerator.fromScene(roomEnv).texture;
  scene.environment = envMap;

  // Optional: background color
  scene.background = new THREE.Color(0xbfd1e5);

  // Load trashcan model
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync('/models/trashcan.glb');
  trashcan = gltf.scene;
  trashcan.scale.set(0.01, 0.01, 0.01); // scale down if needed
  trashcan.position.set(0, 0, 0);
  scene.add(trashcan);

  const gui = new GUI();
gui.title('Trashcan Simulation');

const trashcanFolder = gui.addFolder('Trashcan Controls');
trashcanFolder.add(keysPressed, 'W').listen();
trashcanFolder.add(keysPressed, 'A').listen();
trashcanFolder.add(keysPressed, 'S').listen();
trashcanFolder.add(keysPressed, 'D').listen();
trashcanFolder.close(); // Start collapsed (optional)

  animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
  
    if (trashcan) {
      // Turn the trashcan
      trashcan.rotation.y += direction;
  
      // Move forward/backward in the direction it's facing
      const angle = trashcan.rotation.y;
      trashcan.position.x += Math.sin(angle) * velocity;
      trashcan.position.z += Math.cos(angle) * velocity;
    }
    
  
    renderer.render(scene, camera);
  }
  