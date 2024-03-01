import * as THREE from "three";
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000);
camera.position.set(0, 100, 200);
camera.rotation.set(0, 50, 0);
// camera.lookAt(sun);
// var followDistance = new THREE.Vector3(0, 5, -10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
canvas.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject()); 

/* 
  Defining objects.
  __________________________________________________________________________________________________________________//
*/        

//NOTE: If our sun has 1000 radius, you should divide everything by 695.7. You should only use Kilometers.

const textureLoader = new THREE.TextureLoader();

function createMoon(x = 50, y = 20, z = 50, radius = 0){
  const secondSphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
  const secondSphereTexture = textureLoader.load(`assets/img/moonTexture.jpg`);
  const secondSphereMaterial = new THREE.MeshBasicMaterial({
    map: secondSphereTexture,
  });
  const secondSphere = new THREE.Mesh(secondSphereGeometry, secondSphereMaterial);
  secondSphere.position.set(x, y, z);
  secondSphere.castShadow = true;
  secondSphere.receiveShadow = false;
  scene.add(secondSphere);
  return secondSphere;
}

function createPlanet(x = 50, y = 20, z = 50, radius = 100, sprite){
  const secondSphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
  const secondSphereTexture = textureLoader.load(`${sprite}`);
  const secondSphereMaterial = new THREE.MeshBasicMaterial({
    map: secondSphereTexture,
  });
  const secondSphere = new THREE.Mesh(secondSphereGeometry, secondSphereMaterial);
  secondSphere.position.set(x, y, z);
  secondSphere.castShadow = true;
  secondSphere.receiveShadow = false;
  scene.add(secondSphere);
  return secondSphere;
}

function createSun(x = 10, y = 10, z = 10, radius = 10, color = `FFFF00`, intensity = 10, range = 1000){
  const pointLight = new THREE.PointLight(0xffffff, intensity, range);
  pointLight.position.set(x, y, z);
  pointLight.castShadow = true;
  scene.add(pointLight);

  const lightMarkerGeometry = new THREE.SphereGeometry(radius, 50, 50);
  const lightMarkerMaterial = new THREE.MeshBasicMaterial({ color: color });
  const lightMarker = new THREE.Mesh(lightMarkerGeometry, lightMarkerMaterial);
  lightMarker.position.set(x, y, z);
  scene.add(lightMarker);
  return {pointLight, lightMarker};
}
function createSphere(x = 10, y = 10, z = 10, radius = 1, color = 0xff0000, isStandard = true){
  const geometry = new THREE.SphereGeometry(radius, 50, 50);
  let material = 0;
  if(isStandard){
    material = new THREE.MeshStandardMaterial({ color: color });
  }else{
    material = new THREE.MeshBasicMaterial({ color: color });
  }
  const mainSphere = new THREE.Mesh(geometry, material);
  mainSphere.position.x = x;
  mainSphere.position.y = y;
  mainSphere.position.z = z;
  mainSphere.castShadow  = isStandard ? true: false;
  mainSphere.receiveShadow = isStandard ? true : false;
  scene.add(mainSphere);
  return mainSphere;
}

function createPointLight(x = 10, y = 10, z = 10, intensity = 10, range = 10) {
  const pointLight = new THREE.PointLight(0xffffff, intensity, range);
  pointLight.position.set(x, y, z);
  pointLight.castShadow = true;
  scene.add(pointLight);
  //Set up shadow properties for the light
  pointLight.shadow.mapSize.width = 512; // default
  pointLight.shadow.mapSize.height = 512; // default
  pointLight.shadow.camera.near = 0.5; // default
  pointLight.shadow.camera.far = 500; // default
  // const lightMarkerGeometry = new THREE.SphereGeometry(0.01, 50, 50);
  // const lightMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // const lightMarker = new THREE.Mesh(lightMarkerGeometry, lightMarkerMaterial);
  // lightMarker.position.set(x, y, z);
  // lightMarker.castShadow = true;
  // scene.add(lightMarker);
}


