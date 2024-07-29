import * as THREE from 'three';
import { VectorUtil } from '../../Util/VectorUtil.js';
import { Character } from './Character.js';
import { NPC } from './NPC.js';
import { State } from './State.js';

export class PET extends NPC {

	// Character Constructor
	constructor(mColor) {

		super(mColor);

        this.state = new IdleState();

		this.state.enterState(this);

		this.attacking = false;
		this.damage = 1;
		this.idle=false;

	}

    switchState(state) {
		this.state = state;
		this.state.enterState(this);
	}

	update(deltaTime, gameMap, player) {
		this.state.updateState(this, player, gameMap);
		super.update(deltaTime, gameMap);
	}


}

export class IdleState extends State {

	enterState(pet) {
		pet.topSpeed = 0;
	}

	updateState(pet, player, gameMap) {
		if (pet.location.distanceTo(player.location) > 8) {
			pet.switchState(new FollowState());
		}
	}

}


export class FollowState extends State {

	enterState(pet) {
		pet.topSpeed = 20;
	}

	updateState(pet, player, gameMap) {

		if (pet.location.distanceTo(player.location) < 8) {
			pet.switchState(new IdleState());
		} else {
            pet.applyForce(pet.followPlayer(gameMap, player));
		}	
	}
  
}

// export class AttackState extends State {

// 	enterState(pet) {
// 		pet.topSpeed = 20;
// 	}

// 	updateState(pet, enemy) {

// 		if (!this.attacking) {
// 			pet.switchState(new FollowState());
// 		} else {	
// 			if(enemy.location.distanceTo(pet.location) >= 1 && enemy.location.distanceTo(pet.location) <= 5){
// 				pet.applyForce(pet.arrive(enemy.location, 3));
// 			}else{
// 				this.attacking = false;}


// 		}	
// 	}
  
// }



