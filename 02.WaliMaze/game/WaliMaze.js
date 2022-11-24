//ENGINE
//game.utils.debbugMode = true;
let screenWidth = 1280;
let screenHeight = 720;

//Force Landscape if the device is a tablet or a smartphone
if(game.inputs.device.isTablet()){
    
    game.screen.screenAdapt = false;
    
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    
    if(window.innerWidth < window.innerHeight)
    {
        screenWidth = window.innerHeight;
        screenHeight = window.innerWidth;
        
        document.getElementsByTagName("canvas")[0].style.transform = "rotate(90deg)";
    }
}


//SERVER
const GAME_6_URL_SOURCE = "http://dev.walinwa.net/waliApi";
const GAME_6_ID_USER = 9684;
const GAME_6_VERSION = 3;

let GAME_6_SCORE = 0;
let GAME_6_WALIS = 0;

//let URL_WORDS = GAME_6_URL_SOURCE + "/api/game1/getWords/idUser/" + GAME_6_ID_USER + "/idGame/1";

//let data = game.http.getJsonByURL(URL_WORDS, false);
let dataSaved = false;

//let WORDS = { phrase: data.enunciado, corrects: data.palabrasOk, incorrects: data.palabrasErr }; 
const WORDS = {
	phrase: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vitae nisl consequat, mattis neque in, vestibulum nibh.",
	corrects: ["Good_01", "Good_02", "Good_03", "Good_04"],
	incorrects: ["Bad_01", "Bad_02", "Bad_03", "Bad_04"]
};