function createModelGlTF(modelUrl = "assets/spaceShip/scene.gltf", name = "default", x = 0, y = 95 , z = 195, scaleX = 0.1, scaleY = 0.1, scaleZ = 0.1)
{
  const loader = new GLTFLoader();
  let model;
  loader.load(`${modelUrl}`, (gltf) => {
    model = gltf.scene;
    model.position.set(x, y, z);
    model.scale.set(scaleX, scaleY, scaleZ);
    model.lookAt(sun.lightMarker.position);
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({ color: "#007090" });
      }
    });
    model.name = `${name}`
    scene.add(model);
  });
  return new Promise((resolve, reject) =>{
    setTimeout(() => {
      console.log(scene.children.filter((element) => element.name === `${name}`)[0]);
      resolve(scene.children.filter((element) => element.name === `${name}`)[0]);
    }, (2 * 1000));
  })
}

//This function makes our guide arrow be always in the same place.
function updateFixedObject(fixedObject, distance = 1){
  const directionCamera = new THREE.Vector3();
  camera.getWorldDirection(directionCamera);
  const newPosition = camera.position.clone().add(directionCamera.multiplyScalar(distance));
  fixedObject.position.copy(newPosition);
  fixedObject.lookAt(sun.lightMarker.position);
  fixedObject.position.y = camera.position.y - 0.8;
}

// Wonder why is this used for.
function toRealSize(num){
  return num / (6963.4);
}



/*
  __________________________________________________________________________________________________________________//
  End Defining objects.
*/    


/*
  Creating variables needed to scales.
  ________________________________________________________________________________________________________________________________
*/     

//IMPORTANT : YOU'LL NOTICE THAT WE ARE MAKING A FEW MULTIPLICATIONS HERE, I'M DOING THIS BECAUSE A WANT PLANETS TO BE BIGGER 
//IF YOU WANT PLANETS TO BE IN THEIR REAL SIZES, YOU NEED DELETE THAT MULTIPLICATION.

//Original values are in our realValues.txt.

let lightSpeed = toRealSize(300000);

//Planets radius 
let sunRadius = toRealSize(696340); 
let mercuryRadius = toRealSize(2439 * 50); 
let venusRadius = toRealSize(6051) * 10;
let earthRadius = toRealSize(6371);
let moonRadius = toRealSize(1737); 
let marsRadius = toRealSize(3389) * 10; 
let jupiterRadius = toRealSize(69911) * 10; 
let saturnRadius = toRealSize(58232) * 10; 
let uranusRadius = toRealSize(25362) * 10; 
let neptuneRadius = toRealSize(24622) * 10; 
//End planets radius


//Distance from sun
let sunMercuryRadius = toRealSize(57909050);
let sunVenusRadius = toRealSize(108250000);
let sunEarthRadius = toRealSize(150000000);
let earthMoonRadius = toRealSize(385000) * 10;
let sunMarsRadius = toRealSize(227940000);
let sunJupiterRadius = toRealSize(778330000);
let sunSaturnRadius = toRealSize(1426660000);
let sunUranusRadius = toRealSize(2870650000);
let sunNeptuneRadius = toRealSize(4498396400);
//End distance from sum;


/*
  __________________________________________________________________________________________________________________//
  End Variables scale
*/    



/*
  Creating planets
  __________________________________________________________________________________________________________________//
*/    



const sun = createSun(0, 100, 0, sunRadius, `FFFF00`, 100000, 300000);

const mercury = createPlanet(0, 100, sunMercuryRadius,  mercuryRadius, `https://i.ibb.co/8BrvtGk/mercury.jpg`);
const venus = createPlanet(0, 100, sunVenusRadius,  venusRadius, `https://i.ibb.co/TvJN8qP/venus.jpg`);
const earth = createPlanet(0, 100, sunEarthRadius,  earthRadius, `https://i.ibb.co/Ht9xVjc/earth.jpg`);
const moon = createMoon(0, 100, 0, moonRadius, `https://i.ibb.co/XWY7nmK/moon.jpg`);
const mars = createPlanet(0, 100, sunMarsRadius,  marsRadius, `https://i.ibb.co/s6Bm4h1/mars.jpg`);
const jupiter = createPlanet(0, 100, sunJupiterRadius,  jupiterRadius, `https://i.ibb.co/dMbQ7Fr/jupiter.jpg`);
const saturn = createPlanet(0, 100, sunSaturnRadius,  saturnRadius, `https://i.ibb.co/647FYYD/saturn.jpg`);
const uranus = createPlanet(0, 100, sunUranusRadius,  uranusRadius, `https://i.ibb.co/cYZsn5j/uranus.jpg`);
const neptune = createPlanet(0, 100, sunNeptuneRadius, neptuneRadius, 'https://i.ibb.co/gFbp2wL/neptune.jpg')

