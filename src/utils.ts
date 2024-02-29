import { Physics } from "phaser";

export function moveImuvableObject(object: Phaser.GameObjects.Shape, movement: number, axis: "x" | "y") {
	let body = (object.body as Physics.Arcade.StaticBody);
	object[axis] += movement;
	body.updateFromGameObject();
}
