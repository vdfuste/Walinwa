//#region VARIABLES
//SERVER
const GAME_5_URL_SOURCE = "http://dev.walinwa.net/waliApi";
const GAME_5_ID_USER = 9684;
const GAME_5_VERSION = 3;

let GAME_5_SCORE = 0;
let GAME_5_WALIS = 0;

//let URL_WORDS = GAME_5_URL_SOURCE + "/api/game1/getWords/idUser/" + GAME_5_ID_USER + "/idGame/1";

//let data = game.http.getJsonByURL(URL_WORDS, false);
let dataSaved = false;

//let WORDS = { phrase: data.enunciado, corrects: data.palabrasOk, incorrects: data.palabrasErr };
const WORDS = {
	phrase: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae nisl consequat, mattis neque in, vestibulum nibh.",
	corrects: ["Good_01", "Good_02", "Good_03", "Good_04"],
	incorrects: ["Bad_01", "Bad_02", "Bad_03", "Bad_04"]
};

//GAME
const screenWidth = 1280;
const screenHeight = 720;
const speedAnimation = 4;
const points = 10;
let lifes = 1;
let play = true;
let streak = 0;
let panicButtonUsed = false;
let relayCounter = 0;


//CLASSES



//GUI
const coinTex = game.files.createTexture("coin.png");
const lifeTex = game.files.createTexture("life.png");
let btnRelayState = 0;
let btnPanicState = 0;
const btnSize = 128;
const btnRelay = new Button("", new Rect(10, screenHeight - btnSize - 4, btnSize, btnSize), game.files.createTexture("slowBtn_spr.png"));
const btnPanic = new Button("", new Rect(screenWidth - btnSize - 10, screenHeight - btnSize - 4, btnSize, btnSize), game.files.createTexture("panicBtn_spr.png"));
const btnPlayAgain = new Button("Volver a jugar", new Rect(screenWidth / 2 - 230 - 5, 450, 230, 60), "#c7a670");
const btnCloseGame = new Button("Finalizar", new Rect(screenWidth / 2 + 5, 450, 230, 60), "#c7a670");
//#endregion

//#region METHODS
// Coins & Score
const recalculateCoins = () => {
	GAME_5_WALIS = GAME_5_WALIS < 50 ? Math.floor(GAME_5_SCORE /(250)) : 50;
};

const recalculateScore = () => {
	switch(GAME_5_SCORE) {
		case 500:	speedNormal = 1.1; break;
		case 1000:	speedNormal = 1.3; break;
		case 1500:	speedNormal = 1.5; maxBubbles = 2; break;
		
		case 2000:	speedNormal = 1.6; break;
		case 3000:	speedNormal = 1.7; break;
		case 4000:	speedNormal = 1.8; maxBubbles = 3; break;
		
		case 5000:	speedNormal = 1.9; break;
		case 6000:	speedNormal = 2.0; break;
		case 7000:	speedNormal = 2.1; maxBubbles = 4; break;
	}
};

// Background
const drawBackground = () => {
	// Background stuff here...
};

// Draw GUI
const drawLifes = () => {
	if(lifes > 0) for(let i = 0; i < lifes; i++) game.draw.image(lifeTex, 30 + 48 * i, 100, 64 / 3 * 2, 128 / 3 * 2);
};

const drawButtons = () => {
	if(GAME_5_VERSION >= 2) {
		btnRelay.imgRect = new Rect(128 * btnRelayState, 0, 128, 128);
		btnRelay.draw();
	}
	
	if(GAME_5_VERSION == 3) {
		btnPanic.imgRect = new Rect(128 * btnPanicState, 0, 128, 128);
		btnPanic.draw();
	}
};

const drawGameOverPopup = () => {
	if(!play) {
		game.draw.image(bgGameOverTex, screenWidth / 2 - bgGameOverTex.width / 3 * 2 / 2, screenHeight / 2 - bgGameOverTex.height / 4, bgGameOverTex.width / 3 * 2, bgGameOverTex.height / 3 * 2);

		game.draw.text(`Has conseguido ${GAME_5_SCORE} puntos`, screenWidth / 2, 320, 40, "#452316", "center");
		game.draw.text(`Has ganado ${GAME_5_WALIS} walinwos`, screenWidth / 2, 390, 40, "#452316", "center");

		btnPlayAgain.draw();
		btnCloseGame.draw();
	}
};