//Coordinates points
const north = createSphere(0, 20, 100000000, 100000, '#FF0000', false);
const south = createSphere(0, 20, -10000000, 100000, '#00FFFF', false);
const east = createSphere(-10000000, 20, 0, 100000, `#FF00FF`, false);
const west = createSphere(10000000, 20, 0, 100000, '#00FF00', false);
const top = createSphere(0, 10000000, 0, 100000, '#FFFF00', false);



/*
  __________________________________________________________________________________________________________________//
  End Creating planets
*/    



//Creating fixed arrow
let myArrow = 0;
let arrow = createModelGlTF("assets/arrow/scene.gltf", "myArrow")
  .then(
    (arr) => {
      myArrow = arr;
      myArrow.position.y = camera.position.y - 2;
      myArrow.position.x = camera.position.x + 0;
      myArrow.position.z = camera.position.z - 2;
    },
  )
//End creating fixed arrow



//This values are used in our moon rotation.
let angle = 0;
const rotationSpeed = 0.0001;

function animate() {
  // changeCoordinates();
  requestAnimationFrame(animate);
  
  // earth.rotation.y += 0.001;
  // moon.rotation.y += 0.01;

  moon.position.x = earth.position.x + earthMoonRadius * Math.cos(angle);
  moon.position.z = earth.position.z + earthMoonRadius * Math.sin(angle);

  // earth.position.x = sun.lightMarker.position.x + sunEarthRadius * Math.cos(angle);
  // earth.position.z = sun.lightMarker.position.z + sunEarthRadius * Math.sin(angle);
  // // Increment angle next update. 
  // angle += rotationSpeed;
  if(myArrow) updateFixedObject(myArrow);
  renderer.render(scene, camera);
}

/*
  ADDING Controls..
  _______________________________________________________________________________________________________________
*/
let velocity = 0;
let velocityKm = 0;

const controlsMoveForward = (velocity) => {
  let intervalId = setInterval(() => {
    controls.moveForward(velocity / 60);
    changeCoordinates();
  }, 1000 / 60);
  return intervalId;
}
const controlsMoveRight = (velocity) => {
  let intervalId = setInterval(() => {
    controls.moveRight(velocity / 60);
    changeCoordinates();
  }, 1000 / 60);
  return intervalId;
}
/*
  _______________________________________________________________________________________________________________
  End ADDING Controls..
*/


//_______________________________________________________________________________________________________________
//   Movement Control..
let intervalForwardId = 0;
let intervalRightId = 0;






