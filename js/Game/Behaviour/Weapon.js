import { Character } from "./Character";
import * as THREE from 'three';
export class Weapon extends Character {

    constructor(mColor) {
        super(mColor);
        this.damage = 1;
    }
}