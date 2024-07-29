import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Character } from './Character.js';

export class NPC extends Character {

	// Character Constructor
	constructor(mColor) {

		super(mColor);

		this.segment = 0;
		this.path = [];
	}


	// Seek steering behaviour
	seek(target) {
		let desired = new THREE.Vector3();
		desired.subVectors(target, this.location);
		desired.setLength(this.topSpeed);

		let steer = new THREE.Vector3();
		steer.subVectors(desired, this.velocity);

	
		return steer;
	}

	// Arrive steering behaviour
	arrive(target, radius) {
		let desired = VectorUtil.sub(target, this.location);

		let distance = desired.length();

		if (distance < radius) {
			let speed = 0;
			desired.setLength(speed);
			
		} else {
			desired.setLength(this.topSpeed);
		} 

		let steer = VectorUtil.sub(desired, this.velocity);

		return steer;
	}

	wander() {
		let d = 10;
		let r = 10;
		let a = 0.3;

		let predVel = this.velocity.clone();
		predVel.setLength(d);
		let futureLocation = this.location.clone();
		futureLocation.add(predVel);
		if(this.wanderAngle == null){
		this.wanderAngle = Math.random()*2*Math.PI;
		}
		else{
		this.wanderAngle +=Math.random()*(a+a)-a;
		}
		let x = r * Math.sin(this.wanderAngle);
		let z = r * Math.cos(this.wanderAngle);
		let prediction = new THREE.Vector3(x,0,z);
		futureLocation.add(prediction);

		return this.seek(futureLocation);
	}

	simpleFollow(gameMap) {

		let steer = new THREE.Vector3();

		let goTo = gameMap.localize(this.path[this.segment]);

		let distance = goTo.distanceTo(this.location);

		if (distance < gameMap.tileSize/2) {

			if (this.segment == this.path.length-1) {
				steer = this.arrive(goTo, gameMap.tileSize/2);
			} else {
				this.segment++;
			}
		
		} else {
			steer = this.seek(goTo);
		}

		return steer;
	}


	followPlayer(gameMap, player) {

		let playerNode = gameMap.quantize(player.location);
		let npcNode = gameMap.quantize(this.location);

		if (npcNode == playerNode) {
			return this.arrive(player.location, gameMap.tileSize/2);
		} 
		else if (playerNode != this.path[this.path.length-1]) {
			this.path = gameMap.astar(npcNode, playerNode);
			this.segment = 1;
		}
		return this.simpleFollow(gameMap);

	}



}