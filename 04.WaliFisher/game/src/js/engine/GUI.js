const coinsText = get("coins");
const scoreText = get("score");

let powerUpButton = get("power-up-button");
const uniquePowerUpButton = get("unique-power-up-button");

const updateCoins = coins => coinsText.innerHTML = coins.toString().padStart(2, "0");
const updateScore = score => scoreText.innerHTML = score.toString().padStart(5, "0");
const printDescription = text => get("description").innerHTML = text;

let powerUpPressed = false;
let uniquePowerUpPressed = false;

let powerUpUsed = false;
let uniquePowerUpUsed = false;

const coolDownSecs = 10;


// METHODS
const drawLifes = () => {
	if(lifes > 0)
		for(let i = 0; i < lifes; i++)
			game.draw.imageRegionR(atlasTexture, new Rect(30 + 48*i, 100, 42, 54), new Rect(1500, 100, 83, 108));
};

const showGameOverPopUp = () => {
	get("game-over-coins-text").innerHTML = GAME_5_WALIS;
	get("game-over-points-text").innerHTML = GAME_5_SCORE;
	show("game-over");
};


// EVENT LISTENERS
const powerUpEvent = () => powerUpPressed = true;
const uniquePowerUpEvent = () => uniquePowerUpPressed = true;

const showPowerUpButtons = () => {
	if(GAME_5_VERSION >= 2) {
		powerUpButton.addEventListener("click", powerUpEvent);

		show(powerUpButton.id);
		setActive(powerUpButton.id);
	}

	if(GAME_5_VERSION == 3) {
		uniquePowerUpButton.addEventListener("click", uniquePowerUpEvent);

		show(uniquePowerUpButton.id);
		setActive(uniquePowerUpButton.id);
	}
};

const powerUpListener = () => {
	if(!powerUpUsed && (powerUpPressed || game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl))) {
		powerUpCallback();
		setActive(powerUpButton.id, false);
		
		setTimeout(() => {
			powerUpButton.addEventListener("click", powerUpEvent);
			setActive(powerUpButton.id, true);
			powerUpUsed = false;
		}, coolDownSecs * 1000);

		
		powerUpButton.removeEventListener("click", powerUpEvent);
		powerUpPressed = false;
		powerUpUsed = true;
	}
};
const uniquePowerUpListener = () => {
	if(!uniquePowerUpUsed && (uniquePowerUpPressed || game.inputs.keypad.isKeyPress(game.utils.keycode.shift))) {
		uniquePowerUpCallback();
		setActive(uniquePowerUpButton.id, false);

		uniquePowerUpButton.removeEventListener("click", uniquePowerUpEvent);
		uniquePowerUpUsed = true;
	}
};

// Game Over buttons
get("play-again-button").addEventListener("click", () => {
	game.engine.reset();
});
get("finish-game-button").addEventListener("click", () => {
	callBackGame5();
});
