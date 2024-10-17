import * as THREE from "three";
import { Bird } from "../components/Bird";

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
  const floorTexture = new THREE.TextureLoader().load("/ham_texture.png");
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(10, 10);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshBasicMaterial({ map: floorTexture })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -33;
  floor.receiveShadow = true;
  scene.add(floor);
  return floor;
}

export function createBirds(scene) {
  const bird1 = new Bird();
  bird1.threegroup.position.x = 0;
  scene.add(bird1.threegroup);

  const bird2 = new Bird();
  bird2.threegroup.position.x = -250;
  bird2.side = "right";
  bird2.threegroup.scale.set(0.8, 0.8, 0.8);
  bird2.threegroup.position.y = -8;
  scene.add(bird2.threegroup);

  const bird3 = new Bird();
  bird3.threegroup.position.x = 250;
  bird3.side = "left";
  bird3.threegroup.scale.set(0.8, 0.8, 0.8);
  bird3.threegroup.position.y = -8;
  scene.add(bird3.threegroup);

  return [bird1, bird2, bird3];
}

export function createSkybox(scene) {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "/skybox/px.png",
    "/skybox/nx.png",
    "/skybox/py.png",
    "/skybox/ny.png",
    "/skybox/pz.png",
    "/skybox/nz.png",
  ]);
  scene.background = texture;
}
