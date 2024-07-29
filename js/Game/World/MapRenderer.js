import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { TileNode } from './TileNode.js'

export class MapRenderer {

	constructor() {
	
	}

	createRendering(gameMap) {
		this.gameMap = gameMap;

		this.groundGeometries = new THREE.BoxGeometry(0, 0, 0);
		this.obstacleGeometries = new THREE.BoxGeometry(0,0,0);
		this.doorGeometries = new THREE.BoxGeometry(0,0,0);
	
		// Iterate over all of the 
		// indices in our graph
		for (let node of this.gameMap.graph.nodes) {
			
			if (node.type != TileNode.Type.Ground) {
				this.createTile(node);
			}
		}

		let tiles = new THREE.TextureLoader().load('textures/SmallRock_Tex.png');
		let material = new THREE.MeshBasicMaterial({ map: tiles });
		let groundGeometry = this.makeGroundGeometry(); 
		let ground = new THREE.Mesh(groundGeometry, material);
		ground.position.set(this.gameMap.width, 0, this.gameMap.depth);
		
		let walls = new THREE.TextureLoader().load('textures/StoneTexture.png');
		let wallMaterial = new THREE.MeshBasicMaterial({ map: walls });
		let obstacles = new THREE.Mesh(this.obstacleGeometries, wallMaterial);
	
		let door = new THREE.TextureLoader().load('textures/StoneDoor.png');
		let doorMaterial = new THREE.MeshBasicMaterial({ map: door });
		let doors = new THREE.Mesh(this.doorGeometries, doorMaterial);

		let gameObject = new THREE.Group();
		
		gameObject.add(ground);
		gameObject.add(obstacles);
		gameObject.add(doors);

		return gameObject;
	}

	makeGroundGeometry() {
		let width = this.gameMap.tileSize * this.gameMap.cols;
		let height = this.gameMap.tileSize;
		let depth = this.gameMap.tileSize * this.gameMap.rows;

		let geometry = new THREE.BoxGeometry(width, height, depth);
		return geometry;
	}

	createTile(node) {

		let x = (node.x * this.gameMap.tileSize) + this.gameMap.start.x;
		let y = this.gameMap.tileSize;
		let z = (node.z * this.gameMap.tileSize) + this.gameMap.start.z;

		let height = this.gameMap.tileSize*2;

		let geometry = new THREE.BoxGeometry(this.gameMap.tileSize,
											 height, 
											 this.gameMap.tileSize);
		geometry.translate(x + 0.5 * this.gameMap.tileSize,
						   y + 0.5 * this.gameMap.tileSize,
						   z + 0.5 * this.gameMap.tileSize);

		if (node.type === TileNode.Type.Obstacle) {
			this.obstacleGeometries = BufferGeometryUtils.mergeGeometries(
										[this.obstacleGeometries,
										geometry]
									);
		} 

		else if (node.type === TileNode.Type.Door) {
			this.doorGeometries = BufferGeometryUtils.mergeGeometries(
										[this.doorGeometries,
										geometry]
									);
		}

	}

}