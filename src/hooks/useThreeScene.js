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

    class Bird {
      constructor() {
        this.rSegments = 4;
        this.hSegments = 3;
        this.cylRay = 120;
        this.bodyBirdInitPositions = [];
        this.vAngle = 0;
        this.hAngle = 0;
        // sourcery skip: binary-operator-identity
        this.normalSkin = { r: 255 / 255, g: 222 / 255, b: 121 / 255 };
        this.shySkin = { r: 255 / 255, g: 157 / 255, b: 101 / 255 };
        this.color = {
          r: this.normalSkin.r,
          g: this.normalSkin.g,
          b: this.normalSkin.b,
        };
        this.side = "left";

        this.shyAngles = { h: 0, v: 0 };
        this.behaviourInterval = null;
        this.intervalRunning = false;

        this.threegroup = new THREE.Group();

        // Materials
        this.yellowMat = new THREE.MeshLambertMaterial({
          color: 0xffde79,
          flatShading: true,
        });
        this.whiteMat = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          flatShading: true,
        });
        this.blackMat = new THREE.MeshLambertMaterial({
          color: 0x000000,
          flatShading: true,
        });
        this.orangeMat = new THREE.MeshLambertMaterial({
          color: 0xff5535,
          flatShading: true,
        });

        // Wings
        this.wingLeftGroup = new THREE.Group();
        this.wingRightGroup = new THREE.Group();

        let wingGeom = new THREE.BoxGeometry(60, 60, 5);
        let wingLeft = new THREE.Mesh(wingGeom, this.yellowMat);
        this.wingLeftGroup.add(wingLeft);
        this.wingLeftGroup.position.set(70, 0, 0);
        this.wingLeftGroup.rotation.y = Math.PI / 2;
        wingLeft.rotation.x = -Math.PI / 4;

        let wingRight = new THREE.Mesh(wingGeom, this.yellowMat);
        this.wingRightGroup.add(wingRight);
        this.wingRightGroup.position.set(-70, 0, 0);
        this.wingRightGroup.rotation.y = -Math.PI / 2;
        wingRight.rotation.x = -Math.PI / 4;

        // Body
        let bodyGeom = new THREE.CylinderGeometry(
          40,
          70,
          200,
          this.rSegments,
          this.hSegments
        );
        this.bodyBird = new THREE.Mesh(bodyGeom, this.yellowMat);
        this.bodyBird.position.y = 70;

        this.bodyVerticesLength =
          this.bodyBird.geometry.attributes.position.count;
        for (var i = 0; i < this.bodyVerticesLength; i++) {
          var position = this.bodyBird.geometry.attributes.position;
          var x = position.getX(i);
          var y = position.getY(i);
          var z = position.getZ(i);
          this.bodyBirdInitPositions.push({ x: x, y: y, z: z });
        }

        this.threegroup.add(this.bodyBird);
        this.threegroup.add(this.wingLeftGroup);
        this.threegroup.add(this.wingRightGroup);

        // Eyes and Beak
        this.createFace();

        this.threegroup.traverse(function (object) {
          if (object instanceof THREE.Mesh) {
            object.castShadow = true;
            object.receiveShadow = true;
          }
        });
      }

      createFace() {
        this.face = new THREE.Group();
        let eyeGeom = new THREE.BoxGeometry(60, 60, 10);
        let irisGeom = new THREE.BoxGeometry(10, 10, 10);

        this.leftEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.leftEye.position.set(-30, 120, 35);
        this.leftEye.rotation.y = -Math.PI / 4;

        this.leftIris = new THREE.Mesh(irisGeom, this.blackMat);
        this.leftIris.position.set(-30, 120, 40);
        this.leftIris.rotation.y = -Math.PI / 4;

        this.rightEye = new THREE.Mesh(eyeGeom, this.whiteMat);
        this.rightEye.position.set(30, 120, 35);
        this.rightEye.rotation.y = Math.PI / 4;

        this.rightIris = new THREE.Mesh(irisGeom, this.blackMat);
        this.rightIris.position.set(30, 120, 40);
        this.rightIris.rotation.y = Math.PI / 4;

        let beakGeom = new THREE.CylinderGeometry(0, 20, 20, 4, 1);
        this.beak = new THREE.Mesh(beakGeom, this.orangeMat);
        this.beak.position.set(0, 70, 65);
        this.beak.rotation.x = Math.PI / 2;

        this.face.add(this.leftEye);
        this.face.add(this.leftIris);
        this.face.add(this.rightEye);
        this.face.add(this.rightIris);
        this.face.add(this.beak);

        this.createFeathers();
        this.threegroup.add(this.face);
      }

      createFeathers() {
        let featherGeom = new THREE.BoxGeometry(10, 20, 5);
        this.feather1 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather1.position.set(0, 185, 55);
        this.feather1.rotation.x = Math.PI / 4;
        this.feather1.scale.set(1.5, 1.5, 1);

        this.feather2 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather2.position.set(20, 180, 50);
        this.feather2.rotation.x = Math.PI / 4;
        this.feather2.rotation.z = -Math.PI / 8;

        this.feather3 = new THREE.Mesh(featherGeom, this.yellowMat);
        this.feather3.position.set(-20, 180, 50);
        this.feather3.rotation.x = Math.PI / 4;
        this.feather3.rotation.z = Math.PI / 8;

        this.face.add(this.feather1);
        this.face.add(this.feather2);
        this.face.add(this.feather3);
      }

      look(hAngle, vAngle) {
        this.hAngle = hAngle;
        this.vAngle = vAngle;

        this.leftIris.position.set(
          -30 + this.hAngle * 10,
          120 - this.vAngle * 30,
          40 + this.hAngle * 10
        );
        this.rightIris.position.set(
          30 + this.hAngle * 10,
          120 - this.vAngle * 30,
          40 - this.hAngle * 10
        );

        this.leftEye.position.y = this.rightEye.position.y =
          120 - this.vAngle * 10;

        this.beak.position.y = 70 - this.vAngle * 20;
        this.beak.rotation.x = Math.PI / 2 + this.vAngle / 3;

        this.feather1.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather1.position.y = 185 - this.vAngle * 10;
        this.feather1.position.z = 55 + this.vAngle * 10;

        this.feather2.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather2.position.y = 180 - this.vAngle * 10;
        this.feather2.position.z = 50 + this.vAngle * 10;

        this.feather3.rotation.x = Math.PI / 4 + this.vAngle / 2;
        this.feather3.position.y = 180 - this.vAngle * 10;
        this.feather3.position.z = 50 + this.vAngle * 10;

        for (let i = 0; i < this.bodyVerticesLength; i++) {
          let line = Math.floor(i / (this.rSegments + 1));
          var position = this.bodyBird.geometry.attributes.position;
          var x = position.getX(i);
          var y = position.getY(i);
          var z = position.getZ(i);
          this.bodyBirdInitPositions[i] = { x: x, y: y, z: z };
        }

        this.face.rotation.y = this.hAngle;
        this.bodyBird.geometry.attributes.position.needsUpdate = true;
      }

      lookAway(fastMove) {
        const speed = fastMove ? 0.4 : 2;
        const ease = fastMove ? "power4.out" : "power2.inOut";
        const delay = fastMove ? 0.2 : 0;
        const col = fastMove ? this.shySkin : this.normalSkin;
        const tv = ((-1 + Math.random() * 2) * Math.PI) / 3;
        const beakScaleX = 0.75 + Math.random() * 0.25;
        const beakScaleZ = 0.5 + Math.random() * 0.5;

        const th =
          this.side === "right"
            ? ((-1 + Math.random()) * Math.PI) / 4
            : (Math.random() * Math.PI) / 4;

        gsap.killTweensOf(this.shyAngles);
        gsap.to(this.shyAngles, {
          duration: speed,
          v: tv,
          h: th,
          ease: ease,
          delay: delay,
        });
        gsap.to(this.color, {
          duration: speed,
          r: col.r,
          g: col.g,
          b: col.b,
          ease: ease,
          delay: delay,
        });
        gsap.to(this.beak.scale, {
          duration: speed,
          z: beakScaleZ,
          x: beakScaleX,
          ease: ease,
          delay: delay,
        });
      }

      stare() {
        const col = this.normalSkin;
        const th = this.side === "right" ? Math.PI / 3 : -Math.PI / 3;

        gsap.to(this.shyAngles, {
          duration: 2,
          v: -0.5,
          h: th,
          ease: "power2.inOut",
        });
        gsap.to(this.color, {
          duration: 2,
          r: col.r,
          g: col.g,
          b: col.b,
          ease: "power2.inOut",
        });
        gsap.to(this.beak.scale, {
          duration: 2,
          z: 0.8,
          x: 1.5,
          ease: "power2.inOut",
        });
      }

      isLookingAway() {
        return this.shyAngles.h !== 0 || this.shyAngles.v !== 0;
      }

      setShy() {
        gsap.to(this.color, {
          duration: 0.5,
          r: this.shySkin.r,
          g: this.shySkin.g,
          b: this.shySkin.b,
          ease: Strong.easeOut,
        });
      }

      setNormal() {
        gsap.to(this.color, {
          duration: 0.5,
          r: this.normalSkin.r,
          g: this.normalSkin.g,
          b: this.normalSkin.b,
          ease: Strong.easeOut,
        });
      }

      startBehaviour() {
        this.intervalRunning = true;
        let _this = this;
        this.behaviourInterval = setInterval(function () {
          _this.loop();
        }, 5000);
      }

      stopBehaviour() {
        this.intervalRunning = false;
        clearInterval(this.behaviourInterval);
      }
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

      // Bird 2 behavior
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
      }

      // Bird 3 behavior
      if (bird1.hAngle > Math.PI / 5 && !bird3.intervalRunning) {
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

    return () => {
      window.removeEventListener("resize", onWindowResize);
      document.removeEventListener("mousemove", handleMouseMove);

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
