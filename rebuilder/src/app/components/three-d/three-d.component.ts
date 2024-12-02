import { Component, ElementRef, input, viewChild, AfterViewInit } from '@angular/core';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

@Component({
  selector: 'app-three-d',
  standalone: true,
  imports: [],
  templateUrl: './three-d.component.html',
  styleUrl: './three-d.component.css'
})
export class ThreeDComponent implements AfterViewInit {
  src = input.required<string>();
  modelCanvas = viewChild<ElementRef>("canvas");

  // THREE.js rendering components
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  private camera!: THREE.PerspectiveCamera;

  private createScene() {
    this.scene = new THREE.Scene();
    
    this.renderer = new THREE.WebGLRenderer(
      { canvas: this.modelCanvas()?.nativeElement }
    );
    this.renderer.setPixelRatio(10); // Set resolution

    
    this.camera = new THREE.PerspectiveCamera(
      75, // FOV
      window.innerWidth/window.innerHeight, // Aspect ratio
      0.1, // Near plane render cutoff
      1000, // Far plane render cutoff
    )
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0); // Look to the center where the model is
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Baseline "brightness"
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambientLight);

    // Additional light sources, at opposite corners
    const directionalLight1 = new THREE.DirectionalLight
    (0xffffff, 1);
    directionalLight1.position.set(50, 100, 75);
    this.scene.add(directionalLight1);
    const directionalLight2 = new THREE.DirectionalLight
    (0xffffff, 1);
    directionalLight2.position.set(-50, -100, -75);
    this.scene.add(directionalLight2);
    
    // Load model from the provided URL and add to the center of the render
    const loader = new ColladaLoader();
    loader.load(this.src(),
      (gltf) => {
        this.scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 0);
      }
    )
  }

  // Function to start up rendering loop
  private startAnimation() {
    let component: ThreeDComponent = this;
    (function animate() {
      requestAnimationFrame(animate); // Play the next frame
      component.controls.update();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  // Initialize 3D environment and render animation
  ngAfterViewInit() {
    this.createScene();
    this.startAnimation();
  }
}