//CLASSES
class Player extends ColliderObject {
    constructor(){
        super(new Rect(tileSize*3, tileSize*5, tileSize, tileSize), new Rect(0, 0, 256, 256));
		//this.collider = new Rect(tileSize/3, tileSize/6, tileSize/3, tileSize/3*2);
        //this.collider = new Rect(tileSize/2, tileSize/2.5, tileSize/10, tileSize/2.5);
		this.collider = new Rect(tileSize/3, tileSize/2.5, tileSize/3, tileSize/2.5);
        this.lifes = GAME_6_VERSION > 0 ? 3 : 2;
        this.speed = 5;
		this.accel = { x: 0, y: 0, increment: 0.1 };
        this.dir = 1;
        this.anim = new Point();
        this.animSpeed = 8;
        this.animCounter = 0;
        this.isMovingHorizontally = false;
        this.isMovingVertically = false;
        this.breakBlocksCollider = new Rect(tileSize/2, tileSize/2, tileSize*columns, 4);
        this.respawnBlocksCollider = new Rect(-tileSize, -tileSize, tileSize*3, tileSize*3);
		
		this.animation("stand");
    }
    update(_tiles){
        
        this.pos.x -= mazeSpeed;
        
        if(this.pos.x <= -tileSize)
        {
            if(this.lifes > 1)
            {
                this.lifes--;
                this.pos.x = tileSize * 5;
                this.pos.y = tileSize * 5;
                this.respawn(_tiles);
            }
            else play = false;
        }
		
		if(game.inputs.keypad.isKeyDown(game.utils.keycode.up) && game.inputs.keypad.isKeyDown(game.utils.keycode.down)) //Prevent press both keys at the same time
		{
			this.accel.y = 0;
			this.animation("stand");
		}
		else if(
			game.inputs.keypad.isKeyDown(game.utils.keycode.up) ||
			game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro && joystick.direction.y <= -0.25 && joystick.hasPressed ||
			game.inputs.device.isTablet() && game.inputs.sensors.orientation.hasGyro && game.inputs.sensors.orientation.getZ() <= 0 &&
                                                                        				game.inputs.sensors.orientation.getZ() >= -30
		){
			this.accel.y += this.accel.y < 1 ? this.accel.increment : 0;

			this.pos.y -= this.speed * this.accel.y;
			this.isMovingVertically = true;

			for(let i = 0; i < _tiles.length; i++)
			{
				if((_tiles[i].tile != 0 && _tiles[i].tile != "c" && _tiles[i].tile != "i" && _tiles[i].tile != "r") &&
				this.getCollider().pos.y >= _tiles[i].getCollider().pos.y &&
				this.getCollider().pos.x > _tiles[i].getCollider().pos.x - this.collider.width &&
				this.getCollider().pos.x < _tiles[i].getCollider().pos.x + _tiles[i].getCollider().width &&
				game.physics.checkColRectangles(_tiles[i].getCollider(), this.getCollider())
				){
					this.isMovingVertically = false;
					//this.pos.y = _tiles[i].pos.y + _tiles[i].getCollider().height - this.collider.pos.y;
					this.pos.y = _tiles[i].pos.y + this.speed * this.accel.y + _tiles[i].getCollider().height - this.collider.pos.y;
					//i = _tiles.length;
				}
			}

			this.animation("walk");
		}
		else if(
			game.inputs.keypad.isKeyDown(game.utils.keycode.down) ||
				game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro && joystick.direction.y >= 0.25 && joystick.hasPressed ||
				game.inputs.device.isTablet() && game.inputs.sensors.orientation.hasGyro && game.inputs.sensors.orientation.getZ() <= -45 &&
                                                                          					game.inputs.sensors.orientation.getZ() >= -75
		){
			this.accel.y += this.accel.y < 1 ? this.accel.increment : 0;

			this.pos.y += this.speed * this.accel.y;
			this.isMovingVertically = true;

			for(let i = 0; i < _tiles.length; i++)
			{
				if((_tiles[i].tile != 0 && _tiles[i].tile != "c" && _tiles[i].tile != "i" && _tiles[i].tile != "r") &&
				this.getCollider().pos.y <= _tiles[i].getCollider().pos.y &&
				this.getCollider().pos.x > _tiles[i].getCollider().pos.x - this.collider.width &&
				this.getCollider().pos.x < _tiles[i].getCollider().pos.x + _tiles[i].getCollider().width &&
				game.physics.checkColRectangles(_tiles[i].getCollider(), this.getCollider())
				){
					this.isMovingVertically = false;
					//this.pos.y = _tiles[i].pos.y - this.collider.pos.y - this.collider.height - 1;
					this.pos.y = _tiles[i].pos.y - this.speed * this.accel.y - this.collider.pos.y - this.collider.height;
					//i = _tiles.length;
				}
			}

			this.animation("walk");
		}
		else
		{
			this.accel.y = 0;
			this.isMovingVertically = false;
			if(!this.isMovingHorizontally) this.animation("stand");
		}

		if(game.inputs.keypad.isKeyDown(game.utils.keycode.left) && game.inputs.keypad.isKeyDown(game.utils.keycode.right)) //Prevent press both keys at the same time
		{
			this.accel.x = 0;
			this.animation("stand");
		}
		else if(
			game.inputs.keypad.isKeyDown(game.utils.keycode.left) ||
			game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro && joystick.direction.x <= -0.25 && joystick.hasPressed ||
			game.inputs.device.isTablet() && game.inputs.sensors.orientation.hasGyro && game.inputs.sensors.orientation.getY() <= -15 &&
                                                                          				game.inputs.sensors.orientation.getY() >= -65
		){
			this.dir = -1;

			this.accel.x += this.accel.x < 1 ? this.accel.increment : 0;

			this.pos.x -= this.speed * this.accel.x;
			this.isMovingHorizontally = true;

			for(let i = 0; i < _tiles.length; i++)
			{
				if((_tiles[i].tile != 0 && _tiles[i].tile != "c" && _tiles[i].tile != "i" && _tiles[i].tile != "r") &&
				this.getCollider().pos.x >= _tiles[i].getCollider().pos.x &&
				this.getCollider().pos.y > _tiles[i].getCollider().pos.y - this.collider.height &&
				this.getCollider().pos.y < _tiles[i].getCollider().pos.y + _tiles[i].getCollider().height &&
				game.physics.checkColRectangles(_tiles[i].getCollider(), this.getCollider())
				){
					this.isMovingHorizontally = false;
					//this.pos.x = _tiles[i].pos.x + _tiles[i].getCollider().width - this.collider.pos.x;
					this.pos.x = _tiles[i].pos.x + this.speed * this.accel.x + _tiles[i].getCollider().width - this.collider.pos.x - mazeSpeed;
					//i = _tiles.length;
				}
			}

			if(!this.isMovingVertically) this.animation("walk");
		}
		else if(
			game.inputs.keypad.isKeyDown(game.utils.keycode.right) ||
			game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro && joystick.direction.x >= 0.25 && joystick.hasPressed ||
			game.inputs.device.isTablet() && game.inputs.sensors.orientation.hasGyro && game.inputs.sensors.orientation.getY() >= 15 &&
                                                                           				game.inputs.sensors.orientation.getY() <= 65
		){
			this.dir = 1;

			this.accel.x += this.accel.x < 1 ? this.accel.increment : 0;

			if(this.pos.x <= screenWidth - this.getBounds().width - this.speed * this.accel.x) this.pos.x += this.speed * this.accel.x;
			else this.pos.x = screenWidth - this.getBounds().width;
			this.isMovingHorizontally = true;

			for(let i = 0; i < _tiles.length; i++)
			{
				if((_tiles[i].tile != 0 && _tiles[i].tile != "c" && _tiles[i].tile != "i" && _tiles[i].tile != "r") &&
				this.getCollider().pos.x <= _tiles[i].getCollider().pos.x &&
				this.getCollider().pos.y > _tiles[i].getCollider().pos.y - this.collider.height &&
				this.getCollider().pos.y < _tiles[i].getCollider().pos.y + _tiles[i].getCollider().height &&
				game.physics.checkColRectangles(tiles[i].getCollider(), this.getCollider())
				){
					this.isMovingHorizontally = false;
					//this.pos.x = _tiles[i].pos.x - this.collider.pos.x - this.collider.width;
					this.pos.x = _tiles[i].pos.x - this.speed * this.accel.x - this.collider.pos.x - this.collider.width;
					//i = _tiles.length;
				}
			}

			if(!this.isMovingVertically) this.animation("walk");
		}
		else
		{
			this.accel.x = 0;
			this.isMovingHorizontally = false;
			if(!this.isMovingVertically) this.animation("stand");
		}
    }
    draw(){
        this.imgRect.pos.x = 256 * this.anim.x;
        this.imgRect.pos.y = 256 * this.anim.y;
        game.draw.imageRegionR(playerTexture, this.getBounds(), this.imgRect, this.dir == 1);
        if(game.utils.debbugMode){
			game.draw.rectLineR(this.getCollider(), 1, game.utils.color.collider);
        	game.draw.rectLineR(this.respawnBlocksCollider.plus(this.getBounds(), "pos"), 1, game.utils.color.collider);
		}
    }
    animation(type="stand"){
        if(type == "stand")
        {
            this.anim.y = 1;
            this.animSpeed = 24;
        }
        else if(type == "walk")
        {
            this.anim.y = 0;
            this.animSpeed = 8;
        }
        
        if(this.animCounter < this.animSpeed) this.animCounter++;
        else
        {
            this.anim.x++;
            if(this.anim.x == 4) this.anim.x = 0;

            this.animCounter = 0;
        }
    }
    breakBlocks(_tiles){
        for(let i = 0; i < _tiles.length; i++)
        {
            if(game.physics.checkColRectangles(this.breakBlocksCollider.plus(this.getBounds(), "pos"), _tiles[i].getCollider()) &&
               (i % rows > 0 && i % rows < 9)
            ) _tiles[i].tile = 0;
        }
    }
    respawn(_tiles){
        for(let i = 0; i < _tiles.length; i++)
        {
            if(game.physics.checkColRectangles(this.respawnBlocksCollider.plus(this.getBounds(), "pos"), _tiles[i].getCollider()) &&
               (i % rows > 0 && i % rows < 9)
            ) _tiles[i].tile = 0;
        }
    }
}
class Tile extends ColliderObject {
    constructor(x, y, tile, meh){
        super(new Rect(x, y, tileSize, tileSize));
        this.collider = new Rect(0,0,tileSize,tileSize);
        this.tile = tile;
        this.meh = meh;
    }
    draw(){
        //super.draw();
		let _tile = this.tile == "c" || this.tile == "i" || this.tile == "r" ? 0 : this.tile;
        game.draw.imageRegionR(mazeTexture, this.getBounds(), new Rect(256 * _tile + 1, 0, 256 - 2, 256));
        if(game.utils.debbugMode)
        {
            game.draw.text(this.meh, this.pos.x + 6, this.pos.y + 12, 12);
            game.draw.rectLineR(this.getCollider());
        }
    }
    update(index){
        if(this.pos.x < -tileSize)
        {
            if(index < rows) this.pos.x = tiles[rows*columns - rows + index].pos.x + tileSize - mazeSpeed;
            else this.pos.x = tiles[index - rows].pos.x + tileSize;
            
            this.tile = tilesColor[tilesColorPointer];
            this.meh = tilesColorPointer;
			
			if(this.tile == "c"){
				let _word = WORDS.corrects[game.math.randomInt(WORDS.corrects.length-1)];
				for(let i = 0; i < words.length; i++)
                {
                    if(!words[i].active)
                    {
                        words[i] = new Word(_word, "c", this.getBounds().pos.x, this.getBounds().pos.y);
                        i = words.length;
                    }
                }
			}
			else if(this.tile == "i"){
				let _word = WORDS.incorrects[game.math.randomInt(WORDS.incorrects.length-1)];
				for(let i = 0; i < words.length; i++)
                {
                    if(!words[i].active)
                    {
                        words[i] = new Word(_word, "i", this.getBounds().pos.x, this.getBounds().pos.y);
                        i = words.length;
                    }
                }
			}
            
            tilesColorPointer++;
            
            if(tilesColorPointer % 500 == 0)
            {
                if(player.speed < 18)
				{
					mazeSpeed = Math.round(mazeSpeed * 1.3 * 10)/10;
                	player.speed = Math.round(player.speed * 1.2 * 10)/10;
					//player.accel.increment = Math.round((player.accel.increment - 0.015) * 100)/100;
					
					if(game.utils.debbugMode) console.log(`maze: ${mazeSpeed}, player: ${player.speed}, increment: ${player.accel.increment}`);
				}
                
                if(tilesColorPointer == tilesColor.length) tilesColorPointer = 0;
            }
        }
        else this.pos.x -= mazeSpeed;
    }
}
class Word extends ColliderObject {
    constructor(word, type, x, y){
        super(new Rect(x, y + tileSize/2 - 9, game.utils.textWidth(word)*1.8, 18));
        this.word = word;
        this.type = type;
        this.active = true;
    }
    update(){
        if(this.active && this.pos.x >= -tileSize*2)
        {
            this.pos.x -= mazeSpeed;
            
            if(game.physics.checkColRectangles(this.getCollider(), player.getCollider()))
            {
                //Score stuff
                if(this.type == "c") GAME_6_SCORE += 25;
                else GAME_6_SCORE -= 10;
                
                this.active = false;
            }
        }
        else this.active = false;
    }
    draw(){
        if(this.active)
        {
            game.draw.text(this.word, this.getBounds().pos.x, this.getBounds().pos.y-2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x-2, this.getBounds().pos.y-2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x-2, this.getBounds().pos.y+2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x+2, this.getBounds().pos.y + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x-2, this.getBounds().pos.y + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x, this.getBounds().pos.y+2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x+2, this.getBounds().pos.y-2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x+2, this.getBounds().pos.y+2 + 18, 18, "black");
            game.draw.text(this.word, this.getBounds().pos.x, this.getBounds().pos.y + 18, 18, "white");
            //game.draw.rectLineR(this.getBounds(), "red");
            //game.draw.rectLineR(this.getCollider(), 2, "green");
        }
    }
}
class Joystick extends Button {
	constructor(x=150, y=screenHeight-150, radius=100){
		super("", new Rect(x - joystickTexture.width/2, y - joystickTexture.height/2, joystickTexture.width, joystickTexture.height));
		this.radius = radius;
		this.direction = new Point();
		this.hasPressed = false;
	}
	update(){
		if(this.isClick()) this.hasPressed = true;
		
		if(game.inputs.mouse.isMouseDown()){
			if(this.hasPressed){
				let h = game.math.pointsDistance(game.inputs.mouse.pos, new Point(150, screenHeight-150));
				let _x = game.inputs.mouse.pos.x - this.getBounds().pos.x - 64;
				let _y = game.inputs.mouse.pos.y - this.getBounds().pos.y - 64;
				
				this.direction = new Point(Math.round(_x/h * Math.min(this.radius, h) / this.radius * 100)/100,
										   Math.round(_y/h * Math.min(this.radius, h) / this.radius * 100)/100);
			}
			else this.direction = new Point();
		}
		else {
			this.hasPressed = false;
			this.direction = new Point();
		}
	}
}


