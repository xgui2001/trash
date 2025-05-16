import * as THREE from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './environments/RoomEnvironment.js';

let scene, camera, renderer, controls;

// Models
let trashcan;
let table;
let humans = []; // Array to hold all 4 humans

// Movement variables
let trashcanVelocity = 0;
let trashcanDirection = 0;
const humanVelocities = [0, 0, 0, 0];
const humanDirections = [0, 0, 0, 0];

// Control states
let activeModelIndex = -1; // -1 for trashcan, 0-3 for humans
let controlsObj = { 
  activeModel: 'Trashcan',
  showAxes: true
};

let keysPressed = {
  W: false,
  A: false,
  S: false,
  D: false
};

// Axis helpers
let axesHelper;
let axisElements = []; // Array to store all axis-related elements

init();

// Keyboard controls
window.addEventListener('keydown', (e) => {
  // Handle number keys 1-5 to switch active model
  if (e.key >= '1' && e.key <= '5') {
    const newIndex = parseInt(e.key) - 1;
    // 0-3 for humans, 4 for trashcan
    setActiveModel(newIndex === 4 ? -1 : newIndex);
    return;
  }
  
  switch (e.key.toLowerCase()) {
    case 'w':
      keysPressed.W = true;
      if (activeModelIndex === -1) {
        trashcanVelocity = 0.02;
      } else {
        humanVelocities[activeModelIndex] = 0.02;
      }
      break;
    case 's':
      keysPressed.S = true;
      if (activeModelIndex === -1) {
        trashcanVelocity = -0.02;
      } else {
        humanVelocities[activeModelIndex] = -0.02;
      }
      break;
    case 'a':
      keysPressed.A = true;
      if (activeModelIndex === -1) {
        trashcanDirection = 0.03;
      } else {
        humanDirections[activeModelIndex] = 0.03;
      }
      break;
    case 'd':
      keysPressed.D = true;
      if (activeModelIndex === -1) {
        trashcanDirection = -0.03;
      } else {
        humanDirections[activeModelIndex] = -0.03;
      }
      break;
    case 't': // Cycle through models
      cycleActiveModel();
      break;
    case 'x': // Toggle axes visibility
      toggleAxesVisibility();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key.toLowerCase()) {
    case 'w':
      keysPressed.W = false;
      if (activeModelIndex === -1) {
        trashcanVelocity = 0;
      } else {
        humanVelocities[activeModelIndex] = 0;
      }
      break;
    case 's':
      keysPressed.S = false;
      if (activeModelIndex === -1) {
        trashcanVelocity = 0;
      } else {
        humanVelocities[activeModelIndex] = 0;
      }
      break;
    case 'a':
      keysPressed.A = false;
      if (activeModelIndex === -1) {
        trashcanDirection = 0;
      } else {
        humanDirections[activeModelIndex] = 0;
      }
      break;
    case 'd':
      keysPressed.D = false;
      if (activeModelIndex === -1) {
        trashcanDirection = 0;
      } else {
        humanDirections[activeModelIndex] = 0;
      }
      break;
  }
});

function setActiveModel(index) {
  // Reset velocities of previous model
  if (activeModelIndex === -1) {
    trashcanVelocity = 0;
    trashcanDirection = 0;
  } else if (activeModelIndex >= 0 && activeModelIndex < 4) {
    humanVelocities[activeModelIndex] = 0;
    humanDirections[activeModelIndex] = 0;
  }
  
  // Set new active model
  activeModelIndex = index;
  
  // Update GUI display
  if (activeModelIndex === -1) {
    controlsObj.activeModel = 'Trashcan';
  } else {
    controlsObj.activeModel = `Human ${activeModelIndex + 1}`;
  }
  
  console.log(`Now controlling: ${controlsObj.activeModel}`);
}

