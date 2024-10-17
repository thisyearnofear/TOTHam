import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export function useThreeScene() {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    let scene, camera, renderer, container;
    let floor, bird1, bird2, bird3;
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

    function createLights() {
      const light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);

      const shadowLight = new THREE.DirectionalLight(0xffffff, 0.8);
      shadowLight.position.set(200, 200, 200);
      shadowLight.castShadow = true;
      shadowLight.shadow.mapSize.width = 1024;
      shadowLight.shadow.mapSize.height = 1024;

      const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
      backLight.position.set(-100, 200, 50);
      backLight.castShadow = true;

      scene.add(backLight);
      scene.add(light);
      scene.add(shadowLight);
    }

    function createFloor() {
      floor = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshBasicMaterial({ color: 0xe0dacd })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -33;
      floor.receiveShadow = true;
      scene.add(floor);
    }

    function createBirds() {
      bird1 = new Bird();
      bird1.threegroup.position.x = 0;
      scene.add(bird1.threegroup);

      bird2 = new Bird();
      bird2.threegroup.position.x = -250;
      bird2.side = "right";
      bird2.threegroup.scale.set(0.8, 0.8, 0.8);
      bird2.threegroup.position.y = -8;
      scene.add(bird2.threegroup);

      bird3 = new Bird();
      bird3.threegroup.position.x = 250;
      bird3.side = "left";
      bird3.threegroup.scale.set(0.8, 0.8, 0.8);
      bird3.threegroup.position.y = -8;
      scene.add(bird3.threegroup);
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
      bird1.look(userHAngle, userVAngle);

      if (bird1.hAngle < -Math.PI / 5 && !bird2.intervalRunning) {
        bird2.lookAway(true);
        bird2.intervalRunning = true;
        bird2.behaviourInterval = setInterval(() => {
          bird2.lookAway(false);
        }, 1500);
      } else if (bird1.hAngle > 0 && bird2.intervalRunning) {
        bird2.stare();
        clearInterval(bird2.behaviourInterval);
        bird2.intervalRunning = false;
      } else if (bird1.hAngle > Math.PI / 5 && !bird3.intervalRunning) {
        bird3.lookAway(true);
        bird3.intervalRunning = true;
        bird3.behaviourInterval = setInterval(() => {
          bird3.lookAway(false);
        }, 1500);
      } else if (bird1.hAngle < 0 && bird3.intervalRunning) {
        bird3.stare();
        clearInterval(bird3.behaviourInterval);
        bird3.intervalRunning = false;
      }

      bird2.look(bird2.shyAngles.h, bird2.shyAngles.v);
      bird2.bodyBird.material.color.setRGB(
        bird2.color.r,
        bird2.color.g,
        bird2.color.b
      );

      bird3.look(bird3.shyAngles.h, bird3.shyAngles.v);
      bird3.bodyBird.material.color.setRGB(
        bird3.color.r,
        bird3.color.g,
        bird3.color.b
      );

      render();
      requestAnimationFrame(loop);
    }

    function render() {
      renderer.render(scene, camera);
    }

    init();
    createLights();
    createFloor();
    createBirds();
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

  return sceneRef;
}
