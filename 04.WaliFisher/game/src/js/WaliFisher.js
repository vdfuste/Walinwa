//#region VARIABLES
// SERVER
const GAME_5_URL_SOURCE = "http://dev.walinwa.net/waliApi";
const GAME_5_ID_USER = 9684;
const GAME_5_VERSION = 0;

let GAME_5_SCORE = 0;
let GAME_5_WALIS = 0;

//let URL_WORDS = GAME_5_URL_SOURCE + "/api/game1/getWords/idUser/" + GAME_5_ID_USER + "/idGame/1";
//let data = game.http.getJsonByURL(URL_WORDS, false);
//let WORDS = { phrase: data.enunciado, corrects: data.palabrasOk, incorrects: data.palabrasErr };
const WORDS = {
	phrase: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae nisl consequat, mattis neque in, vestibulum nibh.",
	corrects: ["Good_01", "Good_02", "Good_03", "Good_04"],
	incorrects: ["Bad_01", "Bad_02", "Bad_03", "Bad_04"]
};
let dataSaved = false;

// GAME
const screenWidth = 1280;
const screenHeight = 720;
const speedAnimation = 4;
const points = 10;
let lifes = GAME_5_VERSION === 0 ? 2 : 5;
let play = true;
let relayCounter = 0;
let globalSpeed = 1;

const MIN_HEIGHT_HOOK = 250;
const MAX_HEIGHT_HOOK = screenHeight - 50;

const axisYRotationBubbles = screenHeight / 2 + 100;
const radiusRotationBubbles = 150;
let correctWordPointer = parseInt(Math.random() * WORDS.corrects.length);
let incorrectWordPointer = parseInt(Math.random() * WORDS.incorrects.length);
let bubblesPointer = 0;

// ATLAS TEXTURE
const atlasTexture = game.files.createTexture("atlas_v2.png");
//#endregion

//#region CLASSES & ENUMS
const PlayerState = {
	CHECKING: "Checking",
	FISHING: "Fishing",
	BONUS: "Bonus",
}
const HookState = {
	ROLL_DOWN: "Roll down",
	ROLL_UP: "Roll up",
	DAMAGE: "Damage",
}
const FishType = {
	SMALL: "Small",
	MEDIUM: "Medium",
	BIG: "Big",
	PENGUIN: "Penguin",
};

class Player extends DrawableObject {
	constructor() {
		super(new Rect(830, 0, 230, 198), new Rect(0, 0, 230, 198));
		this.endLine = new Point(screenWidth / 2, 200);
		this.hook = new Hook(this.endLine.x, this.endLine.y + 70, null);
		this.hand = new Hand();
		this.state = PlayerState.CHECKING;
		this.target = null;
		this.frame = 0;
		//this.counter = 0;
		this.damage = false;
	}

