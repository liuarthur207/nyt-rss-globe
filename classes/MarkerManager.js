import * as THREE from 'three';

export default class MarkerManager {
  constructor(scene, camera, renderer, maxMarkers = 100) {
    this.markerInfo = [];
    this.maxMarkers = maxMarkers;

    this.geometry = new THREE.PlaneGeometry(0.1, 0.1);
    

    // Create a material and inject a shader that discards fragments outside a central circle.
    this.material = new THREE.MeshBasicMaterial({
      color: 'blue',
    })
    this.material.defines = { USE_UV: '' };

    // Create the instanced mesh.
    this.markers = new THREE.InstancedMesh(this.geometry, this.material, maxMarkers);
    this.dummy = new THREE.Object3D();
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.scene.add(this.markers);

    this.markerIndex = 0;
    this.hoveredInstance = null;

    // Create an instanced buffer attribute for "phase".
    const phaseArray = new Float32Array(maxMarkers);
    for (let i = 0; i < maxMarkers; i++) {
      phaseArray[i] = Math.random();
    }
    this.geometry.setAttribute('phase', new THREE.InstancedBufferAttribute(phaseArray, 1));
  }

  addMarker(vector) {
    // Check if markerIndex is within bounds
    if (this.markerIndex >= this.markers.count) {
        console.warn("Max markers reached, cannot add more.");
        return;
    }

    // Ensure this.dummy is a valid object and is initialized
    if (!this.dummy || !(this.dummy instanceof THREE.Object3D)) {
        console.error("this.dummy is not properly initialized.");
        return;
    }

    // Set marker position.
    this.dummy.position.copy(vector);
    this.dummy.lookAt(this.dummy.position.clone().setLength(2.005));  // Ensure this makes sense for your setup
    this.dummy.updateMatrix();  // Update the transformation matrix

    // Set the matrix for the marker at markerIndex
    this.markers.setMatrixAt(this.markerIndex, this.dummy.matrix);

    // Ensure that the instance matrix is marked as needing an update
    this.markers.instanceMatrix.needsUpdate = true;

    // Increment the markerIndex
    this.markerIndex++;

    console.log(`Added marker at index ${this.markerIndex - 1} with position:`, vector);
}
}