function cycleActiveModel() {
  // Cycle through: Trashcan (-1) -> Human 1 (0) -> Human 2 (1) -> Human 3 (2) -> Human 4 (3) -> back to Trashcan (-1)
  
  // Increment the index
  activeModelIndex++;
  
  // If we've gone past Human 4 (index 3), go back to Trashcan (index -1)
  if (activeModelIndex > 3) {
    activeModelIndex = -1;
  }
  
  // Update the active model display
  if (activeModelIndex === -1) {
    controlsObj.activeModel = 'Trashcan';
  } else {
    controlsObj.activeModel = `Human ${activeModelIndex + 1}`;
  }
  
  console.log(`Now controlling: ${controlsObj.activeModel}`);
}

function toggleAxesVisibility() {
  controlsObj.showAxes = !controlsObj.showAxes;
  
  // Update visibility for all axis elements
  axisElements.forEach(element => {
    element.visible = controlsObj.showAxes;
  });
}

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

  // Add a floor
  createFloor();
  
  // Add clear axis visualization
  createAxesVisualization();

  // Load 3D models
  const loader = new GLTFLoader();
  
  // Load table first and place it at the center
  try {
    const tableModel = await loader.loadAsync('/models/nordic_table.glb');
    table = tableModel.scene;
    
    // Adjust scale for the table
    table.scale.set(0.04, 0.04, 0.04);
    
    // Ensure table is exactly at center and raised up from the ground
    table.position.set(0, 0.5, 0); // Raised to 0.5 units above ground
    
    // Make sure the table is properly centered within its own geometry horizontally
    const box = new THREE.Box3().setFromObject(table);
    const center = new THREE.Vector3();
    box.getCenter(center);
    table.position.x -= center.x;
    table.position.z -= center.z;
    // Don't adjust y to maintain the height we just set
    
    // Add table to scene
    scene.add(table);
    console.log("Table loaded successfully");
  } catch (error) {
    console.error("Error loading table model:", error);
  }
  
  // Load trashcan and place it far away
  const trashcanModel = await loader.loadAsync('/models/trashcan.glb');
  trashcan = trashcanModel.scene;
  trashcan.scale.set(0.01, 0.01, 0.01);
  
  // Position trashcan much further away
  trashcan.position.set(-6, 0, -6);
  scene.add(trashcan);
  
  // Load human models and position them around the table
  // Using a larger distance to spread them out more
  const positions = [
    { x: 0, z: 4 },   // Front of table
    { x: 0, z: -4 },  // Back of table
    { x: 4, z: 0 },   // Right of table
    { x: -4, z: 0 }   // Left of table
  ];
  
  const rotations = [
    Math.PI,        // Facing table
    0,              // Facing table
    Math.PI * 1.5,  // Facing table
    Math.PI * 0.5   // Facing table
  ];
  
  // Load each human model
  for (let i = 0; i < 4; i++) {
    try {
      const humanModel = await loader.loadAsync('/models/low_poly_human_model.glb');
      const human = humanModel.scene;
      
      // Scale the human
      human.scale.set(0.8, 0.8, 0.8);
      
      // Position around the table with increased distance
      human.position.set(positions[i].x, 0, positions[i].z);
      
      // Rotate to face the table
      human.rotation.y = rotations[i];
      
      // Add to humans array and scene
      humans[i] = human;
      scene.add(human);
      
      console.log(`Human ${i + 1} loaded successfully`);
    } catch (error) {
      console.error(`Error loading human model ${i + 1}:`, error);
    }
  }

  // Create GUI for controls
  createGUI();

  // Add a simple instruction display
  createInstructionDisplay();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);

  // Set initial active model to trashcan
  setActiveModel(-1);
  
  // Start animation loop
  animate();
}

function createFloor() {
  // Create a simple floor
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080, 
    roughness: 0.8,
    metalness: 0.2
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  floor.receiveShadow = true;
  scene.add(floor);
  
  // Add a grid helper
  const gridHelper = new THREE.GridHelper(20, 20);
  scene.add(gridHelper);
}