	update() {
		switch (this.state) {
			case PlayerState.CHECKING:

				// Check if there is any target, if not the target is assigned
				if (this.target === null) {
					//this.setNewTarget();

					// Reset
					this.state = PlayerState.FISHING;
					this.hook.state = HookState.ROLL_DOWN;
					this.hook.fishHooked = null;
				}
				else {
					// Check if the hooked fish is the same as the target
					if (this.target === this.hook.fishHooked.type) {
						GAME_5_SCORE += this.hook.fishHooked.score;
						recalculateCoins();

						updateScore(GAME_5_SCORE);
						updateCoins(GAME_5_WALIS);
					}

					this.setNewTarget();

					// Check if there is any fish to catch, if not the state change to BONUS
					if (this.target !== "bonus") {
						// Reset
						this.state = PlayerState.FISHING;
						this.hook.state = HookState.ROLL_DOWN;
						this.hook.fishHooked = null;
					}
					else {
						this.state = PlayerState.BONUS;
						console.log("BONUS");
					}
				}

				this.setNewTarget();
				if (globalSpeed < 3.5) globalSpeed += 0.1;

				// Change the frame to the first one
				this.imgRect.pos.x = 0;

				break;
			case PlayerState.FISHING:
				this.hook.update();

				switch (this.hook.state) {
					case HookState.ROLL_UP:
						if (this.hook.bottom.y <= MIN_HEIGHT_HOOK) {
							this.state = PlayerState.CHECKING;
							this.hook.powerUpActivated = false;

							// Change the frame to the first one
							this.imgRect.pos.x = 0;
							this.hand.center = new Point(900, 125);
						}

						// Hand animation
						let speed = this.hook.fishHooked.type === FishType.BIG ? 2.5 : (this.hook.fishHooked.type === FishType.MEDIUM ? 1.7 : 1);
						this.hand.spin(this.hook.isDown() ? -1 : 0, speed);

						// Check penguin collision
						if (!this.hook.powerUpActivated) {
							for (let i = 0; i < fishes.length; i++) {
								if (fishes[i].type === FishType.PENGUIN && fishes[i].isHooked(this.hook)) {
									lifes--;

									fishes[i].eatFish();

									this.hook.fishHooked = null;
									this.hook.state = HookState.DAMAGE;
									//this.damage = false;

									// Change the frame to the first one
									this.imgRect.pos.x = 0;
									this.hand.center = new Point(900, 125);

									this.setNewTarget();

									i = fishes.length;
								}
							}
						}

						break;
					case HookState.ROLL_DOWN:
						// Check if any bonus bubble is touched 
						for (let i = 0; i < bonusBubbles.length; i++) {
							if (bonusBubbles[i].touched(this.hook.bottom)) {
								GAME_5_SCORE += bonusBubbles[i].correct ? 100 : -50;
								bonusBubbles[i].visible = false;
							}
						}

						// Hand animation
						if (this.hook.bottom.y > MIN_HEIGHT_HOOK)
							this.hand.spin(this.hook.isDown() ? 1 : -1);

						// Check if any fish is hooked
						for (let i = 0; i < fishes.length; i++) {
							if (fishes[i].isHooked(this.hook)) {
								if (fishes[i].type === FishType.PENGUIN) {
									lifes--;

									this.hook.fishHooked = null;
									this.hook.state = HookState.DAMAGE;
									//this.damage = false;
									return;
								}

								// Save the hooked fish
								this.hook.fishHooked = fishes[i];
								this.hook.state = HookState.ROLL_UP;

								// Change the frame based on the type of the fish
								switch (this.hook.fishHooked.type) {
									case FishType.MEDIUM:
										this.imgRect.pos.x = 230 * 1;
										this.hand.center = new Point(920, 90);
										break;
									case FishType.BIG:
										this.imgRect.pos.x = 230 * 2;
										this.hand.center = new Point(945, 90);
										break;
								}

								// Add a new fish
								addNewFish(i);

								i = fishes.length;
							}
						}

						break;
					case HookState.DAMAGE:
						if (!this.damage) {
							console.log("Damage!!!!")

							setTimeout(() => {
								this.hook.state = HookState.ROLL_DOWN;
								this.damage = false;
							}, 1000);

							this.damage = true;
						}

						break;
				}

				// Check if any regular bubble is touched
				for (let i = 0; i < bubbles.length; i++) {
					if (bubbles[i].touched(this.hook.bottom)) {
						bubbles[i].visible = false;

						GAME_5_SCORE += bubbles[i].correct ? 50 : -10;
						if (GAME_5_SCORE < 0) GAME_5_SCORE = 0;

						updateScore(GAME_5_SCORE);
					}
				}

				break;
			case PlayerState.BONUS:

				bonusBubbles = [
					new Bubble(screenHeight + 100, WORDS.corrects[(++correctWordPointer).overflow(WORDS.corrects.length)], true, true),
					new Bubble(screenHeight + 200, WORDS.incorrects[(++incorrectWordPointer).overflow(WORDS.incorrects.length)], false, true),
					new Bubble(screenHeight + 300, WORDS.corrects[(++correctWordPointer).overflow(WORDS.corrects.length)], true, true),
					new Bubble(screenHeight + 400, WORDS.incorrects[(++incorrectWordPointer).overflow(WORDS.incorrects.length)], false, true),
					new Bubble(screenHeight + 500, WORDS.corrects[(++correctWordPointer).overflow(WORDS.corrects.length)], true, true),
					new Bubble(screenHeight + 600, WORDS.incorrects[(++incorrectWordPointer).overflow(WORDS.incorrects.length)], false, true),
					new Bubble(screenHeight + 700, WORDS.corrects[(++correctWordPointer).overflow(WORDS.corrects.length)], true, true),
				];

				setTimeout(() => {
					bonusBubbles = [];

					for (let i = 0; i < fishes.length; i++) {
						const x = -200;
						const y = 300 + 100 * i;
						const type = getFishType();
						const direction = i % 2 == 0 ? 1 : -1;

						fishes[i] = new Fish(x, y, type, direction);
					}

					this.setNewTarget();
				}, 15000);

				this.state = PlayerState.FISHING;
				this.hook.state = HookState.ROLL_DOWN;
				this.hook.fishHooked = null;

				break;
		}
	}

