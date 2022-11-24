//VARIABLES
const columns = 50, rows = 10;
const tileSize = 42;

//GAME ENGINE
const screenWidth = tileSize*columns;
const screenHeight = tileSize*rows;
//game.utils.debbugMode = true;

//Levels Management
let data = game.http.getJsonByURL("../levels.json", false).data;
const margin = 8;
const levelButtonSize = tileSize*2.5;
let totalButtonsWidth = Math.floor((screenWidth - margin*2)/levelButtonSize);
let levelsSpaceY = 300;
let selectedLevel = 0;

//Tiles
const buttonsSpaceY = 150;
const imgTileSize = 256;
let tileColor = new Array(rows * columns);
let blankLevel = new Array(tileColor.length);
let selectedTile = 0;
let selectedTileRotation = 0;
let buttonCornersRotation = 0, buttonEdgesRotation = 0, buttonTRotation = 0;
let mouseIsClick = false;
let filesCounter = 0;
let lastTileClicked = -1;

//CLASSES
class Tile extends Button {
    constructor(_x, _y, i){
        super("", new Rect(_x, _y + levelsSpaceY, tileSize, tileSize));
		this.i = i;
    }
	update(){
		if(this.i != 35 && mouseIsClick && this.isOver())
		{
			tileColor[this.i] = selectedTile === 'c' ||
								selectedTile === 'i' ||
								selectedTile === 'r' ? selectedTile : selectedTile + selectedTileRotation;
		}
    }
    draw(){
        //super.draw();
		//if(tileColor[this.i] == 0) game.draw.rectLineR(this.getBounds(), 1, "lightgray");
        
        let _tile = tileColor[this.i] === 'c' ||
					tileColor[this.i] === 'i' ||
					tileColor[this.i] === 'r' ? 0 : tileColor[this.i];
		game.draw.imageRegionR(tilesLaberinto, this.getBounds(), new Rect(imgTileSize * _tile, 0, imgTileSize, imgTileSize));

		if(this.i != 35) game.draw.rectLineR(this.getBounds(), 1, "lightgray");
        else game.draw.rectR(this.getBounds(), "lightgray");
        
        if(tileColor[this.i] === 'c' ||
		   tileColor[this.i] === 'i' ||
		   tileColor[this.i] === 'r')
		{
			let _word;
			let _color;
			
			if(tileColor[this.i] === 'c'){
				_word = "Correct";
				_color = game.utils.color.collider;
			}
			else if(tileColor[this.i] === 'i'){
				_word = "Incorrect";
				_color = "#F36";
			}
			else if(tileColor[this.i] === 'r'){
				_word = "Respawn";
				_color = "#3AF";
			}

			let _x = this.getBounds().pos.x + this.getBounds().width/2;
			let _y = this.getBounds().pos.y + this.getBounds().height/2;

			game.draw.text(_word, _x, _y, 10, _color, "center");
		}
    }
}
class LevelsButton extends Button {
	constructor(x, y){
		super("", new Rect(x, y, levelButtonSize, levelButtonSize));
	}
	draw(texture, number){
		super.draw(texture);
		
		let meh;
		if(number+1 < data.length+1) meh = number + 1;
		else{
			meh = "+";
			game.draw.rectR(this.getBounds(), "white");
		}
		
		game.draw.text(meh, this.getBounds().pos.x + levelButtonSize/2, this.getBounds().pos.y + levelButtonSize/2 + 8, 32, number == selectedLevel ? "black" : "gray", "center");
		game.draw.rectLineR(this.getBounds(), 1, number == selectedLevel ? "black" : "gray");
	}
}

//TEXTURES
const tilesLaberinto = game.files.createTexture("maze_tiles.png");
const texLevelButton = game.files.createTexture("level_button.png");

//OBJECTS
//Levels Management
let levelsButton = new Array(data.length + 1);
//Tiles
const tile = new Array(rows * columns);
let buttons = new Array(8);
const buttonCorrectWord = new Button("Correct", new Rect(screenWidth/2, levelsSpaceY + screenHeight + buttonsSpaceY - 100, 128, 64));
const buttonIncorrectWord = new Button("Incorrect", new Rect(screenWidth/2 + 150, levelsSpaceY + screenHeight + buttonsSpaceY - 100, 128, 64));
const buttonRandomWord = new Button("Respawn", new Rect(screenWidth/2 + 400, levelsSpaceY + screenHeight + buttonsSpaceY - 100, 150, 64));
const buttonCleanAll = new Button("Clear all", new Rect(screenWidth/2 + 700 - 64, levelsSpaceY + screenHeight + buttonsSpaceY - 100, 256, 64));