//VARIABLES
const rows = 10;
const tileSize = screenHeight/rows;
const columns = Math.ceil(screenWidth/tileSize) + 1;
let initOrientation;
//Load levels
let dataTiles = game.http.getJsonByURL("levels.json", false).data;
let tilesColor = new Array();
for(let i = 0; i < dataTiles.length; i++){
	for(let j = 0; j < dataTiles[i].length; j++){
		tilesColor.push(dataTiles[i][j]);
	}
}

let tilesColorPointer = rows * 50 * game.math.randomInt(tilesColor.length/500 - 1);

let mazeSpeed = 1.5;
let actualMazeSpeed = 1;
let actualPlayerSpeed = 1;


//GAME
let play = true;
let counter = 0;


//TEXTURES
const playerTexture = game.files.createTexture("player.png");
const mazeTexture = game.files.createTexture("maze_tiles.png");
const lifeTexture = game.files.createTexture("life.png");
const coinTex = game.files.createTexture("coin.png");

const joystickTexture = game.files.createTexture("joystick.png");

const btnSpecialLeftTexture = game.files.createTexture("btn_slow.png");
const btnSpecialRightTexture = game.files.createTexture("btn_break.png");
const endScreenTexture = game.files.createTexture("endscreen.png");


//BUTTONS
let stopMazeCooldown = 1000;
let specialLeftCoolDownCounter = stopMazeCooldown;
let mazeHasStopped = false;
let stopMazeLapse = 250;
let stopMazeCounter = stopMazeLapse;
const btnSize = 128;
let btnSpecialLeft = new Button("", new Rect(10, screenHeight - btnSize - 4, btnSize, btnSize), new Rect(0, 0, btnSize, btnSize));
let btnSpecialRight = new Button("", new Rect(screenWidth - btnSize - 10, screenHeight - btnSize - 4, btnSize, btnSize), new Rect(0, 0, btnSize, btnSize));
if(game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro){
   btnSpecialLeft.pos.x = screenWidth - btnSize * 2 - 30;
}
let btnSpecialLeftUsed = false;
const btnRetry = new Button("Volver a jugar", new Rect(screenWidth/2 - 230, screenHeight/2 + 80, 220, 70));
const btnQuit = new Button("Finalizar", new Rect(screenWidth/2 + 20, screenHeight/2 + 80, 220, 70));