	draw() {
		this.hand.draw(atlasTexture);
		super.draw(atlasTexture);

		// Draw Thread and Hook
		game.draw.line(this.endLine.x, this.endLine.y, 837, 25, 2);
		this.hook.draw();

		// Draw Target Dialog
		game.draw.imageRegionR(atlasTexture, new Rect(1020, 70, 240, 177), new Rect(1579, 268, 240, 177));
		switch (this.target) {
			case FishType.SMALL:
				game.draw.imageRegionR(atlasTexture, new Rect(1100, 100, 90, 110), new Rect(90, 350, 90, 110));
				break;
			case FishType.MEDIUM:
				game.draw.imageRegionR(atlasTexture, new Rect(1070, 110, 140, 90), new Rect(140, 200, 140, 90));
				break;
			case FishType.BIG:
				game.draw.imageRegionR(atlasTexture, new Rect(1080, 100, 120, 100), new Rect(0, 500, 150, 120));
				break;
		}
	}

	setNewTarget() {
		const availableTargets = [];

		for (let i = 0; i < fishes.length; i++) {
			if (fishes[i].type !== FishType.PENGUIN) availableTargets.push(fishes[i].type);
		}

		if (availableTargets.length === 0) {
			this.target = "bonus";
			return;
		}

		const nextTarget = Math.floor(Math.random() * availableTargets.length);
		const nextType = availableTargets[nextTarget];

		this.target = nextType;
	}
}

class Hand extends DrawableObject {
	constructor() {
		super(new Rect(0, 0, 56, 45), new Rect(750, 0, 56, 45));
		this.center = new Point(900, 125);
		this.time = 180;
		this.radius = 8;

		this.spin(1);
	}

	spin(direction, speed = 1) {
		this.pos.x = this.center.x + Math.cos(game.math.toRadians(this.time)) * this.radius;
		this.pos.y = this.center.y + Math.sin(game.math.toRadians(this.time)) * this.radius;

		this.time -= 10 * speed * direction;
	}
}

class Hook extends ColliderObject {
	constructor(x, y) {
		super(new Rect(0, 0, 42, 54), new Rect(1500, 100, 83, 108));
		this.top = new Point(x, y - 70);
		this.bottom = new Point(x, MIN_HEIGHT_HOOK);
		this.state = HookState.ROLL_DOWN;
		this.speed = 5;
		this.powerUpActivated = false;

		this.rotation = 0;
		this.rotateTo = 0;
		this.speedRotation = 10;

		this.fishHooked = null;
		//this.isUp = false;
		this.bubblesCounter = 0;

		this.counter = 0;
	}