//ENGINE
game.init = function(){
	game.inputs.mouse.rightClick = false;
    game.screen.width = screenWidth;
    game.screen.height = levelsSpaceY + screenHeight + buttonsSpaceY;
    game.title = "Editor Laberinto";
	
	//BUTTONS
	//Levels Management
    for(let i = 0; i < levelsButton.length; i++){
		levelsButton[i] = new LevelsButton(margin + ((levelButtonSize + margin/2) * i) - (levelButtonSize * totalButtonsWidth + margin/2 * (totalButtonsWidth)) * Math.floor(i/totalButtonsWidth),
										   margin + ((levelButtonSize + margin/2) * Math.floor(i/totalButtonsWidth)));
	}
	//Tiles
    for(let i = 0; i < buttons.length; i++){
        buttons[i] = new Button("", new Rect(tileSize*2 + (tileSize*2 + margin) * i, levelsSpaceY + screenHeight + buttonsSpaceY - 100, tileSize*2, tileSize*2));
    }
	
	//Set blank level data
	for(let i = 0; i < columns; i++){
		for(let j = 0; j < rows; j++){
			tile[j + rows * i] = new Tile(tileSize * i, tileSize * j, j + rows * i);
			blankLevel[j + rows * i] = j % 10 < 9 && j % 10 > 0 ? 0 : 1;
		}
	}
	
	//Load first existing level
	if(data.length > 0) tileColor = data[0];
	else tileColor = [...blankLevel];
}
game.update = function(){

    mouseIsClick = game.inputs.mouse.isMouseDown();

	//BUTTONS LOGIC
    //Levels Management
	for(let i = 0; i < levelsButton.length; i++){
		if(levelsButton[i].isClick()){
			if(i < levelsButton.length - 1){
				tileColor = data[i];
				selectedLevel = i;
			}
			else{
				data.push([...blankLevel]);
				tileColor = data[i];
				
				levelsButton.push(new LevelsButton(0, 0))
				//Recalculate
				for(let i = 0; i < levelsButton.length; i++){
					levelsButton[i] = new LevelsButton(margin + ((levelButtonSize + margin/2) * i) - (levelButtonSize * totalButtonsWidth + margin/2 * (totalButtonsWidth)) * Math.floor(i/totalButtonsWidth),
													   margin + ((levelButtonSize + margin/2) * Math.floor(i/totalButtonsWidth)));
				}
			}
		}
	}
	//Tiles
	for(let i = 0; i < tile.length; i++) tile[i].update();
	for(let i = 0; i < buttons.length; i++){
        if(buttons[i].isClick()) selectedTile = i;
    }
    
    if(buttonCorrectWord.isClick()) selectedTile = 'c';
    if(buttonIncorrectWord.isClick()) selectedTile = 'i';
    if(buttonRandomWord.isClick()) selectedTile = 'r';
	
	if(buttonCleanAll.isClick()){
        for(let i = 0; i < tileColor.length; i++){
            tileColor[i] = i % 10 < 9 && i % 10 > 0 ? 0 : 1;
            tile[i].word = "";
        }
    }
    
    /*document.getElementById('load-maze').onclick = function()
    {
        //TODO: Buscador de archivos en la carpera "mazes" y cargarlo.
    }*/
    
    document.getElementById('save-maze').onclick = function()
    {
        /*let data = "";
        for(let i = 0; i < tileColor.length; i++)
        {
            //data += tileColor[i] + tile[i].word + ",";
            data += `"${tileColor[i]}${tile[i].word}",`;
            if(i % columns == columns-1) data += "\n";
        }
        
        let file = new Blob([data], {type: 'text/plain'});
        
        filesCounter++;
        
        document.getElementById('save-maze').download = "maze_" + filesCounter + ".txt";
        document.getElementById('save-maze').href = window.URL.createObjectURL(file);*/
		
		let file = new Blob([JSON.stringify({"data":data})], {type: "application/json;charset=UTF-8"});
        
        document.getElementById('save-maze').download = "levels.json";
        document.getElementById('save-maze').href = window.URL.createObjectURL(file);
    }
}
game.canvas = function() {

	for(let i = 0; i < rows; i++){
		for(let j = 0; j < columns; j++){
			tile[j + columns * i].draw();
		}
	}
    
    //Start tile
    game.draw.text("[Player]", tile[35].pos.x + tileSize/2, tile[35].pos.y + tileSize/2, 10, "red", "center");

	//BUTTONS
	//Levels Management
    for(let i = 0; i < levelsButton.length; i++){
		levelsButton[i].draw(texLevelButton, i);
	}
	
	//Tiles
	for(let i = 0; i < buttons.length; i++){
        buttons[i].imgRect = new Rect(imgTileSize * i, 0, imgTileSize, imgTileSize);
        buttons[i].draw(tilesLaberinto);
        game.draw.rectLineR(buttons[i].getBounds(), 1, selectedTile == i ? "green" : "gray");
    }
    
    buttonCorrectWord.draw();
    buttonIncorrectWord.draw();
    buttonRandomWord.draw();
    
    buttonCleanAll.draw();
}
game.engine.run();

//METHODS
