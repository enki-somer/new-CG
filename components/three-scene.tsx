"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Only run on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Skip if not mounted or ref is not available
    if (!isMounted || !mountRef.current) return;

    let animationFrameId: number | null = null;

    try {
      // Store ref value in a variable for cleanup function
      const mountNode = mountRef.current;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      // Initialize renderer with error handling
      let renderer: THREE.WebGLRenderer;

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountNode.appendChild(renderer.domElement);
      } catch (error) {
        console.log("WebGL rendering not supported, skipping 3D scene");
        return; // Exit early if WebGL is not supported
      }

      // Create geometry
      const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0x273c75,
        wireframe: true,
      });
      const torusKnot = new THREE.Mesh(geometry, material);
      scene.add(torusKnot);

      // Add lights
      const pointLight = new THREE.PointLight(0xffffff);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Camera position
      camera.position.z = 30;

      // Add controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 2;

      // Animation
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.001;
        torusKnot.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        // Clean up resources
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }

        // Remove event listener
        window.removeEventListener("resize", handleResize);

        // Dispose of Three.js resources
        if (mountNode.contains(renderer.domElement)) {
          mountNode.removeChild(renderer.domElement);
        }

        // Dispose of geometry and material
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    } catch (error) {
      console.log("Error in ThreeScene component:", error);

      // Clean up any animation frame if there was an error
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    }
  }, [isMounted]);

  // Don't render anything until client-side
  if (!isMounted) return null;

  return <div ref={mountRef} className="absolute inset-0" />;
}