const printCoins = () => {
	// TO-DO: Mejorar!
	game.draw.text(game.utils.addZeros(GAME_5_WALIS, 2), screenWidth - 80 + 2, 65 + 2, 32, "black", "right");
	game.draw.text(game.utils.addZeros(GAME_5_WALIS, 2), screenWidth - 80, 65, 32, "white", "right");
	game.draw.image(coinTex, screenWidth - 70, 30, 48, 48);
}

const printScore = () => {
	// TO-DO: Mejorar!
	game.draw.text(game.utils.addZeros(GAME_5_SCORE, 5), 30 + 2, 65 + 2, 32, "black");
	game.draw.text(game.utils.addZeros(GAME_5_SCORE, 5), 30, 65, 32, "white");
};

const printColoredText = () => {
	// TO-DO: Mejorar!
	
	let line1 = "", line2 = "";
	let _b = 0;

	for(let i = 0; i < WORDS.phrase.length; i++) {
		if(_b != 9) {
			line1 += WORDS.phrase[i];
			if(WORDS.phrase[i] == " ") _b++;
		}
		else {
			line2 += WORDS.phrase[i];
		}
	}

	let line1Color = new Array();
	let line2Color = new Array();
	const badColor = "#F27", goodColor = "#2F7";

	if(WORDS.phrase[23] == "J") {
		line1Color = [[23, badColor], [24, badColor], [28, badColor], [29, badColor]];
		line2Color = [[25, goodColor], [26, goodColor], [30, goodColor], [31, goodColor]];
	}
	else if(WORDS.phrase[23] == "V") {
		line1Color = [[23, badColor]];
		line2Color = [[32, goodColor]];
	}
	else if(WORDS.phrase[23] == "Y") {
		line1Color = [[23, badColor]];
		line2Color = [[32, goodColor], [33, goodColor]];
	}
	else {
		line1Color = [[23, badColor], [24, badColor], [25, badColor], [26, badColor], [27, badColor]];
		line2Color = [[15, goodColor], [16, goodColor], [17, goodColor], [18, goodColor], [19, goodColor]];
	}

	game.draw.text(line1, 160 + 2, 50 + 2, 24, "black");
	game.draw.text(line2, 160 + 2, 80 + 2, 24, "black");
	game.draw.textColor(line1, 160, 50, 24, "white", line1Color);
	game.draw.textColor(line2, 160, 80, 24, "white", line2Color);
};

const drawGUI = () => {
	drawLifes();
	drawButtons();
	printCoins();
	printColoredText();
	printScore();
	drawGameOverPopup();
};

// Save Data
const saveData = () => {
	const date = new Date();
	const moment = date.getDate() + "-" +(date.getMonth() + 1) + "-" + date.getFullYear() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	const _data = GAME_5_URL_SOURCE + "/api/game1/addGAME_5_SCORE/idUser/" + GAME_5_ID_USER + "/GAME_5_SCORE/" + GAME_5_SCORE.toString() + "/game/5/walis/" + GAME_5_WALIS.toString() + "/moment/" + moment;

	game.http.request("POST", _data, true);
};
//#endregion


//ENGINE
game.init = () => {
	game.inputs.mouse.rightClick = false;
	game.screen.width = screenWidth;
	game.screen.height = screenHeight;
	game.title = "WaliPoloNorte";
}
game.update = () => {
	if(play) {
		// TO-DO: Mejorar los contadores usando setTimeout()
		if(GAME_5_VERSION >= 2) {
			if(relayCounter > 0) relayCounter--;
			else {
				if(game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl) || btnRelay.isClick()) {

				}
				else btnRelayState = 0;
			}
		}
		if(GAME_5_VERSION == 3) {
			if(!panicButtonUsed && (game.inputs.keypad.isKeyPress(game.utils.keycode.shift) || btnPanic.isClick())) {
				totalBubbles = 0;
				btnPanicState = 1;
				panicButtonUsed = true;
			}
		}

		// GAME LOGIG HERE
		
	}
	else {
		if(btnPlayAgain.isClick()) game.reset();
		//if(btnCloseGame.isClick()) callBackGame5();
	}
}
game.canvas = () => {

	// GAME STUFF
	

	drawGUI();
}
game.engine.run();