	update() {
		//this.isUp = true;

		switch (this.state) {
			case HookState.ROLL_UP:

				// Up and down hook movement
				if (this.powerUpActivated) {
					if (this.bottom.y > MIN_HEIGHT_HOOK - 10) {
						this.bottom.y -= 10;
					}
				}
				else if (this.isDown()) {
					// Up movement
					let _speed = this.speed * (globalSpeed * 0.75);

					// The bigger the fish, the slower the movement
					switch (this.fishHooked.type) {
						default:
						case FishType.SMALL: _speed /= 1; break;
						case FishType.MEDIUM: _speed /= 2; break;
						case FishType.BIG: _speed /= 3; break;
					}

					if (this.bottom.y > MIN_HEIGHT_HOOK - _speed) {
						this.bottom.y -= _speed;
					}
				}
				else {
					// Down movement
					if (this.bottom.y < MAX_HEIGHT_HOOK + this.speed * (globalSpeed * 0.75)) {
						this.bottom.y += this.speed;
					}
				}

				break;
			case HookState.ROLL_DOWN:
			case HookState.DAMAGE:

				// Up and down hook movement
				if (this.isDown()) {
					// Down movement
					if (this.bottom.y < MAX_HEIGHT_HOOK + this.speed * (globalSpeed * 0.5)) {
						this.bottom.y += this.speed * (globalSpeed * 0.5);
						this.rotateTo = 90;
					}
					else this.rotateTo = 0;
				}
				else {
					// Up movement
					if (this.bottom.y > MIN_HEIGHT_HOOK - this.speed * (globalSpeed * 0.5)) {
						this.bottom.y -= this.speed * (globalSpeed * 0.5);
						this.rotateTo = -30;
					}
					else this.rotateTo = 0;
				}


				// Hook rotation
				if (this.rotation < this.rotateTo) this.rotation += this.speedRotation;
				else if (this.rotation > this.rotateTo) this.rotation -= this.speedRotation;


				/*/ When bubblesCounter is 10 a bubble is added
				if (this.bubblesCounter++ === 10) this.bubblesCounter = 0;

				// Reset the rotation acceleration when the hook change the direction
				if (game.inputs.mouse.isMousePress() || (this.isUp && !game.inputs.mouse.isMouseDown())) {
					this.accelAngle = 0;
				}

				// Up and down logic
				if ((game.inputs.mouse.isMouseDown() || game.inputs.keypad.isKeyDown(game.utils.keycode.space) || game.inputs.keypad.isKeyDown(game.utils.keycode.down))) {
					this.isUp = true;

					if (this.bottom.y < MAX_HEIGHT_HOOK) {
						this.bottom.y += this.speed;

						// Add a bubble
						if (this.bubblesCounter === 0) addMiniBubble(this.bottom.x - 24, this.bottom.y - 12, randomRange(-5, 5));
					}

					// if (this.angle < 120) {
					// 	this.angle += 10 * this.accelAngle;
					// 	if (this.accelAngle < 1) this.accelAngle += 0.025;
					// }
				}
				else if (this.bottom.y > MIN_HEIGHT_HOOK - this.speed) {
					this.isUp = false;

					// this.bottom.y -= this.speed * this.accelAngle;
					// if (this.angle > 0) {
					// 	this.angle -= 10 * this.accelAngle;
					// 	if (this.accelAngle < 1) this.accelAngle += 0.025;
					// }

					// Add a bubble
					if (this.bubblesCounter === 0) addMiniBubble(this.bottom.x - 24, this.bottom.y - 12, 0, 5);
				}*/
				break;
		}
	}

	draw() {
		game.draw.line(this.top.x, this.top.y, this.bottom.x, this.bottom.y + 4, 2);

		if (this.state !== HookState.DAMAGE) {

			if (this.fishHooked === null) {
				game.draw.rotate(this.bottom.x, this.bottom.y, 30, 6, this.rotation);
				super.draw(atlasTexture);
				game.draw.stopRotate();
			}
			else {
				game.draw.rotate(this.bottom.x, this.bottom.y, this.fishHooked.width + 12, this.fishHooked.height / 2 + 12, -45);
				game.draw.imageRegionR(atlasTexture, new Rect(0, 0, this.fishHooked.width, this.fishHooked.height), this.fishHooked.imgRect);
				game.draw.stopRotate();
			}
		}
		else {
			if (this.counter++ % 2 === 0) {
				game.draw.rotate(this.bottom.x, this.bottom.y, 30, 6, this.rotation);
				super.draw(atlasTexture);
				game.draw.stopRotate();
			}
		}

		//game.draw.rectLineR(this.getCollider());
		//game.draw.rect(this.bottom.x, this.bottom.y, 12, 12)
	}

	getCollider() {
		return new Rect(this.bottom.x - 12, this.bottom.y - 6, 24, 32);
	}

	isDown() {
		return (game.inputs.mouse.isMouseDown() || game.inputs.keypad.isKeyDown(game.utils.keycode.space) || game.inputs.keypad.isKeyDown(game.utils.keycode.down));
	}
}