function createAxesVisualization() {
  // Create a prominent axes helper
  axesHelper = new THREE.AxesHelper(5); // 5 units long for better visibility
  axisElements.push(axesHelper);
  
  // Make the axes lines thicker
  const xAxis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(20, 0, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 3 })
  );
  axisElements.push(xAxis);
  
  const yAxis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 20, 0)
    ]),
    new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 })
  );
  axisElements.push(yAxis);
  
  const zAxis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 20)
    ]),
    new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 3 })
  );
  axisElements.push(zAxis);
  
  // Add text labels for the axes
  const addAxisLabel = (text, position, color) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Draw the text
    context.fillStyle = color;
    context.font = 'Bold 60px Arial';
    context.fillText(text, 70, 130);
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create a sprite material with the texture
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    
    // Create the sprite and position it
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(1, 1, 1);
    
    // Add to our axis elements array
    axisElements.push(sprite);
    
    scene.add(sprite);
  };
  
  // Add labels at the end of each axis
  addAxisLabel('X', new THREE.Vector3(5.5, 0, 0), '#ff0000');
  addAxisLabel('Y', new THREE.Vector3(0, 5.5, 0), '#00ff00');
  addAxisLabel('Z', new THREE.Vector3(0, 0, 5.5), '#0000ff');
  
  // Add the axes to the scene
  scene.add(xAxis);
  scene.add(yAxis);
  scene.add(zAxis);
  scene.add(axesHelper);
}

function createGUI() {
  const gui = new GUI();
  gui.title('Simulation Controls');

  // Add a control for active model display (read-only but not grayed out)
  const activeModelController = gui.add(controlsObj, 'activeModel').listen().name('Active Model');
  
  // Add a note about how to change models
  const modelInfo = { 
    info: 'Press T to cycle through models'
  };
  gui.add(modelInfo, 'info').name('Model Selection');
  
  // Add axes visibility toggle with proper onChange handler
  gui.add(controlsObj, 'showAxes').onChange(() => {
    // When the checkbox is toggled, update all axis elements
    axisElements.forEach(element => {
      element.visible = controlsObj.showAxes;
    });
  }).name('Show Axes (X)');
  
  // Controls folder (shows current key states)
  const controlsFolder = gui.addFolder('Movement Keys');
  controlsFolder.add(keysPressed, 'W').listen().name('Forward (W)');
  controlsFolder.add(keysPressed, 'A').listen().name('Turn Left (A)');
  controlsFolder.add(keysPressed, 'S').listen().name('Backward (S)');
  controlsFolder.add(keysPressed, 'D').listen().name('Turn Right (D)');
}

function createInstructionDisplay() {
  // Create a simple instruction display
  const instructionDiv = document.createElement('div');
  instructionDiv.style.position = 'absolute';
  instructionDiv.style.top = '10px';
  instructionDiv.style.left = '10px';
  instructionDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructionDiv.style.color = 'white';
  instructionDiv.style.padding = '10px';
  instructionDiv.style.borderRadius = '5px';
  instructionDiv.style.fontFamily = 'Arial, sans-serif';
  instructionDiv.style.fontSize = '14px';
  instructionDiv.style.pointerEvents = 'none'; // Don't interfere with clicks
  
  instructionDiv.innerHTML = `
    <h3 style="margin-top: 0;">Controls:</h3>
    <p>WASD - Move active model</p>
    <p>1-4 - Select Human 1-4</p>
    <p>5 - Select Trashcan</p>
    <p>T - Cycle through models</p>
    <p>X - Toggle axes visibility</p>
    <p>Mouse Drag - Orbit camera</p>
    <p>Mouse Wheel - Zoom</p>
  `;
  
  document.body.appendChild(instructionDiv);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Move and rotate the trashcan
  if (trashcan) {
    trashcan.rotation.y += trashcanDirection;
    
    const angle = trashcan.rotation.y;
    trashcan.position.x += Math.sin(angle) * trashcanVelocity;
    trashcan.position.z += Math.cos(angle) * trashcanVelocity;
  }
  
  // Move and rotate the humans
  humans.forEach((human, index) => {
    if (human) {
      human.rotation.y += humanDirections[index];
      
      const angle = human.rotation.y;
      human.position.x += Math.sin(angle) * humanVelocities[index];
      human.position.z += Math.cos(angle) * humanVelocities[index];
    }
  });

  renderer.render(scene, camera);
}