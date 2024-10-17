import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createLights,
  createFloor,
  createBirds,
  createSkybox,
} from "../utils/threeUtils";

export function ThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    let scene, camera, renderer, container;
    let birds;
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

      birds[0].look(userHAngle, userVAngle);

      // Bird behavior logic
      if (birds[0].hAngle < -Math.PI / 5 && !birds[1].intervalRunning) {
        birds[1].lookAway(true);
        birds[1].intervalRunning = true;
        birds[1].behaviourInterval = setInterval(() => {
          birds[1].lookAway(false);
        }, 1500);
      } else if (birds[0].hAngle > 0 && birds[1].intervalRunning) {
        birds[1].stare();
        clearInterval(birds[1].behaviourInterval);
        birds[1].intervalRunning = false;
      } else if (birds[0].hAngle > Math.PI / 5 && !birds[2].intervalRunning) {
        birds[2].lookAway(true);
        birds[2].intervalRunning = true;
        birds[2].behaviourInterval = setInterval(() => {
          birds[2].lookAway(false);
        }, 1500);
      } else if (birds[0].hAngle < 0 && birds[2].intervalRunning) {
        birds[2].stare();
        clearInterval(birds[2].behaviourInterval);
        birds[2].intervalRunning = false;
      }

      birds[1].look(birds[1].shyAngles.h, birds[1].shyAngles.v);
      birds[1].bodyBird.material.color.setRGB(
        birds[1].color.r,
        birds[1].color.g,
        birds[1].color.b
      );

      birds[2].look(birds[2].shyAngles.h, birds[2].shyAngles.v);
      birds[2].bodyBird.material.color.setRGB(
        birds[2].color.r,
        birds[2].color.g,
        birds[2].color.b
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
    createSkybox(scene);
    birds = createBirds(scene);
    loop();

    window.addEventListener("resize", onWindowResize);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchstart", handleTouchStart);
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchmove", handleTouchMove);

    return () => {
      // Cleanup code (copy from original useThreeScene.js)
    };
  }, []);

  return <div ref={sceneRef} style={{ width: "100%", height: "100%" }} />;
}