class Fish extends ColliderObject {
	constructor(x, y, type, direction = 1) {
		switch (type) {
			default:
			case FishType.SMALL:
				super(new Rect(x, y, 90, 110), new Rect(0, 350, 90, 110));
				this.collider = new Rect(direction === 1 ? 56 : 0, 42, 32, 48);
				this.score = 50;
				break;
			case FishType.MEDIUM:
				super(new Rect(x, y, 140, 90), new Rect(0, 200, 140, 90));
				this.collider = new Rect(direction === 1 ? 96 : 12, 24, 32, 48);
				this.score = 100;
				break;
			case FishType.BIG:
				super(new Rect(x, y, 150, 120), new Rect(0, 500, 150, 120));
				this.collider = new Rect(direction === 1 ? 100 : 12, 32, 32, 64);
				this.score = 250;
				break;
			case FishType.PENGUIN:
				super(new Rect(x, y, 280, 134), new Rect(0, 650, 280, 134));
				this.collider = new Rect(32, 32, 200, 64);
				this.score = -50;
				this.eating = false;
				break;
		}

		this.type = type;
		this.y = y;
		this.direction = direction;
		this.t = Math.random();
		this.frame = 0;
		this.counter = 0;
		this.animCounter = 0;
	}

	update() {
		// Movement
		this.pos.x += 4 * this.direction * globalSpeed;
		this.pos.y = this.y + Math.sin(this.t * (180 * Math.PI) / 10) * 5;
		this.t += 0.001;

		// Bounds
		if (this.direction === 1 && this.pos.x > screenWidth + 200) {
			this.pos.x = -200;
		}
		else if (this.direction === -1 && this.pos.x < -200) {
			this.pos.x = screenWidth + 200;
		}

		// Animation
		if (this.eating && this.type === FishType.PENGUIN) {
			if (this.animCounter++ === 8) {
				this.imgRect.pos.x = this.imgRect.width * this.frame++;


				if (this.frame === 4) {
					this.eating = false;
					this.frame = 0;

					this.pos.x += 60;
					this.pos.y += 250;
					this.width = 280;
					this.height = 134;
					this.imgRect = new Rect(0, 650, this.width, this.height);
				}

				this.animCounter = 0;
			}
		}
		else {
			if (this.animCounter++ === 8) {
				this.imgRect.pos.x = this.imgRect.width * this.frame++;
				if (this.frame === 4) this.frame = 0;
				this.animCounter = 0;
			}
		}

		// Bubbles
		if (this.counter++ === 10) {
			addMiniBubble(this.pos.x, this.pos.y + this.height / 2, -this.direction * 8, 0);
			this.counter = 0;
		}
	}

	draw() {
		super.draw(atlasTexture, this.direction === -1);
		//game.draw.rectLineR(this.getCollider());
	}

	isHooked(hook) {
		return game.physics.checkColRectangles(this.getCollider(), hook.getCollider());
	}

	eatFish() {
		this.eating = true;
		this.animCounter = 0;
		this.frame = 0;

		this.pos.x -= 60;
		this.pos.y -= 250;
		this.width = 400;
		this.height = 230;
		this.imgRect = new Rect(0, 784, this.width, this.height);
	}
}

class MiniBubble extends DrawableObject {
	constructor(x, y, velX = 0, velY = 0) {
		super(new Rect(x, y + (Math.random() * 20 - 10), 20, 20), new Rect(1552, 24, 23, 23));
		this.speed = Math.random() + 1;
		this.velX = velX;
		this.velY = velY;
		this.t = Math.random() * 90;
	}

	update(index) {
		// Vertical movement
		if (this.pos.y > 300) {
			this.pos.y -= this.speed - this.velY;

			if (this.velY >= 0.01) this.velY -= this.velY / 10;
			else this.velY = 0;
		}
		else miniBubbles.popByIndex(index);

		// Horizontal movement
		if (Math.abs(this.velX) >= 0.01) {
			this.pos.x += this.velX;
			this.velX -= this.velX / 10;
		}
		else this.pos.x += Math.sin(this.t++ / 20) / 2;

		// Scale
		this.width += Math.sin(this.t++ / 20) / 2;
		this.height += Math.sin(this.t++ / 20) / 2;
	}