//OBJECTS
const player = new Player();
const tiles = new Array(rows * columns);
const words = new Array(40);
const joystick = new Joystick();


//ENGINE
game.init = function(){
	game.inputs.mouse.rightClick = false;
    game.screen.width = screenWidth;
    game.screen.height = screenHeight;
    game.screen.background = "#AA7050";
    game.title = "WaliMaze";

	for(let i = 0; i < columns; i++){
		for(let j = 0; j < rows; j++){
			tiles[j + rows * i] = new Tile(tileSize * i, tileSize * j, tilesColor[tilesColorPointer], tilesColorPointer++);
            
            if(tilesColorPointer == tilesColor.length) tilesColorPointer = 0;
		}
	}
    
    for(let i = 0; i < words.length; i++)
    {
        words[i] = new Word("", -100, -100);
        words[i].active = false;
    }
	
	if(game.inputs.sensors.orientation.hasGyro)
	{
		btnSpecialLeft.pos.x = 10;
	}
}
game.update = function(){
    
    if(play){
        
        if(game.inputs.sensors.orientation.hasGyro)
        {
            if(initOrientation == null) initOrientation = { h: Math.round(game.inputs.sensors.orientation.getY()/10)*10, v: Math.round(game.inputs.sensors.orientation.getZ()) };
			
			btnSpecialLeft.pos.x = 10;
        }
		else
		{
			joystick.update();
		}
		
		counter++;
        if(counter == 5 * game.engine.fps)
        {
            GAME_6_SCORE += 25;
            counter = 0;
        }
        
        for(let i = 0; i < rows; i++){
            for(let j = 0; j < columns; j++){
                tiles[j + columns * i].update(j + columns * i);
            }
        }
        
        //WORDS
        for(let i = 0; i < words.length; i++) words[i].update();
        
        player.update(tiles);
        
        //Stop Maze
        if(GAME_6_VERSION > 1  && stopMazeCounter == stopMazeLapse && (btnSpecialLeft.enable && btnSpecialLeft.isClick() || game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl)))
        {
            btnSpecialLeftUsed = true;
            stopMazeCounter = stopMazeLapse;
            btnSpecialLeft.enable = false;
        }
        
        if(btnSpecialLeftUsed)
        {
            if(stopMazeCounter == stopMazeLapse)
            {
                actualPlayerSpeed = player.speed;
                player.speed = 5;
                
                actualMazeSpeed = mazeSpeed;
                mazeSpeed = 0;
                
                stopMazeCounter--;
            }
            else if(stopMazeCounter > 0)
            {
                stopMazeCounter--;
            }
            else
            {
                player.speed = actualPlayerSpeed;
                mazeSpeed = actualMazeSpeed;
                
                specialLeftCoolDownCounter--;
                if(specialLeftCoolDownCounter == 0)
                {
                    btnSpecialLeft.enable = true;
                    btnSpecialLeftUsed = false;
                    stopMazeCounter = stopMazeLapse;
                    specialLeftCoolDownCounter = stopMazeCooldown;
                }
            }
        }
        
        //Break Blocks
        if(GAME_6_VERSION > 2 && (btnSpecialRight.enable && (btnSpecialRight.isClick() || game.inputs.keypad.isKeyPress(game.utils.keycode.shift))))
        {
            player.breakBlocks(tiles);
            btnSpecialRight.enable = false;
        }
        
        
        //WALICOINS
        if(GAME_6_WALIS < 50) GAME_6_WALIS = Math.floor(GAME_6_SCORE/(250));
        else GAME_6_WALIS = 50;
    }
    else{
        //if(game.inputs.keypad.isKeyPress(game.utils.keycode.enter)) game.reset();
        if(btnRetry.isClick()) game.reset();
        if(btnQuit.isClick()){ /*Quit stuff here*/ }
        
    }
}
game.canvas = function() {

	//Tiles
    for(let i = 0; i < rows; i++){
		for(let j = 0; j < columns; j++){
			tiles[j + columns * i].draw();
		}
	}
    
    if(play){
        
        //WORDS
        for(let i = 0; i < words.length; i++) words[i].draw();
        
        //Player Stuff
        player.draw();
        
        if(GAME_6_VERSION > 1)
        {
            btnSpecialLeft.imgRect = new Rect(btnSpecialLeft.enable ? 0 : btnSize, 0, btnSize, btnSize);
            btnSpecialLeft.draw(btnSpecialLeftTexture);
        }
        
        if(GAME_6_VERSION > 2)
        {
            btnSpecialRight.imgRect = new Rect(btnSpecialRight.enable ? 0 : btnSize, 0, btnSize, btnSize);
            btnSpecialRight.draw(btnSpecialRightTexture);
        }
		
		if(game.inputs.device.isTablet() && !game.inputs.sensors.orientation.hasGyro)
        {
            joystick.draw(joystickTexture);
        }
        
        //Lifes
        for(let i = 0; i < player.lifes; i++) game.draw.image(lifeTexture, 32 + 32*i, 72, 32, 32);
    }
    else{
        //Draw retry menu
        let esWidth = screenWidth/3*2;
        let esHeight = screenHeight/3*2;
        game.draw.imageRegion(endScreenTexture, screenWidth/2 - esWidth/2, screenHeight/2 - esHeight/2, esWidth, esHeight, 0, 0, 1024, 512);
        
        //game.draw.rect(100, 100, screenWidth - 200, screenHeight - 200, "gray");
        game.draw.text(`Has conseguido ${GAME_6_SCORE} puntos`, screenWidth/2, screenHeight/2 - 50, screenWidth/32, "black", "center");
        game.draw.text(`Has ganado ${GAME_6_WALIS} walinwos`, screenWidth/2, screenHeight/2 + 30, screenWidth/32, "black", "center");
        
        btnRetry.draw();
        btnQuit.draw();
    }
    
    //Score
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32-2, 54-2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32, 54-2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32+2, 54-2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32+2, 54, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32-2, 54, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32-2, 54+2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32, 54+2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32+2, 54+2, 28, "black");
    game.draw.text(game.utils.addZeros(GAME_6_SCORE, 6), 32, 54, 28, "white");
    
    //Text
    if(!game.utils.debbugMode)
    {
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

        game.draw.text(line1, 160-2, 50-2, 24, "black");
        game.draw.text(line1, 160, 50-2, 24, "black");
        game.draw.text(line1, 160+2, 50-2, 24, "black");
        game.draw.text(line1, 160+2, 50, 24, "black");
        game.draw.text(line1, 160-2, 50, 24, "black");
        game.draw.text(line1, 160-2, 50+2, 24, "black");
        game.draw.text(line1, 160, 50+2, 24, "black");
        game.draw.text(line1, 160+2, 50+2, 24, "black");
        game.draw.text(line2, 160-2, 80-2, 24, "black");
        game.draw.text(line2, 160, 80-2, 24, "black");
        game.draw.text(line2, 160+2, 80-2, 24, "black");
        game.draw.text(line2, 160+2, 80, 24, "black");
        game.draw.text(line2, 160-2, 80, 24, "black");
        game.draw.text(line2, 160-2, 80+2, 24, "black");
        game.draw.text(line2, 160, 80+2, 24, "black");
        game.draw.text(line2, 160+2, 80+2, 24, "black");
        game.draw.textColor(line1, 160, 50, 24, "white", line1Color);
        game.draw.textColor(line2, 160, 80, 24, "white", line2Color);
    }

    //Coins
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80-2, 65-2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80, 65-2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80+2, 65-2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80-2, 65, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80+2, 65, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80-2, 65+2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80, 65+2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80+2, 65+2, 32, "black", "right");
    game.draw.text(game.utils.addZeros(GAME_6_WALIS, 2), screenWidth - 80, 65, 32, "white", "right");

    game.draw.image(coinTex, screenWidth - 70, 30, 48, 48);
}
game.engine.run();
