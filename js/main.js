import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GameMap } from './Game/World/GameMap.js';
import { Character } from './Game/Behaviour/Character.js';
import { NPC } from './Game/Behaviour/NPC.js';
import { Player } from './Game/Behaviour/Player.js';
import { Controller} from './Game/Behaviour/Controller.js';
import { TileNode } from './Game/World/TileNode.js';
import { Resources } from './Util/Resources.js';
import { VectorUtil } from './Util/VectorUtil.js';
import { Weapon } from './Game/Behaviour/Weapon.js';
import { PET } from './Game/Behaviour/Pet.js';

let loadMessage = 'Loading...';
loadingScreen();

updateLoadingScreen('Creating Scene...');
// Create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
let camY = 15;
let camX = 20;
let camZ = 20;
const renderer = new THREE.WebGLRenderer();

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableRotate = false;
orbitControls.enableZoom = false;
orbitControls.enablePan = false;

updateLoadingScreen('Loading Resources...');
let files = [{name: 'mag', url:'../models/Mage@Animated.glb'},
			{name: 'gob', url:'../models/Goblin.glb'},
			{name: 'boar', url:'../models/Boar.glb'}];
const resources = new Resources(files);
await resources.loadAll();

// Create clock
const clock = new THREE.Clock();

// Controller for player
const controller = new Controller(document, camera);

// GameMap
let gameMap;

let weapon;

let amount = 10;	
// Player
let player;
let enemies = new Array();
let pet;
let petTarget;

// Setup our scene
function setup() {
	scene.background = new THREE.Color(0xffffff);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	camera.position.y = 300;
	camera.lookAt(new THREE.Vector3(0,0,0));

	//Create Light
	let directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.set(0, 5, 5);
	scene.add(directionalLight);

	// initialize our gameMap
	gameMap = new GameMap();
	gameMap.init(scene);
	
	updateLoadingScreen('Creating Player...');
	// Create Player
	player = new Player(new THREE.Color(0xff0000));
	pet = new PET(new THREE.Color(0x00f0f0));
	weapon = new Weapon(new THREE.Color(0x00ff00));

	player.setModel(resources.get('mag'));
	pet.setModel(resources.get('boar'));

	updateLoadingScreen('Creating Enemies...');
	spawnEnemies(amount);
	
	// Add the character to the scene
	scene.add(player.gameObject);
	scene.add(pet.gameObject);

	// Get a random starting place for the enemy
	let startPlayer = gameMap.rooms[0].createSpawnPoint();
	let petStart = gameMap.rooms[0].createSpawnPoint();
	// this is where we start the player
	player.location = gameMap.localize(startPlayer);
	pet.location = gameMap.localize(petStart);

	// Add the gameMap to the scene
	scene.add(gameMap.gameObject);

	
	//First call to animate
	updateLoadingScreen('Done!');
	animate();
}

// animate
function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	console.log(petTarget);
	
	let deltaTime = clock.getDelta();

	player.update(deltaTime, gameMap, controller);
	killEnemies(deltaTime);

	if(!pet.attacking){
		pet.update(deltaTime, gameMap, player);
		// petAttack();
	}
	else{
		if(enemies[petTarget].location.distanceTo(pet.location) <= 4){
			enemies[petTarget].health -= pet.damage;
		}
		pet.update(deltaTime, gameMap, enemies[petTarget]);
	}


	updateCamera(controller);

	orbitControls.update();
	controller.setWorldDirection();
}

setup();
loadingScreenOff();


// function petAttack(){
// 	for(let enemy = 0; enemy < enemies.length; enemy++){
// 		if(pet.location.distanceTo(enemies[enemy].location) <= 5 && pet.location.distanceTo(enemies[enemy].location) >= 1){
// 			console.log(pet.location.distanceTo(enemies[enemy].location));
// 			petTarget = enemy;
// 			pet.attacking = true;
// 			break;
// 		}
// 	}
// }

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

  	// Update the renderer size
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("click" , function(){
	player.mesh.material.color.setHex(0xf0ff00);
	console.log(camera.position);
	console.log(player.location.x);
	weapon.shoot = true;
	blastObject();
	setTimeout(() => {
		weapon.shoot = false;
	}, 10);
	});

// Add a resize event listener
window.addEventListener("resize", onWindowResize);

function spawnEnemies(amount) {
    for (let j = 0; j < gameMap.rooms.length; j++) {
        let randAmount = Math.floor(Math.random() * amount) + 1;
        for (let i = 0; i < randAmount; i++) {
            let enemy = new NPC(new THREE.Color(0x0000ff));
            enemy.setModel(resources.get('gob'));
            let startEnemy = gameMap.rooms[j].createSpawnPoint();
            enemy.location = gameMap.localize(startEnemy);
            enemies.push(enemy);
            scene.add(enemy.gameObject);
        }
    }
}
function killEnemies(deltaTime){
	if (enemies.length > 0){

			for(let enemy of enemies){
				enemy.update(deltaTime, gameMap);
				if(enemy.location.distanceTo(player.location) <= 30){enemy.applyForce(enemy.followPlayer(gameMap, player));}else{
					enemy.applyForce(enemy.wander());
				}		
				if (enemy.location.distanceTo(player.location) <= 1 && weapon.shoot){
					enemy.health -= weapon.damage;
				}
				if(enemy.health <= 0){
					scene.remove(enemy.gameObject);
					for(let i = 0; i < enemies.length; i++){
						if(enemies[i] == enemy){
							enemies.splice(i, 1);
						}
					}
				}
			}
		}	
}



window.addEventListener("wheel", function(e){
	if(e.deltaY > 0 && camX < 20){
		camX += 1;
		camZ += 1;
	}else if(e.deltaY < 0 && camX >= 2){
		camX -= 1;
		camZ -= 1;
	}

	if(camX <=2 ){
		camY = 3;
		camX = 2;
		camZ = 2;
	}
	else{
		camY = 15;
	}
});

function updateCamera(){
	camera.position.x = player.location.x + camX
	camera.position.y = player.location.y + camY;
	camera.position.z = player.location.z + camZ;
	camera.lookAt(player.location);

}

function loadingScreen(){
	const loadingScreen = document.createElement('div');
	loadingScreen.id = 'loading-screen';
	document.body.appendChild(loadingScreen);
	const loadingMessage = document.createElement('h1');
	loadingMessage.id = 'loading-message';
	loadingMessage.innerHTML =  loadMessage;
	loadingScreen.appendChild(loadingMessage);
}

function updateLoadingScreen(message){
	const loadingMessage = document.getElementById('loading-message');
	loadingMessage.innerHTML = message;
}

function loadingScreenOff(){
	const loadingScreen = document.getElementById('loading-screen');
	loadingScreen.style.display = 'none';
}

function blastObject(){
	let blast = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}));
	blast.position.set(player.location.x, player.location.y + 5, player.location.z);
	scene.add(blast);
	setTimeout(() => {
		scene.remove(blast);
	}, 10);

}

