Trashcan Experiment Visualization
A 3D scene constructed to better visualize the trashcan experiment using Three.js.
Current Functionality

Interactive 3D Models: Trashcan and human figures positioned around a table
Individual Control: Switch between and control each model separately
Movement Controls: Use WASD keys to move models in the scene
Model Selection: Cycle through models using "T" key or directly select using number keys (1-4 for humans, 5 for trashcan)
Spatial Reference: Toggle X, Y, Z axes visualization for better orientation

Basic Controls

W, A, S, D - Move the active model
T - Cycle through models
1-5 - Directly select specific models
X - Toggle coordinate system visualization
Mouse - Orbit camera and zoom

Next Steps

ROS Integration:

Add ability to import ROS bag files
Parse and extract timestamped position data


Timeline Playback:

Implement a timeline slider for scrubbing through experiment data
Create play/pause/stop controls for automated playback


Data Annotation:

Add ability to mark and label specific moments in the timeline
Implement annotation storage and export functionality


Model Animation:

Make models move according to the recorded trajectory data
Synchronize multiple model movements based on timestamp


Visualization Enhancements:

Add path visualization for movement tracking
Display sensor data overlays if available



Setup
Ensure all model files (trashcan.glb, nordic_table.glb, low_poly_human_model.glb) are in the /models/ directory and run the project using npm run dev.
