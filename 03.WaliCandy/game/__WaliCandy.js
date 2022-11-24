//GAME ENGINE
game.utils.debbugMode = true;
const screenWidth = 1280;
const screenHeight = 720;

//ENUMS
const candyState = {
    Select:0,
    Animation:1,
    Delete:2,
    FallAnimation:3,
    Recalculate:4
};

//CLASSES
class Candy extends Button{
	constructor(){
		super("", new Rect(0, 0, tileSize, tileSize));
		this.collider = new Rect(10, 10, tileSize - 20, tileSize - 20);
		this.num = 0;
		this.type = 0;
		this.isMoving = false;
		this.newPos;
	}
	clone(candy){
		this.pos = candy.pos;
		this.collider = candy.collider;
		this.num = candy.num;
		this.type = candy.type;
		this.imgRect = candy.imgRect;
	}
	move(){
        if(this.isMoving){
            if(this.pos.x < this.newPos.x){
                if(this.newPos.x - this.pos.x >= 10) this.pos.x += 10;
                else{
                    this.pos.x = this.newPos.x;
                    this.isMoving = false;
                    LegalMove(this.num-1);
                    //legalMove = true;
                }
            }
            else if(this.pos.x > this.newPos.x){
                if(this.pos.x - this.newPos.x >= 10) this.pos.x -= 10;
                else{
                    this.pos.x = this.newPos.x;
                    this.isMoving = false;
                    LegalMove(this.num-1);
                    //legalMove = true;
                }
            }

            if(this.pos.y < this.newPos.y){
                if(this.newPos.y - this.pos.y >= 10) this.pos.y += 10;
                else{
                    this.pos.y = this.newPos.y;
                    this.isMoving = false;
                    LegalMove(this.num-1);
                    //legalMove = true;
                }
            }
            else if(this.pos.y > this.newPos.y){
                if(this.pos.y - this.newPos.y >= 10) this.pos.y -= 10;
                else{
                    this.pos.y = this.newPos.y;
                    this.isMoving = false;
                    LegalMove(this.num-1);
                    //legalMove = true;
                }
            }
        }
	}
}

//STUFF
let columns = 5, rows = 5;
const posX = screenWidth/2 + 200, posY = screenHeight/2;
let tileSize = screenHeight/rows - 16;
const candyTexture = game.files.createTexture("bble_spr.png");
let candy = new Array(columns*rows);
let selectedCandy = { first: -1, last: -1 };
let movedCandy = { first: -1, last: -1 };
let legalMove;
let puzzleState = candyState.Select;
let deleteHorizontalCandies = new Array();
let deleteVerticalCandies = new Array();

