import { TileNode } from './TileNode';
import * as THREE from 'three';
import { MapRenderer } from './MapRenderer';
import { Graph } from './Graph';
import { PriorityQueue } from '../../Util/PriorityQueue';
import { VectorUtil } from '../../Util/VectorUtil';
import { DungeonGenerator } from './DungeonGenerator';


export class GameMap {
	
	// Constructor for our GameMap class
	constructor() {

		this.width = 600;
		this.depth = 300;
	

		this.start = new THREE.Vector3(this.width/2,0,this.depth/2);

		// We also need to define a tile size 
		// for our tile based map
		this.tileSize = 5;

		// Get our columns and rows based on
		// width, depth and tile size
		this.cols = this.width/this.tileSize;
		this.rows = this.depth/this.tileSize;

		// Create our graph
		// Which is an array of nodes
		this.graph = new Graph(this.tileSize, this.cols, this.rows);

		// Create our map renderer
		this.mapRenderer = new MapRenderer();

		this.rooms = [];
		this.hallways = [];


	}

	// initialize the GameMap
	init(scene) {
		this.scene = scene; 

		let dungeon = new DungeonGenerator(this);
		dungeon.generate();
		this.graph.initGraph(dungeon.grid);
		this.rooms = dungeon.rooms;
		// Set the game object to our rendering
		this.gameObject = this.mapRenderer.createRendering(this);
	}

	// Method to get location from a node
	localize(node) {
		let x = this.start.x+(node.x*this.tileSize)+this.tileSize*0.5;
		let y = this.tileSize;
		let z = this.start.z+(node.z*this.tileSize)+this.tileSize*0.5;

		return new THREE.Vector3(x,y,z);
	}

	// Method to get node from a location
	quantize(location) {
		let x = Math.floor((location.x - this.start.x)/this.tileSize);
		let z = Math.floor((location.z - this.start.z)/this.tileSize);
		
		return this.graph.getNode(x,z);
	}

	manhattanDistance(node, end) {
		let nodePos = this.localize(node);
		let endPos = this.localize(end)

		let dx = Math.abs(nodePos.x - endPos.x);
		let dz = Math.abs(nodePos.z - endPos.z);
	 	return dx + dz;

	}

	backtrack(start, end, parents) {
		let node = end;
		let path = [];
		path.push(node);
		while (node != start) {
			path.push(parents[node.id]);
			node = parents[node.id];
		}

		return path.reverse();
	}

	astar(start, end) {
		let open = new PriorityQueue();
		let closed = [];

		open.enqueue(start, 0);

		// For the cheapest node "parent" and 
		// the cost of traversing that path
		let parent = [];
		let g = [];

		// Start by populating our table
		for (let node of this.graph.nodes) {
			if (node == start) {
				g[node.id] = 0;
			} else {
				g[node.id] = Number.MAX_VALUE;
			}
			parent[node.id] = null;
		}


		// Start our loop
		while (!open.isEmpty()) {

			
			let current = open.dequeue();
			closed.push(current);
			

			if (current == end) {
				return this.backtrack(start, end, parent);
			}
			
			for (let i in current.edges) {

				let neighbour = current.edges[i];
				let pathCost = neighbour.cost + g[current.id];

				if (pathCost < g[neighbour.node.id]) {

					parent[neighbour.node.id] = current;
					g[neighbour.node.id] = pathCost;
							
					if (!closed.includes(neighbour.node)) {
						
						if (open.includes(neighbour.node)) {
							open.remove(neighbour.node);
						}

						let f = g[neighbour.node.id] + this.manhattanDistance(neighbour.node, end);
						open.enqueue(neighbour.node, f);
					}
				}
			}
		}
		return null;
	}


	
}




















