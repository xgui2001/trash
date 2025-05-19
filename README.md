# Trashcan Experiment Visualization
A 3D scene constructed to better visualize the trashcan experiment using Three.js.

## Demo
![Demo GIF](trashcan.gif)

## Basic Controls
- W, A, S, D - Move the active model
- T - Cycle through models
- 1-5 - Directly select specific models
- X - Toggle coordinate system visualization
- Mouse - Orbit camera and zoom

## Next Steps
### ROS Integration & Timeline Playback
- Add ability to import ROS bag files
- Parse and extract timestamped position data

### Data Annotation:
- Add ability to mark and label specific moments in the timeline
- Implement annotation storage and export functionality (?)

### Model Animation:
- Make models move according to the recorded trajectory data

### Visualization Enhancements:
- Add path visualization for movement tracking
- Display sensor data overlays if available

## Setup
1. Ensure all model files (trashcan.glb, nordic_table.glb, low_poly_human_model.glb) are in the `/models/` directory
2. Install dependencies with `npm install`
3. Run the project using `npm run dev`
