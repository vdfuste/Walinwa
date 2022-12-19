const coinsText = get("coins");
const scoreText = get("score");

const powerUpButton = get("power-up-button");
const uniquePowerUpButton = get("unique-power-up-button");

const updateCoins = coins => coinsText.innerHTML = coins.toString().padStart(2, "0");
const updateScore = score => scoreText.innerHTML = score.toString().padStart(5, "0");
const printDescription = text => get("description").innerHTML = text;


// METHODS
const drawLifes = () => {
	if(lifes > 0)
		for(let i = 0; i < lifes; i++)
			game.draw.imageRegionR(atlasTexture, new Rect(30 + 48*i, 100, 42, 54), new Rect(1500, 100, 83, 108));
};

const showPowerUpButtons = () => {
	if(GAME_5_VERSION >= 2) {
		powerUpButton.addEventListener("click", () => {
			console.log("Power Up!")
		});

		show(powerUpButton.id);
		setActive(powerUpButton.id);
	}

	if(GAME_5_VERSION == 3) {
		uniquePowerUpButton.addEventListener("click", () => {
			console.log("Unique Power Up used!");
			setActive(uniquePowerUpButton.id, false);
		}, { once: true });

		show(uniquePowerUpButton.id);
		setActive(uniquePowerUpButton.id);
	}
};


// EVENT LISTENERS
// Game Over buttons
get("play-again-button").addEventListener("click", () => {
	game.engine.reset();
});

get("finish-game-button").addEventListener("click", () => {
	callBackGame5();
});
