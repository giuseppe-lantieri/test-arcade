import { GameObjects, Physics, Scene } from 'phaser';
import Levels from "./../../public/levels.json";
import Colors from "./../../public/colors_blocks.json";
import { moveImuvableObject } from '../utils';

const PADDEL_WIDTH = 20;
const PADDEL_HEIGHT = 150;
const BALL_SPEED = 600;
const BALL_RADIUS = Math.round(PADDEL_WIDTH / 2.5);
const PADDEL_SPEED = 10;

const CENTER_X = 512;
const CENTER_Y = 384;

const PADDEL_AXIS = CENTER_Y * 2 - PADDEL_WIDTH;
const BALL_AXIS = PADDEL_AXIS - (BALL_RADIUS * 3);

const NUMBER_COLS = 8

export class Arcanoid extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	msg_text: Phaser.GameObjects.Text;

	paddel: GameObjects.Rectangle;
	ball: GameObjects.Arc;
	cursor: Phaser.Types.Input.Keyboard.CursorKeys;
	pause: boolean = false;
	prexVelocity: any;
	keys: any;
	pauseText: GameObjects.Text;
	blocks: Physics.Arcade.StaticGroup;
	level: number;
	r_blocks: number;
	ballRemaing: number;
	ballText: GameObjects.Text;

	constructor() {
		super('Arcanoid');
		this.keys = {}
	}

	create() {
		this.r_blocks = 0;
		this.ballRemaing = 3;

		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);

		this.background = this.add.image(CENTER_X, CENTER_Y, 'background');
		this.background.setAlpha(0.5);
		this.physics.world.setBounds(0, 0, CENTER_X * 2, CENTER_Y * 2);
		this.physics.world.on("worldbounds", this.worldboundsCheck, this);

		this.pauseText = this.add.text(CENTER_X, CENTER_Y, "PAUSE\nesc toggle pause\nq quit\narrow move", {
			fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);
		this.pauseText.setVisible(false);

		this.ballText = this.add.text(CENTER_X, (CENTER_Y / 10), `BALL: ${this.ballRemaing}`, {
			fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
			stroke: '#000000', strokeThickness: 4,
			align: 'center'
		}).setOrigin(0.5);

		let paddel = this.add.rectangle(CENTER_X, PADDEL_AXIS, PADDEL_HEIGHT, PADDEL_WIDTH, 0xffffff, 1);
		this.paddel = this.physics.add.existing(paddel, true);

		let b = this.add.circle(CENTER_X, BALL_AXIS, BALL_RADIUS, 0xffffff);
		this.ball = this.physics.add.existing(b);
		(this.ball.body as Physics.Arcade.Body).setCollideWorldBounds(true);
		(this.ball.body as Physics.Arcade.Body).setBounce(1, 1);
		(this.ball.body as Physics.Arcade.Body).onWorldBounds = true;

		this.physics.add.collider(this.ball, this.paddel, this.reverseBall as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

		if (this.input.keyboard) {
			this.cursor = this.input.keyboard.createCursorKeys();
			this.keys.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
			this.keys.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
		} else {
			alert("No Keyboard founded!");
		}


		this.blocks = this.physics.add.staticGroup();
		this.physics.add.collider(this.ball, this.blocks, this.destroyIt as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

		this.level = 0;
		this.createLevel();
		this.pauseFunction();
	}

	pauseFunction() {
		this.pause = !this.pause;
		if (this.pause) {
			this.prexVelocity = { ...this.ball.body?.velocity };
			(this.ball.body as Physics.Arcade.Body).setVelocity(0, 0);
			this.pauseText.setVisible(true);
		} else {
			(this.ball.body as Physics.Arcade.Body).setVelocity(this.prexVelocity?.x, this.prexVelocity?.y);
			this.pauseText.setVisible(false);
		}
	}

	update(): void {
		if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
			this.pauseFunction();
		}
		if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
			this.scene.start("MainMenu");
		}
		if (this.pause) {
			return;
		}

		if (this.cursor.left.isDown) {
			moveImuvableObject(this.paddel, -PADDEL_SPEED, "x");
		}
		if (this.cursor.right.isDown) {
			moveImuvableObject(this.paddel, PADDEL_SPEED, "x");
		}

	}

	startBall() {
		(this.ball.body as Physics.Arcade.Body).position = new Phaser.Math.Vector2(this.paddel.body?.position.x, BALL_AXIS);
		let velocity = this.physics.velocityFromAngle(90, -BALL_SPEED);
		(this.ball.body as Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
	}

	reverseBall(ball: Phaser.Types.Physics.Arcade.GameObjectWithBody, paddle: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
		let bodyBall = (ball.body as Physics.Arcade.Body);
		let bodyPaddle = (paddle.body as Physics.Arcade.Body);

		const distanceFromCenter = Math.round(Phaser.Math.Distance.BetweenPoints(bodyBall.position, bodyPaddle.position) - (PADDEL_HEIGHT / 2));
		let angle = Math.round((distanceFromCenter * 90) / (PADDEL_HEIGHT / 2)) - 90;
		angle = angle >= 0 ? -45 : angle;
		const newVelocity = this.physics.velocityFromAngle(angle, BALL_SPEED);
		bodyBall.setVelocity(newVelocity.x, newVelocity.y);
	}

	destroyIt(_ball: Phaser.Types.Physics.Arcade.GameObjectWithBody, paddle: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
		paddle.destroy(true);
		this.r_blocks--;
		if (this.r_blocks == 0) {
			this.level++;
			if (this.level < Levels.length)
				this.createLevel();
			else
				this.scene.start("MainMenu");
		}
	}

	createLevel() {
		Levels[this.level].forEach((block, index) => {
			if (block > 0) {
				let blockObject = this.add.rectangle(
					90 + ((index % NUMBER_COLS) * 120),
					100 + (Math.floor(index / NUMBER_COLS) * 30),
					100, 20,
					//@ts-ignore
					Colors[block]);
				this.blocks.add(blockObject);
				this.r_blocks++;
			}
		})
		this.startBall();
	}

	worldboundsCheck(_body: boolean, up: boolean, down: boolean, left: boolean, right: boolean) {
		if (up || left || right) return;
		if (down) {
			this.ballRemaing--;
			this.ballText.setText(`BALL: ${this.ballRemaing}`)
			if (this.ballRemaing > 0)
				this.startBall();
			else this.scene.start("GameOver");
		}
	}
}
