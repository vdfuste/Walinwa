
//SERVER
const GAME_5_URL_SOURCE = "http://dev.walinwa.net/waliApi";
const GAME_5_ID_USER = 9684;
const GAME_5_VERSION = 3;

let GAME_5_SCORE = 0;
let GAME_5_WALIS = 0;

//let URL_WORDS = GAME_5_URL_SOURCE + "/api/game1/getWords/idUser/" + GAME_5_ID_USER + "/idGame/1";

//let data = game.http.getJsonByURL(URL_WORDS, false);
let dataSaved = false;

//let WORDS = { phrase: data.enunciado, corrects: data.palabrasOk, incorrects: data.palabrasErr};
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
class Candy extends ColliderObject{
	constructor(){
		super(null);
		this.x = 100;
		this.y = 100;
		this.width = 64;
		this.height = 64;
	}
	moveTo(direction){
		if(direction == "left"){

		}
		else if(direction == "right"){

		}
		else if(direction == "top"){

		}
		else if(direction == "bottom"){

		}
	}
}

//GUI
const coinTex = game.files.createTexture("coin.png");
const lifeTex = game.files.createTexture("life.png");
//const bgGameOverTex = game.files.createTexture("bg_gOver.png");
let btnRelayState = 0;
let btnPanicState = 0;
const btnSize = 128;
let btnRelay = new Button("", new Rect(10, screenHeight - btnSize - 4, btnSize, btnSize), game.files.createTexture("slowBtn_spr.png"));
let btnPanic = new Button("", new Rect(screenWidth - btnSize - 10, screenHeight - btnSize - 4, btnSize, btnSize), game.files.createTexture("panicBtn_spr.png"));
const btnPlayAgain = new Button("Volver a jugar", new Rect(screenWidth/2 - 230 -5, 450, 230, 60), "#c7a670");
const btnCloseGame = new Button("Finalizar", new Rect(screenWidth/2 +5, 450, 230, 60), "#c7a670");

//STUFF
let candy = new Candy();