	draw() {
		super.draw(atlasTexture);
	}
}

class Bubble extends ColliderObject {
	constructor(y, text, correct, bonus = false) {
		super(new Rect(screenWidth / 2 - 50, y, 100, 100), new Rect(1600, 12, 210, 210));
		this.rotating = false;
		this.rotation = 0;
		this.text = text;
		this.correct = correct;
		this.visible = true;
		this.bonus = bonus;
		this.posY = 0;

		this.direction = Math.random() > 0.5 ? 1 : -1;
		if (!bonus) {
			this.pos.x = this.direction === 1 ? -200 : screenWidth + 200;
			this.pos.y = Math.random() * (MAX_HEIGHT_HOOK - MIN_HEIGHT_HOOK) + MIN_HEIGHT_HOOK;
			this.posY = this.pos.y;
		}
	}

	update() {
		if (this.visible) {
			if (this.bonus) {
				if (!this.rotating) {
					if (this.pos.y > axisYRotationBubbles + radiusRotationBubbles) this.pos.y -= 2;
					else this.rotating = true;
				}
				else {
					this.rotation++;

					this.pos.x = screenWidth / 2 - 50 + (Math.cos(game.math.toRadians(this.rotation - 90)) * radiusRotationBubbles * 1.2);
					this.pos.y = axisYRotationBubbles + (Math.sin(game.math.toRadians(this.rotation + 90)) * radiusRotationBubbles);
				}
			}
			else {
				this.pos.x += 2 * this.direction * globalSpeed;
				this.pos.y = this.posY + Math.sin(game.math.toRadians(this.rotation++)) * 30;

				if (this.pos.x < -300 || this.pos.x > screenWidth + 300) this.visible = false;
			}
		}
	}

	draw() {
		if (this.visible) {
			super.draw(atlasTexture);
			game.draw.text(this.text, this.pos.x + 50 + 2, this.pos.y + 50 + 10, 16, "#000", "center");
			game.draw.text(this.text, this.pos.x + 50, this.pos.y + 50 + 8, 16, "#fff", "center");
			//game.draw.circleLineC(this.getCollider());
		}
	}

	getCollider() {
		return new Circle(new Point(this.pos.x + 50, this.pos.y + 55), 45);
	}

	touched(hook) {
		return this.visible && game.physics.checkColPointCircle(hook, this.getCollider());
	}
}

class Background {
	constructor() {
		this.height = MIN_HEIGHT_HOOK + 10;
		this.counter = 0;
		this.frame = 0;
	}

	update() {
		if (this.counter++ === 12) {
			this.counter = 0;
			this.frame++;
		}
	}

	draw() {
		// Background
		game.draw.imageRegionR(atlasTexture, new Rect(0, 0, screenWidth, this.height), new Rect(0, 1328, screenWidth, this.height));

		// Waves
		game.draw.imageRegionR(atlasTexture, new Rect(0, this.height - 62, screenWidth, 65), new Rect(0, 1855 + (65 * this.frame.overflow(3)), 1280, 65));
	}
}
//#endregion

//#region METHODS
// Fishes
const types = [
	0, 1, 2, 3,
	1, 2, 3, 0,
	2, 3, 0, 1,
	3, 0, 1, 2,

	0, 2, 1, 3,
	2, 1, 3, 0,
	1, 3, 0, 2,
	3, 0, 2, 1,

	0, 2, 3, 1,
	2, 3, 1, 0,
	3, 1, 0, 2,
	1, 0, 2, 3,

	0, 3, 2, 1,
	3, 2, 1, 0,
	2, 1, 0, 3,
	1, 0, 3, 2,

	0, 3, 1, 2,
	3, 1, 2, 0,
	1, 2, 0, 3,
	2, 0, 3, 1,

	0, 1, 3, 2,
	1, 3, 2, 0,
	3, 2, 0, 1,
	2, 0, 1, 3,
];
let typesPointer = Math.floor(Math.random() * (types.length / 4)) * 4;
const getFishType = () => {
	if (typesPointer === types.length) typesPointer = 0;

	switch (types[typesPointer++]) {
		default:
		case 0: return FishType.SMALL;
		case 1: return FishType.MEDIUM;
		case 2: return FishType.BIG;
		case 3: return FishType.PENGUIN;
	}
};

