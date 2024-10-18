// src/utils/threeUtils.js

import * as THREE from "three";
import { Bird } from "../components/Bird";
import { Frog } from "../components/Frog";

export function createLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffcccc, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(200, 500, 300);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pinkLight = new THREE.PointLight(0xff9999, 0.5, 1000);
  pinkLight.position.set(-200, 300, 200);
  scene.add(pinkLight);
}

export function createFloor(scene) {
  const floorSize = 2000;
  const floorResolution = 256;
  const data = new Uint8Array(floorResolution * floorResolution * 4);

  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 0.2 + 0.8;
    data[i] = 255 * noise; // r
    data[i + 1] = 224 * noise; // g
    data[i + 2] = 189 * noise; // b
    data[i + 3] = 255; // a
  }

  const floorTexture = new THREE.DataTexture(
    data,
    floorResolution,
    floorResolution,
    THREE.RGBAFormat
  );
  floorTexture.needsUpdate = true;
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.8,
    metalness: 0.2,
  });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(floorSize, floorSize),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -33;
  floor.receiveShadow = true;
  scene.add(floor);
}

export function createFrogs(scene) {
  const frog1 = new Frog();
  frog1.threegroup.position.x = 0;
  scene.add(frog1.threegroup);

  const frog2 = new Frog();
  frog2.threegroup.position.x = -250;
  frog2.side = "right";
  frog2.threegroup.scale.set(0.8, 0.8, 0.8);
  frog2.threegroup.position.y = -8;
  scene.add(frog2.threegroup);

  const frog3 = new Frog();
  frog3.threegroup.position.x = 250;
  frog3.side = "left";
  frog3.threegroup.scale.set(0.8, 0.8, 0.8);
  frog3.threegroup.position.y = -8;
  scene.add(frog3.threegroup);

  return [frog1, frog2, frog3];
}

export function createBackground(scene, camera) {
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform vec3 archColor;

    // Function to create a sine wave arch pattern
    float arches(vec2 uv) {
      float arch = sin(uv.x * 10.0) * 0.2 + 0.3;  // Creates wave-like arches
      return smoothstep(arch - 0.02, arch + 0.02, uv.y);  // Soft transition for the arches
    }

    // Function to create a noise-based marbled texture (for the ham motif)
    float noise(vec2 uv) {
      return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 hamTexture(vec2 uv) {
      float hamNoise = noise(uv * 5.0) * 0.5 + noise(uv * 15.0) * 0.3;  // Layered noise for marbling
      vec3 hamColor = mix(vec3(0.9, 0.6, 0.6), vec3(0.8, 0.4, 0.4), hamNoise);  // Soft pink tones for ham
      return hamColor;
    }

    void main() {
      // Create gradient from colorA (nature) to colorB (sky)
      vec3 gradient = mix(colorA, colorB, vUv.y);

      // Add arches pattern with purple color
      float archPattern = arches(vUv);
      vec3 archOverlay = mix(gradient, archColor, archPattern);

      // Blend in ham texture at the bottom half of the screen
      vec3 ham = hamTexture(vUv);
      vec3 finalColor = mix(ham, archOverlay, smoothstep(0.2, 0.8, vUv.y));  // Ham at the bottom fades into arches

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const uniforms = {
    colorA: { value: new THREE.Color(0x4caf50) }, // Nature green at the bottom (grass-like)
    colorB: { value: new THREE.Color(0x9c27b0) }, // Purple sky at the top
    archColor: { value: new THREE.Color(0x7b1fa2) }, // Deeper purple for arches
  };

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);

  // Create a separate scene for the background
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.Camera();
  bgScene.add(mesh);

  return {
    updateSize: (renderer) => {
      const { width, height } = renderer.getSize(new THREE.Vector2());
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },
    render: (renderer) => {
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(bgScene, bgCamera);
      renderer.render(scene, camera);
    },
  };
}