//ENGINE
game.init = function(){
	game.inputs.mouse.rightClick = false;
    game.screen.width = screenWidth;
    game.screen.height = screenHeight;
    game.title = "WaliCandy";

    counter = 80;
}
game.update = function(){
	if(play)
    {



		if(GAME_5_VERSION >= 2){
            if(relayCounter > 0) relayCounter--;
            else
            {
                if(game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl) || btnRelay.isClick())
                {

                }
                else btnRelayState = 0;
            }
        }
        if(GAME_5_VERSION == 3){
            if(!panicButtonUsed && (game.inputs.keypad.isKeyPress(game.utils.keycode.shift) || btnPanic.isClick()))
            {


                panicButtonUsed = true;
                totalBubbles = 0;
                counter = 100;
                btnPanicState = 1;
            }
        }   //Panic Button

        //SCORE
        if(GAME_5_SCORE <= 500){ speedNormal = 1.1; }
        else if(GAME_5_SCORE <= 1000){ speedNormal = 1.3; }
        else if(GAME_5_SCORE <= 1500){ speedNormal = 1.5; maxBubbles = 2; }
        else if(GAME_5_SCORE <= 2000){ speedNormal = 1.6; }
        else if(GAME_5_SCORE <= 3000){ speedNormal = 1.7; }
        else if(GAME_5_SCORE <= 4000){ speedNormal = 1.8; maxBubbles = 3; }
        else if(GAME_5_SCORE <= 5000){ speedNormal = 1.9; }
        else if(GAME_5_SCORE <= 6000){ speedNormal = 2; }
        else if(GAME_5_SCORE <= 7000){ speedNormal = 2.1; maxBubbles = 4; }

        //WALICOINS
        if(GAME_5_WALIS < 50) GAME_5_WALIS = Math.floor(GAME_5_SCORE/(250));
        else GAME_5_WALIS = 50;
    }
    else
    {
		//SAVE DATA
        if(!dataSaved)
        {
            const date = new Date();
            const moment = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
            const _data = GAME_5_URL_SOURCE + "/api/game1/addGAME_5_SCORE/idUser/" + GAME_5_ID_USER + "/GAME_5_SCORE/" + GAME_5_SCORE.toString() + "/game/5/walis/" + GAME_5_WALIS.toString() + "/moment/" + moment;

            //game.http.request("POST", _data, true);

            dataSaved = true;
        }

        if(btnPlayAgain.isClick()) game.reset();
        if(btnCloseGame.isClick()) callBackGame5();
    }
}
game.canvas = function() {

	//Background

	//GAME
	candy.draw();

    //GUI
    game.draw.text(game.utils.addZeros(GAME_5_SCORE, 5), 30+2, 65+2, 32, "black");
    game.draw.text(game.utils.addZeros(GAME_5_SCORE, 5), 30, 65, 32, "white");

    let line1 = "", line2 = "";
    let _b = 0;

    for(let i=0; i<WORDS.phrase.length; i++)
    {
        if(_b != 9)
        {
            line1 += WORDS.phrase[i];
            if(WORDS.phrase[i] == " ") _b++;
        }
        else
        {
            line2 += WORDS.phrase[i];
        }
    }

    let line1Color = new Array();
    let line2Color = new Array();
    const badColor = "#F27", goodColor = "#2F7";

    if(WORDS.phrase[23] == "J")
    {
        line1Color = [ [23, badColor], [24, badColor], [28, badColor], [29, badColor] ];
        line2Color = [ [25, goodColor], [26, goodColor], [30, goodColor], [31, goodColor] ];
    }
    else if(WORDS.phrase[23] == "V")
    {
        line1Color = [[23, badColor]];
        line2Color = [[32, goodColor]];
    }
    else if(WORDS.phrase[23] == "Y")
    {
        line1Color = [[23, badColor]];
        line2Color = [ [32, goodColor], [33, goodColor] ];
    }
    else
    {
        line1Color = [[23, badColor], [24, badColor], [25, badColor], [26, badColor], [27, badColor] ];
        line2Color = [ [15, goodColor], [16, goodColor], [17, goodColor], [18, goodColor], [19, goodColor] ];
    }

    game.draw.text(line1, 160+2, 50+2, 24, "black");
    game.draw.text(line2, 160+2, 80+2, 24, "black");
    game.draw.textColor(line1, 160, 50, 24, "white", line1Color);
    game.draw.textColor(line2, 160, 80, 24, "white", line2Color);

    game.draw.text(game.utils.addZeros(GAME_5_WALIS, 2), screenWidth - 80+2, 65+2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_5_WALIS, 2), screenWidth - 80, 65, 32, "white", "right");

    game.draw.image(coinTex, screenWidth - 70, 30, 48, 48);

    if(GAME_5_VERSION >= 1 && lifes > 0)
    {
        for(let i=0; i<lifes; i++) game.draw.image(lifeTex, 30 + 48 * i, 100, 64/3*2, 128/3*2);
    }
    if(GAME_5_VERSION >= 2)
    {
        btnRelay.imgRect = new Rect(128*btnRelayState, 0, 128, 128);
        btnRelay.draw();
    }
    if(GAME_5_VERSION == 3)
    {
        btnPanic.imgRect = new Rect(128*btnPanicState, 0, 128, 128);
        btnPanic.draw();
    }

	//DELETE LATER
    if(game.utils.debbugMode)
	{
		//game.draw.text("Streak: " + streak, screenWidth - 20, 50, 18, "darkGray", "right");
		//game.draw.text("Counter: " + counter, screenWidth - 20, 70, 18, "darkGray", "right");
		//game.draw.text("Bubbles: " + totalBubbles, screenWidth - 20, 90, 18, "darkGray", "right");
		//game.draw.text("Max Bubbles: " + maxBubbles, screenWidth - 20, 110, 18, "darkGray", "right");
		//game.draw.text("Speed Bubbles: " + (!relayed ? speedNormal : speedRelayed), screenWidth - 20, 130, 18, "darkGray", "right");
		game.draw.text("mouse pos [" + game.utils.addZeros(game.inputs.mouse.pos.x, 3) + ", " + game.utils.addZeros(game.inputs.mouse.pos.y, 3) + "]", 10, screenHeight - 10, 12, "black");
		game.draw.text("Pressed: " + game.inputs.mouse.mouseIsPressed, 135, screenHeight - 10, 12, "black");
        //game.draw.line(0, screenHeight - ground, screenWidth, screenHeight - ground, 1, "red");
		if(game.inputs.mouse.overButton) game.draw.circleC(new Circle({x:20, y:20}, 12), 12, "red");
	}

    if(!play)
    {
        game.draw.image(bgGameOverTex, screenWidth/2 - bgGameOverTex.width/3*2/2, screenHeight/2 - bgGameOverTex.height/4, bgGameOverTex.width/3*2, bgGameOverTex.height/3*2);

        game.draw.text(`Has conseguido ${ GAME_5_SCORE } puntos`, screenWidth/2, 320, 40, "#452316", "center");
        game.draw.text(`Has ganado ${ GAME_5_WALIS } walinwos`, screenWidth/2, 390, 40, "#452316", "center");

        btnPlayAgain.draw();
        btnCloseGame.draw();
    }
}
game.engine.run();