const addNewFish = index => {
	fishes[index] = new Fish(-200, fishes[index].y, getFishType(), Math.random() > 0.5 ? 1 : -1);
};

const getNewTarget = () => {
	const newTarget = 0;
};

// Bubbles
const addMiniBubble = (x, y, velX, velY) => {
	miniBubbles.push(new MiniBubble(x, y, velX, velY));
};

const handleAddBubblesInterval = () => {
	const _correct = Math.random() > 0.5;
	const _word = _correct ?
		WORDS.corrects[(++correctWordPointer).overflow(WORDS.corrects.length)] :
		WORDS.incorrects[(++incorrectWordPointer).overflow(WORDS.incorrects.length)];
	bubbles[(bubblesPointer++).overflow(3)] = new Bubble(-1000, _word, _correct);
};

// Coins & Score
const recalculateCoins = () => {
	GAME_5_WALIS = GAME_5_WALIS < 50 ? Math.floor(GAME_5_SCORE / (250)) : 50;
};

// Save Data
const saveData = () => {
	const date = new Date();
	const moment = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	const _data = GAME_5_URL_SOURCE + "/api/game1/addGAME_5_SCORE/idUser/" + GAME_5_ID_USER + "/GAME_5_SCORE/" + GAME_5_SCORE.toString() + "/game/5/walis/" + GAME_5_WALIS.toString() + "/moment/" + moment;

	game.http.request("POST", _data, true);
};

const powerUpCallback = () => {
	fishes.forEach(fish => {
		if (fish.direction === 1 && fish.pos.x < screenWidth / 2 ||
			fish.direction === -1 && fish.pos.x > screenWidth / 2) fish.direction *= -1;
	});

	console.log("Power!")
};

const uniquePowerUpCallback = () => {
	player.hook.powerUpActivated = true;
	console.log("Unique!")
};
//#endregion


// INIT ELEMENTS
const player = new Player();
const fishes = new Array(4);
const miniBubbles = [];
const background = new Background();

const bubbles = [];
let bonusBubbles = [];

for (let i = 0; i < fishes.length; i++) {
	const x = -200;
	const y = 300 + 100 * i;
	const type = getFishType();
	const direction = i % 2 == 0 ? 1 : -1;

	fishes[i] = new Fish(x, y, type, direction);
}

// ENGINE
game.init = () => {
	game.inputs.mouse.rightClick = false;
	game.screen.width = screenWidth;
	game.screen.height = screenHeight;
	game.screen.background = "#338ec7";
	game.title = "WaliFisher";

	printDescription(WORDS.phrase);
	showPowerUpButtons();

	updateScore(0);
	updateCoins(0);

	setInterval(handleAddBubblesInterval, 6 * 1000);
}

game.update = () => {
	if (play) {
		if (lifes === 0) {
			play = false;
			showGameOverPopUp();
			return;
		}

		if (GAME_5_VERSION >= 2) {
			powerUpListener();
			// if (relayCounter > 0) relayCounter--;
			// else {
			// 	if (game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl) || btnRelay.isClick()) {

			// 	}
			// 	else btnRelayState = 0;
			// }
		}
		if (GAME_5_VERSION == 3) {
			uniquePowerUpListener();

			// if (!panicButtonUsed && (game.inputs.keypad.isKeyPress(game.utils.keycode.shift) || btnPanic.isClick())) {
			// 	totalBubbles = 0;
			// 	btnPanicState = 1;
			// 	panicButtonUsed = true;
			// }
		}

		// GAME LOGIC HERE
		player.update();
		fishes.loop("update");
		miniBubbles.loop("update");
		background.update();

		bubbles.loop("update");
		bonusBubbles.loop("update");
	}
}

game.canvas = () => {
	background.draw();

	miniBubbles.loop("draw");
	fishes.loop("draw");
	player.draw();

	bubbles.loop("draw");
	bonusBubbles.loop("draw");

	drawLifes();
}

game.engine.run();
