// src/components/Frog.js

import * as THREE from "three";
import { gsap } from "gsap";

export class Frog {
  constructor() {
    this.rSegments = 4;
    this.hSegments = 3;
    this.cylRay = 120;
    this.bodyFrogInitPositions = [];
    this.vAngle = this.hAngle = 0;

    // Keep the existing color definitions
    this.normalSkin = { r: 50 / 255, g: 205 / 255, b: 50 / 255 }; // Green
    this.shySkin = { r: 144 / 255, g: 238 / 255, b: 144 / 255 }; // Light Green
    this.color = {
      r: this.normalSkin.r,
      g: this.normalSkin.g,
      b: this.normalSkin.b,
    };
    this.side = "left";

    this.shyAngles = { h: 0, v: 0 };
    this.behaviourInterval;
    this.intervalRunning = false;

    this.threegroup = new THREE.Group();

    // Update materials for more detailed frog
    this.greenMat = new THREE.MeshLambertMaterial({
      color: 0x32cd32,
      flatShading: true,
    });
    this.lightGreenMat = new THREE.MeshLambertMaterial({
      color: 0x90ee90,
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
    this.redMat = new THREE.MeshLambertMaterial({
      color: 0xff4500,
      flatShading: true,
    });

    // Create frog parts
    this.createBody();
    this.createLegs();
    this.createFace();
    this.createSpots();

    this.threegroup.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

  createBody() {
    var bodyGeom = new THREE.SphereGeometry(80, 32, 32);
    this.bodyFrog = new THREE.Mesh(bodyGeom, this.greenMat);
    this.bodyFrog.position.y = 60;

    var bellyGeom = new THREE.SphereGeometry(70, 32, 32);
    this.belly = new THREE.Mesh(bellyGeom, this.lightGreenMat);
    this.belly.position.set(0, -10, 10);
    this.bodyFrog.add(this.belly);

    this.bodyVerticesLength = this.bodyFrog.geometry.attributes.position.count;
    for (var i = 0; i < this.bodyVerticesLength; i++) {
      var position = this.bodyFrog.geometry.attributes.position;
      var x = position.getX(i);
      var y = position.getY(i);
      var z = position.getZ(i);
      this.bodyFrogInitPositions.push({ x: x, y: y, z: z });
    }

    this.threegroup.add(this.bodyFrog);
  }

  createLegs() {
    this.frontLeftLeg = new THREE.Group();
    this.frontRightLeg = new THREE.Group();
    this.backLeftLeg = new THREE.Group();
    this.backRightLeg = new THREE.Group();

    var upperLegGeom = new THREE.CylinderGeometry(15, 10, 40);
    var lowerLegGeom = new THREE.CylinderGeometry(10, 15, 40);
    var footGeom = new THREE.SphereGeometry(20, 16, 16);

    this.createLeg(
      this.frontLeftLeg,
      upperLegGeom,
      lowerLegGeom,
      footGeom,
      50,
      0,
      60
    );
    this.createLeg(
      this.frontRightLeg,
      upperLegGeom,
      lowerLegGeom,
      footGeom,
      -50,
      0,
      60
    );
    this.createLeg(
      this.backLeftLeg,
      upperLegGeom,
      lowerLegGeom,
      footGeom,
      50,
      0,
      -60
    );
    this.createLeg(
      this.backRightLeg,
      upperLegGeom,
      lowerLegGeom,
      footGeom,
      -50,
      0,
      -60
    );

    this.threegroup.add(this.frontLeftLeg);
    this.threegroup.add(this.frontRightLeg);
    this.threegroup.add(this.backLeftLeg);
    this.threegroup.add(this.backRightLeg);
  }

  createLeg(group, upperLegGeom, lowerLegGeom, footGeom, x, y, z) {
    var upperLeg = new THREE.Mesh(upperLegGeom, this.greenMat);
    var lowerLeg = new THREE.Mesh(lowerLegGeom, this.greenMat);
    var foot = new THREE.Mesh(footGeom, this.greenMat);

    upperLeg.position.y = -20;
    lowerLeg.position.y = -40;
    foot.position.y = -60;
    foot.scale.set(1, 0.7, 1.5);

    group.add(upperLeg);
    group.add(lowerLeg);
    group.add(foot);
    group.position.set(x, y, z);
  }

  createFace() {
    this.face = new THREE.Group();

    // Eyes
    var eyeGeom = new THREE.SphereGeometry(25, 32, 32);
    var irisGeom = new THREE.SphereGeometry(12, 32, 32);
    var pupilGeom = new THREE.SphereGeometry(8, 32, 32);

    this.leftEye = new THREE.Mesh(eyeGeom, this.whiteMat);
    this.leftEye.position.set(-30, 120, 35);
    this.leftIris = new THREE.Mesh(irisGeom, this.redMat);
    this.leftIris.position.set(-30, 120, 45);
    this.leftPupil = new THREE.Mesh(pupilGeom, this.blackMat);
    this.leftPupil.position.set(-30, 120, 50);

    this.rightEye = new THREE.Mesh(eyeGeom, this.whiteMat);
    this.rightEye.position.set(30, 120, 35);
    this.rightIris = new THREE.Mesh(irisGeom, this.redMat);
    this.rightIris.position.set(30, 120, 45);
    this.rightPupil = new THREE.Mesh(pupilGeom, this.blackMat);
    this.rightPupil.position.set(30, 120, 50);

    // Mouth
    var mouthGeom = new THREE.SphereGeometry(
      40,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5
    );
    this.mouth = new THREE.Mesh(mouthGeom, this.redMat);
    this.mouth.position.set(0, 80, 55);
    this.mouth.rotation.x = Math.PI;
    this.mouth.scale.set(1, 0.5, 1);

    this.face.add(this.leftEye);
    this.face.add(this.leftIris);
    this.face.add(this.leftPupil);
    this.face.add(this.rightEye);
    this.face.add(this.rightIris);
    this.face.add(this.rightPupil);
    this.face.add(this.mouth);

    this.threegroup.add(this.face);
  }

  createSpots() {
    var spotGeom = new THREE.SphereGeometry(5, 16, 16);
    for (let i = 0; i < 10; i++) {
      var spot = new THREE.Mesh(spotGeom, this.lightGreenMat);
      spot.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      this.bodyFrog.add(spot);
    }
  }

  look(hAngle, vAngle) {
    this.hAngle = hAngle;
    this.vAngle = vAngle;

    this.leftPupil.position.y = this.leftIris.position.y =
      120 - this.vAngle * 30;
    this.leftPupil.position.x = this.leftIris.position.x =
      -30 + this.hAngle * 10;
    this.leftPupil.position.z = this.leftIris.position.z =
      45 + this.hAngle * 10;

    this.rightPupil.position.y = this.rightIris.position.y =
      120 - this.vAngle * 30;
    this.rightPupil.position.x = this.rightIris.position.x =
      30 + this.hAngle * 10;
    this.rightPupil.position.z = this.rightIris.position.z =
      45 - this.hAngle * 10;

    this.leftEye.position.y = this.rightEye.position.y = 120 - this.vAngle * 10;

    this.mouth.position.y = 80 - this.vAngle * 20;
    this.mouth.rotation.x = Math.PI + this.vAngle / 3;

    for (var i = 0; i < this.bodyVerticesLength; i++) {
      var line = Math.floor(i / (this.rSegments + 1));
      var position = this.bodyFrog.geometry.attributes.position;
      var x = position.getX(i);
      var y = position.getY(i);
      var z = position.getZ(i);
      var tvInitPos = this.bodyFrogInitPositions[i];
      var a;
      if (line >= this.hSegments - 1) {
        a = 0;
      } else {
        a = this.hAngle / (line + 1);
      }
      var tx = tvInitPos.x * Math.cos(a) + tvInitPos.z * Math.sin(a);
      var tz = -tvInitPos.x * Math.sin(a) + tvInitPos.z * Math.cos(a);
      position.setX(i, tx);
      position.setZ(i, tz);
    }
    this.face.rotation.y = this.hAngle;
    this.bodyFrog.geometry.attributes.position.needsUpdate = true;
  }

  lookAway(fastMove) {
    const speed = fastMove ? 0.4 : 2;
    const ease = fastMove ? "power3.out" : "power3.inOut";
    const delay = fastMove ? 0.2 : 0;
    const col = fastMove ? this.shySkin : this.normalSkin;
    const tv = ((-1 + Math.random() * 2) * Math.PI) / 3;
    const eyeScaleX = 1.2;
    const eyeScaleY = 1.2;

    const th =
      this.side === "right"
        ? ((-1 + Math.random()) * Math.PI) / 4
        : (Math.random() * Math.PI) / 4;

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
    gsap.to(
      [
        this.leftEye.scale,
        this.rightEye.scale,
        this.leftIris.scale,
        this.rightIris.scale,
      ],
      {
        duration: speed,
        x: eyeScaleX,
        y: eyeScaleY,
        ease: ease,
        delay: delay,
      }
    );

    // Add leg movement
    gsap.to([this.frontLeftLeg.rotation, this.backRightLeg.rotation], {
      duration: speed,
      x: -Math.PI / 6,
      ease: ease,
      delay: delay,
    });
    gsap.to([this.frontRightLeg.rotation, this.backLeftLeg.rotation], {
      duration: speed,
      x: Math.PI / 6,
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
      ease: "power3.inOut",
    });
    gsap.to(this.color, {
      duration: 2,
      r: col.r,
      g: col.g,
      b: col.b,
      ease: "power3.inOut",
    });
    gsap.to(
      [
        this.leftEye.scale,
        this.rightEye.scale,
        this.leftIris.scale,
        this.rightIris.scale,
      ],
      {
        duration: 2,
        x: 1,
        y: 1,
        ease: "power3.inOut",
      }
    );

    // Reset leg positions
    gsap.to(
      [
        this.frontLeftLeg.rotation,
        this.frontRightLeg.rotation,
        this.backLeftLeg.rotation,
        this.backRightLeg.rotation,
      ],
      {
        duration: 2,
        x: 0,
        ease: "power3.inOut",
      }
    );
  }
}
