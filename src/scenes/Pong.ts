import { GameObjects, Physics, Scene } from 'phaser';
import { moveImuvableObject } from '../utils';

const PADDEL_WIDTH = 20;
const PADDEL_HEIGHT = 150;
const BALL_SPEED = 500;
const PADDEL_SPEED = 10;

const CENTER_X = 512;
const CENTER_Y = 384;
const RIGHT_PADDEL_AXIS = 1024 - Math.round(PADDEL_WIDTH / 2);

export class Pong extends Scene {
	camera: Phaser.Cameras.Scene2D.Camera;
	background: Phaser.GameObjects.Image;
	msg_text: Phaser.GameObjects.Text;

	left_paddel: GameObjects.Rectangle;
	right_paddel: GameObjects.Rectangle;
	ball: GameObjects.Arc;
	cursor: Phaser.Types.Input.Keyboard.CursorKeys;
	pause: boolean = false;
	prexVelocity: any;
	keys: any;
	pauseText: GameObjects.Text;
	scoreText: GameObjects.Text;
	score: any;

	constructor() {
		super('Pong');
		this.keys = {}
	}

	create() {
		this.camera = this.cameras.main;
		this.camera.setBackgroundColor(0x00ff00);

		this.background = this.add.image(CENTER_X, CENTER_Y, 'background');
		this.background.setAlpha(0.5);
		this.physics.world.setBounds(-10, 0, CENTER_X * 2 + 10, CENTER_Y * 2)
		this.physics.world.on("worldbounds", this.worldboundsCheck, this);

		this.pauseText = this.add.text(CENTER_X, CENTER_Y, "PAUSE\nesc toggle pause\nq quit\narrow move", {
			fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);
		this.pauseText.setVisible(false);

		this.scoreText = this.add.text(CENTER_X, (CENTER_Y / 5), "", {
			fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
			stroke: '#000000', strokeThickness: 8,
			align: 'center'
		}).setOrigin(0.5);

		this.score = [0, 0];
		this.scoreText.setText(this.score.join("-"));


		let l_paddel = this.add.rectangle(Math.round(PADDEL_WIDTH / 2), CENTER_Y, PADDEL_WIDTH, PADDEL_HEIGHT, 0xffffff);
		let r_paddel = this.add.rectangle(RIGHT_PADDEL_AXIS, CENTER_Y, PADDEL_WIDTH, PADDEL_HEIGHT, 0xffffff);
		this.left_paddel = this.physics.add.existing(l_paddel, true);
		this.right_paddel = this.physics.add.existing(r_paddel, true);

		let b = this.add.circle(CENTER_X, CENTER_Y, Math.round(PADDEL_WIDTH / 2.5), 0xffffff);
		this.ball = this.physics.add.existing(b);
		(this.ball.body as Physics.Arcade.Body).setCollideWorldBounds(true);
		(this.ball.body as Physics.Arcade.Body).setBounce(1, 1);
		(this.ball.body as Physics.Arcade.Body).onWorldBounds = true;
		this.startBall();

		this.physics.add.collider(this.ball, this.left_paddel, this.reverseBall as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
		this.physics.add.collider(this.ball, this.right_paddel, this.reverseBall as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

		if (this.input.keyboard) {
			this.cursor = this.input.keyboard.createCursorKeys();
			this.keys.esc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
			this.keys.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
		} else {
			alert("No Keyboard founded!");
		}

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
		if (this.cursor.up.isDown) {
			moveImuvableObject(this.left_paddel, -PADDEL_SPEED, "y");
		}

		if (this.cursor.down.isDown) {
			moveImuvableObject(this.left_paddel, PADDEL_SPEED, "y");
		}

		this.enemyIA();
	}

	reverseBall(ball: Phaser.Types.Physics.Arcade.GameObjectWithBody, paddle: Phaser.Types.Physics.Arcade.GameObjectWithBody) {
		let bodyBall = (ball.body as Physics.Arcade.Body);
		let bodyPaddle = (paddle.body as Physics.Arcade.Body);
		const distanceFromCenter = Math.round(Phaser.Math.Distance.BetweenPoints(bodyBall.position, bodyPaddle.position) - (PADDEL_HEIGHT / 2));
		let angle = Math.round((distanceFromCenter * 90) / (PADDEL_HEIGHT / 2));
		const newVelocity = this.physics.velocityFromAngle(angle, BALL_SPEED);
		bodyBall.setVelocity(
			bodyBall.position.x > CENTER_X ? -newVelocity.x : newVelocity.x,
			newVelocity.y);
	}


	enemyIA() {
		const ballPostition = this.ball.body?.position ?? { x: 0, y: 0 };
		const paddlePostition = this.right_paddel.body?.position ?? { x: 0, y: 0 };
		const ballDirection = this.ball.body?.velocity.x ?? 0;
		if (
			Math.abs(paddlePostition.y - ballPostition.y) > 20
			&&
			ballDirection > 0
		) {
			if (paddlePostition.y - ballPostition.y > 0)
				moveImuvableObject(this.right_paddel, -PADDEL_SPEED, "y");
			else
				moveImuvableObject(this.right_paddel, PADDEL_SPEED, "y");
		}
	}

	startBall() {
		(this.ball.body as Physics.Arcade.Body).position = new Phaser.Math.Vector2(CENTER_X, CENTER_Y);
		let random = Math.random();
		let angle = random <= 0.50 ? Phaser.Math.Between(-45, 45) : Phaser.Math.Between(135, 225)
		let velocity = this.physics.velocityFromAngle(angle, -BALL_SPEED);
		(this.ball.body as Physics.Arcade.Body).setVelocity(velocity.x, velocity.y);
	}

	worldboundsCheck(_body: boolean, up: boolean, down: boolean, left: boolean, right: boolean) {
		if (up || down) return;
		if (left) {
			this.score[1]++;
			this.scoreText.setText(this.score.join("-"));
			if (this.score[1] == 10) {
				this.scene.start("GameOver");
			}
		}
		if (right) {
			this.score[0]++;
			this.scoreText.setText(this.score.join("-"));
			if (this.score[0] == 10) {
				this.scene.start("MainMenu");
			}
		}
		this.startBall();
	}

}