//ENGINE
game.init = function(){
	game.inputs.mouse.rightClick = false;
    game.screen.width = screenWidth;
    game.screen.height = screenHeight;
    game.title = "WaliCandy";

	for(let i = 0; i < rows; i++){
		for(let j = 0; j < columns; j++){
			candy[j + columns*i] = new Candy();
			candy[j + columns*i].num = j + columns*i;
			candy[j + columns*i].pos.x = posX - tileSize*columns/2 + tileSize * j;
			candy[j + columns*i].pos.y = posY - tileSize*rows/2 + tileSize * i;
            let _type = game.math.randomRangeInt(0, 3);
			candy[j + columns*i].type = _type;
			candy[j + columns*i].imgRect = new Rect(128 * _type, 0, 128, 128);
		}
	}

	//candy.enable = false;
}
game.update = function(){
    
    
    
    switch(puzzleState)
    {
        case candyState.Select:
            
            for(let i = 0; i < candy.length; i++){
                
                if(candy[i].isClick()){
                    if(selectedCandy.first == -1) selectedCandy.first = candy[i].num;
                    else {
                        selectedCandy.last = candy[i].num;
                        
                        if(selectedCandy.first != selectedCandy.last){
                            puzzleState = candyState.Animation;
                        }
                        else{
                            selectedCandy.first = -1;
                            selectedCandy.last = -1;
                        }
                    }
                }
            }
            
        break;
        case candyState.Animation:
            
            if(selectedCandy.last != -1){

                if(//(selectedCandy.first == selectedCandy.last + 1 + columns && selectedCandy.first % columns-1) ||
                selectedCandy.first == selectedCandy.last + columns ||
                //(selectedCandy.first == selectedCandy.last - 1 + columns && selectedCandy.first % columns) ||
                (selectedCandy.first == selectedCandy.last + 1 && selectedCandy.first % columns-1) ||
                (selectedCandy.first == selectedCandy.last - 1 && selectedCandy.first % columns) ||
                //(selectedCandy.first == selectedCandy.last + 1 - columns && selectedCandy.first % columns-1) ||
                selectedCandy.first == selectedCandy.last - columns //||
                //(selectedCandy.first == selectedCandy.last - 1 - columns && selectedCandy.first % columns)
                ){
                    const pos1 = Object.assign({}, candy[selectedCandy.first].pos);
                    const pos2 = Object.assign({}, candy[selectedCandy.last].pos);

                    candy[selectedCandy.first].newPos = pos2;
                    candy[selectedCandy.last].newPos = pos1;

                    candy[selectedCandy.first].isMoving = true;
                    candy[selectedCandy.last].isMoving = true;

                    movedCandy = Object.assign({}, selectedCandy);
                }
            }
            
            candy[selectedCandy.first].move();
            candy[selectedCandy.last].move();
            
            if(legalMove){
                const candy1 = new Candy();
                const candy2 = new Candy();

                candy1.clone(candy[movedCandy.first]);
                candy2.clone(candy[movedCandy.last]);

                candy[movedCandy.first].clone(candy2);
                candy[movedCandy.last].clone(candy1);

                candy[movedCandy.first].num = candy1.num;
                candy[movedCandy.last].num = candy2.num;

                legalMove = false;
                puzzleState = candyState.Delete;
            }
            else{
                //TODO: Hacer que las piezas vuelvan a su sitio original.
            }
            
            selectedCandy.first = -1;
                selectedCandy.last = -1;
            
        break;
        case candyState.Delete:
            
            DeleteCandies(movedCandy.last);
            //candy[movedCandy.first].pos.x = 0;
            
            puzzleState = candyState.Select;
            
        break;
        case candyState.FallAnimation:
            
            //for(let i = 0; i < candy.length; i++) candy[i].update();
            
        break;
        case candyState.Recalculate:
            
            
            
        break;
    }
}
game.canvas = function() {

	for(let i = 0; i < candy.length; i++){
		candy[i].draw(candyTexture);
		if(game.utils.debbugMode) game.draw.text(candy[i].num, candy[i].pos.x, candy[i].pos.y, 18);
	}
    
    if(selectedCandy.first != -1)
        game.draw.circleLine(candy[selectedCandy.first].pos.x + tileSize/2, candy[selectedCandy.first].pos.y + tileSize/2, tileSize/2, 32, "red");
}
game.engine.run();

//METHODS
function LegalMove(num){
	
    if(/*candy[num].type == candy[num + columns].type && candy[num].type == candy[num + columns*2].type ||
	candy[num].type == candy[num - columns].type && candy[num].type == candy[num - columns*2].type ||
	candy[num].type == candy[num + 1].type && candy[num].type == candy[num + 2].type ||
	candy[num].type == candy[num - 1].type && candy[num].type == candy[num - 2].type)*/
	true)
	{
		legalMove = true;
	}
}
function DeleteCandies(num){
    
    for(let i = 0; i < 4; i++){
        
        let type = candy[num].type;
        let dir;
        let nextCandy = 1;
        
        if(i == 0) dir = columns;
        else if(i == 1) dir = -1;
        else if(i == 2) dir = 1;
        else if(i == 3) dir = -columns;
        
        while(num + nextCandy*dir >= 0 && num + nextCandy*dir <= columns*rows &&
            candy[num + nextCandy*dir].type == type
        ){
            if(i == 1 || i == 2) deleteHorizontalCandies.push(candy[num + nextCandy*dir]);
            else deleteVerticalCandies.push(candy[num + nextCandy*dir]);
            
            nextCandy++;
        }
    }
    
    if(deleteHorizontalCandies.length > 2){
        
        deleteHorizontalCandies.push(candy[num]);
        
        for(let i = 0; i < deleteHorizontalCandies.length; i++)
            deleteHorizontalCandies[i].pos = { x: 0, y: 0 };
    }
    
    if(deleteVerticalCandies.length > 2){
        
        deleteVerticalCandies.push(candy[num]);
        
        for(let i = 0; i < deleteVerticalCandies.length; i++)
            deleteVerticalCandies[i].pos = { x: 0, y: 0 };
    }
    
    deleteHorizontalCandies = new Array();
    deleteVerticalCandies = new Array();
}
