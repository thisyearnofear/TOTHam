import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createLights,
  createFloor,
  createFrogs,
  createBackground,
} from "../utils/threeUtils";

export function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    let scene, camera, renderer, container;
    let frogs;
    let HEIGHT, WIDTH, windowHalfX, windowHalfY;
    let mousePos = { x: 0, y: 0 };

    function init() {
      scene = new THREE.Scene();
      HEIGHT = window.innerHeight;
      WIDTH = window.innerWidth;
      windowHalfX = WIDTH / 2;
      windowHalfY = HEIGHT / 2;

      camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 2000);
      camera.position.set(0, 300, 1000);
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(WIDTH, HEIGHT);
      renderer.shadowMap.enabled = true;

      container = sceneRef.current;
      container.appendChild(renderer.domElement);
    }

    function handleMouseMove(event) {
      mousePos = { x: event.clientX, y: event.clientY };
    }

    function handleTouchStart(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
        mousePos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
      }
    }

    function handleTouchEnd(event) {
      mousePos = { x: windowHalfX, y: windowHalfY };
    }

    function handleTouchMove(event) {
      if (event.touches.length == 1) {
        event.preventDefault();
        mousePos = { x: event.touches[0].pageX, y: event.touches[0].pageY };
      }
    }

    function onWindowResize() {
      HEIGHT = window.innerHeight;
      WIDTH = window.innerWidth;
      windowHalfX = WIDTH / 2;
      windowHalfY = HEIGHT / 2;
      renderer.setSize(WIDTH, HEIGHT);
      camera.aspect = WIDTH / HEIGHT;
      camera.updateProjectionMatrix();
    }

    function loop() {
      const tempHA = (mousePos.x - windowHalfX) / 200;
      const tempVA = (mousePos.y - windowHalfY) / 200;
      const userHAngle = Math.min(Math.max(tempHA, -Math.PI / 3), Math.PI / 3);
      const userVAngle = Math.min(Math.max(tempVA, -Math.PI / 3), Math.PI / 3);

      frogs[0].look(userHAngle, userVAngle);

      // Frog behavior logic
      if (frogs[0].hAngle < -Math.PI / 5 && !frogs[1].intervalRunning) {
        frogs[1].lookAway(true);
        frogs[1].intervalRunning = true;
        frogs[1].behaviourInterval = setInterval(() => {
          frogs[1].lookAway(false);
        }, 1500);
      } else if (frogs[0].hAngle > 0 && frogs[1].intervalRunning) {
        frogs[1].stare();
        clearInterval(frogs[1].behaviourInterval);
        frogs[1].intervalRunning = false;
      } else if (frogs[0].hAngle > Math.PI / 5 && !frogs[2].intervalRunning) {
        frogs[2].lookAway(true);
        frogs[2].intervalRunning = true;
        frogs[2].behaviourInterval = setInterval(() => {
          frogs[2].lookAway(false);
        }, 1500);
      } else if (frogs[0].hAngle < 0 && frogs[2].intervalRunning) {
        frogs[2].stare();
        clearInterval(frogs[2].behaviourInterval);
        frogs[2].intervalRunning = false;
      }

      frogs[1].look(frogs[1].shyAngles.h, frogs[1].shyAngles.v);
      frogs[1].bodyFrog.material.color.setRGB(
        frogs[1].color.r,
        frogs[1].color.g,
        frogs[1].color.b
      );

      frogs[2].look(frogs[2].shyAngles.h, frogs[2].shyAngles.v);
      frogs[2].bodyFrog.material.color.setRGB(
        frogs[2].color.r,
        frogs[2].color.g,
        frogs[2].color.b
      );

      render();
      requestAnimationFrame(loop);
    }

    function render() {
      renderer.render(scene, camera);
    }

    init();
    createLights(scene);
    createFloor(scene);
    createBackground(scene);
    frogs = createFrogs(scene);
    loop();

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);

      // Cleanup Three.js objects
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={sceneRef} style={{ width: "100%", height: "100%" }} />;
}
