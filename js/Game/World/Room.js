import * as THREE from 'three';

export class Room {
	
	constructor(x, z, w, d) {
		this.x = x;
		this.z = z;
		this.w = w;
		this.d = d;

		this.center = new THREE.Vector2(
							x+Math.floor(w/2),
							z+Math.floor(d/2)
							);

		this.maxX = x+w;
		this.maxZ = z+d;

	}

	intersects(room) {
		return !((this.x >= (room.x + room.w)) ||
			((this.x + this.w) <= room.x) ||
			(this.z >= (room.z + room.d)) ||
			((this.z + this.d <= room.z)));
	}

	createSpawnPoint(player) {

		let x = Math.floor(this.x + Math.random() * this.w);
		let z = Math.floor(this.z + Math.random() * this.d);
		return new THREE.Vector3(x, 0, z);
	}

	playerEnter(player){
		if (this.x <= player.x && player.x <= this.maxX &&
			this.z <= player.z && player.z <= this.maxZ) {
			return true;
		}
	}

}