const onKeyDown = (event) => {
  switch (event.code) {
    case 'KeyW':
      if(intervalForwardId === 0) {
        intervalForwardId = controlsMoveForward(velocity);
      }
      break;
    case 'KeyA':
      if(intervalRightId === 0) {
        intervalRightId = controlsMoveRight(-velocity);
      }
      break;
    case 'KeyS':
      if(intervalForwardId === 0) {
        intervalForwardId = controlsMoveForward(-velocity);
      }
      break;
    case 'KeyD':
      if(intervalRightId === 0) {
        intervalRightId = controlsMoveRight(velocity);
      }
      break;
    case 'KeyQ':
      camera.position.set(arrow.position.x, arrow.position.y, arrow.position.z);
      break;
    case 'KeyB': 
      arrow.rotation.x += 0.1;
      arrow.r
      console.log(arrow);
      break;
    case 'KeyN': 
      arrow.rotation.y += 0.1;
      console.log(arrow);
      break;
    case 'KeyM': 
      const quaternion = new THREE.Quaternion();
      arrow.getWorldQuaternion(quaternion); 
      arrow.lookAt(sun.lightMarker.position); 
      arrow.rotation.setFromQuaternion(quaternion); 
      console.log(arrow);
      break;



    case 'Space':
      controls.camera.position.y += 0.1;
      changeCoordinates();
      break;
    case 'ShiftLeft':
      if(controls.camera.position.y > 1){
        controls.camera.position.y -= 0.1;
        changeCoordinates();
      }
      break;
    case 'Digit1':
      camera.position.set(mercury.position.x, mercury.position.y, mercury.position.z);
      changeCoordinates()
      break;
    case 'Digit2':
      camera.position.set(venus.position.x, venus.position.y, venus.position.z);
      changeCoordinates()
      break;
    case 'Digit3':
      camera.position.set(earth.position.x, earth.position.y, earth.position.z);
      changeCoordinates()
      break;
    case 'Digit4':
      camera.position.set(mars.position.x, mars.position.y, mars.position.z);
      changeCoordinates()
      break;
    case 'Digit5':
      camera.position.set(jupiter.position.x, jupiter.position.y, jupiter.position.z);
      changeCoordinates()
      break;
    case 'Digit6':
      camera.position.set(saturn.position.x, saturn.position.y, saturn.position.z);
      changeCoordinates()
      break;
    case 'Digit7':
      camera.position.set(uranus.position.x, earth.position.y, uranus.position.z);
      changeCoordinates()
      break;
    case 'Digit8':
      camera.position.set(neptune.position.x, neptune.position.y, neptune.position.z);
      changeCoordinates()
      break;
    case 'Digit9':
      camera.position.set(moon.position.x, moon.position.y, moon.position.z);
      changeCoordinates()
      break;

      

    case 'KeyT':
      velocity += toRealSize(1000);
      velocityKm += 1000;
      changeCoordinates();
      break;
    case 'KeyG':
      velocity -= toRealSize(1000);
      velocityKm -= 1000;
      changeCoordinates()
      break;
    case 'KeyV':
      camera.lookAt(sun.lightMarker.position);
      console.log(camera);
      break;
    case 'KeyZ': 
      wave.scale.x += 1;
      wave.scale.y += 1;
      console.log(wave);
      break;
    case 'KeyX':
      wave.scale.x -= 1;
      wave.scale.y -= 1;
      console.log(wave);
  }
};

const onKeyUp = (event) => {
  switch (event.code) {
    case 'KeyW':
      clearInterval(intervalForwardId);
      intervalForwardId = 0;
      break
    case 'KeyS':
      clearInterval(intervalForwardId);
      intervalForwardId = 0;
      break;
    case 'KeyA':
      clearInterval(intervalRightId);
      intervalRightId = 0;
      break;
    case 'KeyD':
      clearInterval(intervalRightId);
      intervalRightId = 0;
      break;
  }
}



/*
  Coordinates container.
  _______________________________________________________________________________________________________________
*/
function calculateDistance(obj1, obj2){
  return Math.sqrt( Math.pow((obj1.position.x - obj2.position.x), 2) + Math.pow((obj1.position.z - obj2.position.z), 2 ) );
}
const magnitudes = document.getElementById("magnitudes");
const message = document.getElementById("message");
function changeCoordinates(){
  let DFromSun = Math.round(calculateDistance(sun.lightMarker, camera) * 6963.4) - sunRadius * 6963.4;
  magnitudes.innerHTML = `DFromSun : ${DFromSun}KM \n Velocity: ${velocityKm}KMS. PositionY: ${camera.position.y}`
}

/*
  _______________________________________________________________________________________________________________
  End Coordinates container.
*/


/*
  Adding event listener.
  _______________________________________________________________________________________________________________
*/
document.addEventListener('click', () => {
  controls.lock();
});
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === document.body) {
    controls.lock();
  } else {
    controls.unlock();
  }
});


/*
  _______________________________________________________________________________________________________________
  End Adding event listener.
*/

animate();