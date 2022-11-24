//SERVER
//const GAME_5_URL_SOURCE = "http://dev.walinwa.net/waliApi";
const GAME_5_ID_USER = 6469;
const GAME_5_VERSION = 3;
let GAME_5_SCORE = 0;
let GAME_5_WALIS = 0;
//let URL_WORDS = GAME_5_URL_SOURCE + "/api/game1/getWords/idUser/" + GAME_5_ID_USER + "/idGame/1";
//let data = game.http.getJsonByURL(URL_WORDS, true);
let dataSaved = false;
//let WORDS = { phrase: data.enunciado, corrects: data.palabrasOk, incorrects: data.palabrasErr};
const WORDS = {
	phrase: "Lorem ipsum dolor sit amet",
	corrects: ["", "", "", "", "", "", "", "", "", ""],
	incorrects: ["", "", "", "", "", "", "", "", "", ""],
};


//GAME
const screenWidth = game.inputs.device.isTablet() ? window.innerWidth : 1280;
const screenHeight = game.inputs.device.isTablet() ? window.innerHeight : 720;
const speedAnimation = 4;
const points = 10;
const ground = 32;
const btnSize = 128;
let play = true;
let streak = 0;
let totalBubbles = 0;
let btnRelayState = 0;
let btnPanicState = 0;
let panicButtonUsed = false;
let maxBubbles = 1;
let counter = 900;

//CLASSES
class Bubble{
	constructor(){
		this.pos = { x: -100, y: -100 };
		this.rad = 0;
		this.size = 0;
		this.dir = { x: 1, y: 1 };
		this.accel = { x: 0.0, y: 0.0 };
		this.force = { x: 0.0, y: 0.0 };
        this.color = game.math.randomInt(3);
	}
	update(){
		if(this.size != 0)
		{
			if(this.pos.x <= this.rad) { this.dir.x *= -1; this.pos.x = this.rad }
			else if(this.pos.x >= screenWidth - this.rad) { this.dir.x *= -1; this.pos.x = screenWidth - this.rad }

			if(this.dir.y > 0)
			{
				if(this.accel.y < 1.0) this.accel.y += 0.02 * speedBubbles;

				if(this.pos.y >= screenHeight - this.rad - ground)
				{
					this.dir.y *= -1;
					this.pos.y = screenHeight - this.rad - ground;

					this.force.y = 0;
				}
			}
			else
			{
				if(this.accel.y > 0) this.accel.y -= (0.005 + ((this.size)/200)) * speedBubbles;
				else
				{
					this.dir.y *= -1;
					this.accel.y = 0.0;
				}
			}

			if(this.force.x > 0) this.force.x -= 0.05 * speedBubbles;
			else if(this.force.x < 0) this.force.x += 0.05 * speedBubbles;

			if(this.force.y > 0) this.force.y -= 0.05 * speedBubbles;
			else if(this.force.y < 0) this.force.y += 0.05 * speedBubbles;

			this.pos.x += ((bubbleVel.x + this.force.x) * this.dir.x) * speedBubbles;
			this.pos.y += (bubbleVel.y * this.dir.y * this.accel.y + this.force.y) * speedBubbles;
		}
	}
	draw(texture){
        if(this.size != 0) game.draw.imageRegion(texture, this.pos.x - this.rad, this.pos.y - this.rad, this.rad * 2, this.rad * 2,
                                                this.color*128, 0, 128, 128);
	}
	getPos(){
		return this.pos;
	}
	getSize(){
		return this.size;
	}
	getCollision(playerRect){
		return this.size != 0 ? game.physics.checkColRectangles(new Rect(this.pos.x - this.rad, this.pos.y - this.rad, this.rad*2, this.rad*2), playerRect) : false;
	}
	setPos(posX, posY){
		this.pos.x = posX;
		this.pos.y = posY;
	}
	setDir(dirX, dirY){
		this.dir.x = dirX;
		this.dir.y = dirY;
	}
	setSize(size){
		this.size = size;

		if(size == 1) this.rad = 42;//32;
		else if(size == 2) this.rad = 32;//24;
		else if(size == 3) this.rad = 16;//12;
		else if(size == 0)
		{
			this.pos.x = -100;
			this.rad = -100;
		}
	}
	addForce(force){
		this.force = force;
	}
	reset(){
		this.pos = { x: -100, y: -100 };
		this.rad = 0;
		this.size = 0;
		this.dir = { x: 1, y: 1 };
		this.accel = { x: 0.0, y: 0.0 };
		this.force = { x: 0.0, y: 0.0 };
	}
}
class BubbleGroup{
	constructor(){
		//this.color = game.math.randomInt(3);
        this.bubble = new Array(4);
		for(let i = 0; i < this.bubble.length; i++) this.bubble[i] = new Bubble();
	}
	update(){
		for(let i = 0; i < this.bubble.length; i++)
		{
			this.bubble[i].update();

			if(player.damageCount == 0 && this.bubble[i].getCollision(player.getCollider()))
			{
				if(player.lifes > 1) player.lifes--;
                else play = false;

                player.damageCount = 100;
                player.anim("Die");
			}
		}
	}
	draw(texture){
		for(let i = 0; i < this.bubble.length; i++) this.bubble[i].draw(texture);
	}
	getBubble(index){
		return this.bubble[index];
	}
	set(num){
		this.bubble[0].reset();
		this.bubble[0].setSize(1);
		this.bubble[0].setPos(num == 0 ? 50 : screenWidth - 50, -100);
		this.bubble[0].setDir(num == 0 ? 1 : -1, 1);
	}
	allExploted(){
		let k = true;
		for(let i = 0; i < this.bubble.length; i++)
		{
			if(this.bubble[i].getSize() != 0)
			{
				i = this.bubble.length;
				k = false;
			}
		}
		return k;
	}
}
class Word{
	constructor(){
		this.pos = { x: 0, y: 0 };
		this.word = "";
        this.kind = "";
		this.size = 0;
		this.count = 0;
	}
	update(_i){
		if(this.count > 0) this.count--;
        else
        {
            if(this.kind != "")
            {
                this.pos = { x:-100, y:-100 };
                this.kind = "";
            }
            else this.setWord(words, _i);
            this.count = wordTime;
        }
	}
	draw(){
        if(this.kind != "")
		{
			if(game.utils.debbugMode) game.draw.rectR(this.getRect());

            game.draw.text(this.word, this.pos.x+2, this.pos.y+2, 28, "black", "center");
			game.draw.text(this.word, this.pos.x, this.pos.y, 28, "white", "center");
		}
	}
	getRect(){
		return new Rect(this.pos.x - this.size/2, this.pos.y - 10, this.size, 10);
	}
	setWord(words, _i){
		let n = Math.floor(Math.random() * 10);   //Define si la palabra será correcta o incorrecta.
        let m = Math.floor(Math.random() * WORDS.corrects.length || 0);  //Define cual de las palabras será.

		this.pos = { x: game.math.randomRangeInt(150, screenWidth - 150), y: 200 - 50*_i };

		this.word = n <= 4 ? WORDS.corrects[m] : WORDS.incorrects[m];
		this.kind = n <= 4 ? "correct" : "incorrect";
        this.size = game.utils.textWidth(this.word)*3;

		this.count = wordTime;
	}
}
class Firework{
	constructor(){
		this.x = 0;
		this.y = 0;
		this.width = fireworkWidth;
		this.height = fireworkHeight;
        this.collider = { x: 22, y: 0, width: 22, height: fireworkHeight };
		this.velocity = 10.0;
		this.accel = 0.0;
		this.shooted = false;
        this.frame = 0;
        this.animTime = 0;
	}
	update(){
		if(this.shooted)
		{
			if(this.y >= -this.height)
			{
				if(this.accel < 1.0) this.accel += 0.1;
				this.y -= this.velocity * this.accel;

                if(this.animTime < speedAnimation) this.animTime++;
                else
                {
                    this.frame = this.frame == 0 ? 1 : 0;
                    this.animTime = 0;
                }

                if(this.height < fireworkTex.height)
                {
                    this.height += 10;
                    this.collider.height += 10;
                }
                else
                {
                    this.height = fireworkTex.height;
                    this.collider.height = fireworkTex.height;
                }

				//BusterCall stuff
				/*let b = bubbles[0].bubble[0].pos;
				let hn = game.math.hypotNormalized(this.x - b.x, this.y - b.y);
				this.x -= this.velocity * hn.x * this.accel/2;
				this.y -= this.velocity * hn.y * this.accel;*/
			}
			else
			{
				this.shooted = false;
				streak = 0;
			}
		}
        else
        {
            this.height = fireworkHeight;
            this.accel = 0;
            this.frame = 0;
        }
	}
	draw(texture){
		if(this.shooted)
		{
			game.draw.imageRegion(texture, this.x, this.y, this.width, this.height,
                           this.width * this.frame, 0, this.width, this.height);

            if(game.utils.debbugMode) game.draw.rectLineR(this.getCollider());
		}
	}
	isShooted(){
		return this.shooted;
	}
	getCollision(rectBubble){
		return this.shooted ? game.physics.checkColRectangles(this.getCollider(), rectBubble) : false;
	}
    getCollider(){
        return new Rect(this.x + this.collider.x, this.y + this.collider.y, this.collider.width, this.collider.height);
    }
	setShoot(shooted){
		this.shooted = shooted;
	}
	setPosition(x, y){
		this.x = x;
		this.y = y;
	}
}
class Flare{
    constructor(){
        this.pos = { x: 0, y: 0 };
		this.size = 128;
        this.isDrawable = false;
        this.frame = 0;
        this.animTime = 0;
    }
    update(){
        if(this.isDrawable)
        {
            if(this.animTime < speedAnimation) this.animTime++;
            else
            {
                //this.frame < 3 ? this.frame++ : this.isDrawable = false;
                if(this.frame < 3) this.frame++;
                else
                {
                    this.frame = 0;
                    this.isDrawable = false;
                }

                this.animTime = 0;
            }
        }
    }
    draw(texture){
        if(this.isDrawable) game.draw.imageRegion(texture, this.pos.x - this.size/2, this.pos.y - this.size/2, this.size, this.size,this.size * this.frame, 0, this.size, this.size);
    }
}

//GUI
const coinTex = game.files.createTexture("coin.png");
const lifeTex = game.files.createTexture("life.png");
const bgGameOverTex = game.files.createTexture("bg_gOver.png");
const btnShootTex = game.files.createTexture("fireBtn.png");
const btnRelayTex = game.files.createTexture("slowBtn_spr.png");
const btnPanicTex = game.files.createTexture("panicBtn_spr.png");

//Buttons
let btnShootLeft = new Button("", new Rect(10, screenHeight - btnSize - 4, btnSize, btnSize), btnShootTex);
let btnShootRight = new Button("", new Rect(screenWidth - btnSize - 10, screenHeight - btnSize - 4, btnSize, btnSize), btnShootTex);
let btnRelay = new Button("", new Rect(btnSize, screenHeight - btnSize - 4, btnSize, btnSize), btnRelayTex);
let btnPanic = new Button("", new Rect(screenWidth - btnSize*2, screenHeight - btnSize - 4, btnSize, btnSize), btnPanicTex);

const btnPlayAgain = new Button("Volver a jugar", new Rect(screenWidth/2 - 230 -5, 450, 230, 60), "#c7a670");
const btnCloseGame = new Button("Finalizar", new Rect(screenWidth/2 +5, 450, 230, 60), "#c7a670");

//Player
const player = {

	pos: new Point(screenWidth/2 - 64, screenHeight - 128 - ground),
    size: 128,
    collider: { x: 25, y: 20, width: 70, height: 84 },
    lifes: GAME_5_VERSION == 0 ? 1 : 3,
    damageCount: 0,
    animation: { x: 0, y: 0 },
    animFrame: 0,
    shootAnim: false,
    shootTime: 0,
	direction: -1,
	velocity: 5.0, accel: 0.0, friction: 0.1,
	texture: game.files.createTexture("char_spr.png"),
	update: function() {

        //Damage
        if(this.damageCount > 0) this.damageCount--;

        //Key Controls
        if((!this.shootAnim && this.damageCount < 80 &&
           game.inputs.keypad.isKeyDown(game.utils.keycode.left) &&
           game.inputs.keypad.isKeyDown(game.utils.keycode.right))
        ){
			this.accel = 0;
			this.anim("Stand");
		}
        else if(!this.shootAnim && this.damageCount < 80 &&
                (game.inputs.keypad.isKeyDown(game.utils.keycode.left) ||
                (game.inputs.device.isTablet() && game.inputs.mouse.isMouseDown() && game.inputs.mouse.pos.x < screenWidth/2) && game.inputs.mouse.pos.y < screenHeight - btnSize)
        ){
			if(this.pos.x > 0)
			{
				if(this.accel < 1.0) this.accel += this.friction*2;
				this.direction = -1;
                this.anim("Run");
			}
			else
			{
				this.pos.x = 0;
				this.accel = 0;
				this.anim("Stand");
			}
		}
		else if(!this.shootAnim && this.damageCount < 80 &&
                (game.inputs.keypad.isKeyDown(game.utils.keycode.right) ||
                (game.inputs.device.isTablet() && game.inputs.mouse.isMouseDown() && game.inputs.mouse.pos.x > screenWidth/2) && game.inputs.mouse.pos.y < screenHeight - btnSize)
        ){
			if(this.pos.x < screenWidth - this.size)
			{
				if(this.accel < 1.0) this.accel += this.friction*2;
				this.direction = 1;
                this.anim("Run");
			}
			else
			{
				this.pos.x = screenWidth - this.size;
				this.accel = 0;
				this.anim("Stand");
			}
		}
		else
		{
			if(this.accel > this.friction) this.accel -= this.friction;

            if(!this.shootAnim)
            {
                if(this.damageCount < 70) this.anim("Stand");
                else this.anim("Die");
            }
            else
            {
                if(this.shootTime < 20)
                {
                    this.anim("Shoot");
                    this.shootTime++;
                }
                else
                {
                    this.shootAnim = false;
                    this.anim("Stand");
                    this.shootTime = 0;
                }
            }
		}

        //Key Shoot
		if(game.inputs.keypad.isKeyDown(game.utils.keycode.up) || game.inputs.keypad.isKeyDown(game.utils.keycode.space)) this.shoot();

        //Add Movement
		this.pos.x += this.velocity * this.accel * this.direction;
	},
	draw: function(draw) {

        //game.screen.context.globalAlpha = 0.2;

        game.draw.imageRegion(this.texture, this.pos.x, this.pos.y, this.size, this.size,
                        this.size * this.animation.x, this.size * this.animation.y, this.size, this.size, this.direction == 1 ? (this.shootAnim ? false: true) : false);

        game.screen.context.globalAlpha = 1;

        if(game.utils.debbugMode) game.draw.rectLineR(this.getCollider(), 1);
	},
    anim: function(type) {

        if(type == "Stand")
        {
            this.animation.x = 1;
            this.animation.y = 0;
        }
        else if(type == "Die")
        {
            this.animation.x = 2;
            this.animation.y = 1;
        }
        else
        {
            if(this.animFrame < speedAnimation) this.animFrame++;
            else
            {
                if(type == "Run")
                {
                    if(this.animation.x < 3) this.animation.x++;
                    else this.animation.x = 0;
                    this.animation.y = 0;
                }
                else if(type == "Shoot")
                {
                    this.animation.x = this.animation.x ? 0 : 1;
                    this.animation.y = 1;
                }

                this.animFrame = 0;
            }
        }
    },
    shoot: function() {
        if(!this.shootAnim && this.damageCount < 80)
        {
			for(let i = 0; i < fireworks.length; i++)
			{
				if(!fireworks[i].isShooted())
				{
					fireworks[i].setPosition(this.pos.x + 18, this.pos.y + 20);
					fireworks[i].setShoot(true);

					i = fireworks.length;
				}
			}

            this.shootAnim = true;
		}
    },
    getCollider: function() {
        return new Rect(this.pos.x + this.collider.x, this.pos.y + this.collider.y, this.collider.width, this.collider.height);
    }
}

//Bubbles
const bubbleVel = { x: 2.0, y: 10.0 };
const bubbleTex = game.files.createTexture("bble_spr.png");
const bubbles = new Array(4);
for(let i = 0; i < bubbles.length; i++) bubbles[i] = new BubbleGroup();
let nextColor = 1;
let speedNormal = 1;
let speedRelayed = 0.5;
let speedBubbles = speedNormal;
let relayed = false;
let relayTime = 0;
const maxRelay = 500;
let relayCounter = 0;
const relayCoolerTime = 1000;

//Words
const wordTime = 500;
const words = new Array(2);
words[0] = new Word();
words[1] = new Word();

//Fireworks
const fireworkWidth = 64;
const fireworkHeight = 32;
const fireworkTex = game.files.createTexture("fw_spr.png");
const fireworks = new Array(10);
for(let i = 0; i < fireworks.length; i++) fireworks[i] = new Firework();

//Flares
const flareTex = game.files.createTexture("flare_spr.png");
const flares = new Array(18);
for(let i = 0; i < flares.length; i++) flares[i] = new Flare();

//Background
const bgTex = game.files.createTexture("bg_tile.png");
const scale = screenHeight/screenWidth;


//ENGINE
game.init = function(){
	game.inputs.mouse.rightClick = false;
    game.screen.width = screenWidth;
    game.screen.height = screenHeight;
    game.title = "WaliChang";

    counter = 80;
}
game.update = function(){
	if(play)
    {
        if(counter < 100) counter++;
        else{
            if(totalBubbles < maxBubbles)
            {
                totalBubbles++;
                if(totalBubbles < maxBubbles) counter = 50;
            }

            for(let i=0; i<totalBubbles; i++)
            {
                if(bubbles[i].allExploted())
                {
                    bubbles[i].set(game.math.randomInt(1));
                    bubbles[i].color = game.math.randomInt(3);
                }
            }
        }

        if(GAME_5_VERSION >= 2){
            if(relayCounter > 0) relayCounter--;
            else
            {
                if(game.inputs.keypad.isKeyPress(game.utils.keycode.ctrl) || btnRelay.isClick())
                {
                    relayed = true;
                    relayCounter = relayCoolerTime;
                    btnRelayState = 1;
                }
                else btnRelayState = 0;
            }

            if(relayed){
                if(relayTime < maxRelay)
                {
                    if(speedBubbles > speedRelayed) speedBubbles -= 0.1;
                    relayTime++;
                }
                else
                {
                    if(speedBubbles < speedNormal) speedBubbles += 0.01;
                    else
                    {
                        relayed = false
                        relayTime = 0;
                    }
                }
            }
        }   //Relay Time
        if(GAME_5_VERSION == 3){
            if(!panicButtonUsed && (game.inputs.keypad.isKeyPress(game.utils.keycode.shift) || btnPanic.isClick()))
            {
                let _p = new Array();
                for(let i=0; i<maxBubbles; i++)
                {
                    for(let j=0; j<4; j++)
                    {
                        if(bubbles[i].bubble[j].size != 0)
                        {
                            _p.push(bubbles[i].bubble[j].pos);
                            bubbles[i].bubble[j].reset();
                            bubbles[i].bubble[j].setSize(0);
                        }
                    }
                }
                for(let i=0; i<_p.length; i++)
                {
                    flares[i].pos = _p[i];
                    flares[i].isDrawable = true;
                }
                panicButtonUsed = true;
                totalBubbles = 0;
                counter = 100;
                btnPanicState = 1;
            }
        }   //Panic Button

        player.update();
        words[0].update(0);
        words[1].update(1);

        if(btnShootLeft.isClick() || btnShootRight.isClick()) player.shoot();

        for(let i = 0; i < fireworks.length; i++){

			fireworks[i].update();

            for(let b = 0; b < bubbles.length; b++){
                for(let a = 0; a < 4; a++)
                {
                    if(fireworks[i].getCollision(new Rect(bubbles[b].getBubble(a).pos.x - bubbles[b].getBubble(a).rad, bubbles[b].getBubble(a).pos.y - bubbles[b].getBubble(a).rad, bubbles[b].getBubble(a).rad*2, bubbles[b].getBubble(a).rad*2)))
                    {
                        fireworks[i].setShoot(false);

                        if(streak < 20) streak++;

                        GAME_5_SCORE += Math.floor(points + (points * 0.5 * streak));

                        const c1 = game.math.randomInt(3);
                        let c2 = game.math.randomInt(3);
                        if(c2 == c1){ c2++; if(c2 == 4) c2 = 0; }
                        const p = bubbles[b].getBubble(a).getPos();
                        const s = bubbles[b].getBubble(a).getSize();
                        let f = { x: 6, y: -12 + Math.floor((screenHeight - p.y)/120) };

                        bubbles[b].getBubble(a).reset();
                        bubbles[b].getBubble(a).setPos(p.x, p.y);
                        bubbles[b].getBubble(a).setSize(s == 3 ? 0 : s+1);
                        bubbles[b].getBubble(a).setDir(1, 1);
                        bubbles[b].getBubble(a).addForce(f);
                        bubbles[b].getBubble(a).color = c1;

                        let n = -1;
                        for(let j = 0; j < 4; j++) if(bubbles[b].getBubble(j).getSize() == 0) { n = j; j = 4; }

                        bubbles[b].getBubble(n).setPos(p.x, p.y);
                        bubbles[b].getBubble(n).setSize(bubbles[b].getBubble(a).getSize());
                        bubbles[b].getBubble(n).setDir(-1, 1);
                        bubbles[b].getBubble(n).addForce(f);
                        bubbles[b].getBubble(n).color = c2;

                        if(bubbles[b].allExploted())
                        {
                            totalBubbles--;
                            counter = 50;
                        }

                        for(let i = 0; i < flares.length; i++)
                        {
                            if(!flares[i].isDrawable)
                            {
                                flares[i].pos = p;
                                flares[i].isDrawable = true;
                                i = flares.length;
                            }
                        }
                    }
                }
            }

			for(let j=0; j<words.length; j++){
				if((fireworks[i].getCollision(words[j].getRect())))
	            {
	                if(streak < 20) streak++;

                    if(words[j].kind == "correct") GAME_5_SCORE += Math.floor(points * 1.5 + (points * 0.5 * streak));
                    else{ GAME_5_SCORE -= GAME_5_SCORE > 0 ? Math.floor(points/2 + (points * 0.5 * streak)) : 0; streak = 0; }

	                fireworks[i].setShoot(false);

	                for(let i = 0; i < flares.length; i++)
	                {
	                    if(!flares[i].isDrawable)
	                    {
	                        flares[i].pos = { x: words[j].pos.x, y: words[j].pos.y };
	                        flares[i].isDrawable = true;
	                        i = flares.length;
	                    }
	                }

	                words[j].pos = { x:-100, y:-100 };
	                words[j].count = wordTime;
	                words[j].kind = "";
	            }
			}
        }
        for(let i = 0; i < bubbles.length; i++) bubbles[i].update();
        for(let i = 0; i < flares.length; i++) flares[i].update();

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
            //const date = new Date();

            //const moment = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

            //const _data = GAME_5_URL_SOURCE + "/api/game1/addGAME_5_SCORE/idUser/" + GAME_5_ID_USER + "/GAME_5_SCORE/" + GAME_5_SCORE.toString() + "/game/5/walis/" + GAME_5_WALIS.toString() + "/moment/" + moment;

            //MIRAR SI FUNCIONA
            //game.http.request("POST", _data, true);

            dataSaved = true;
        }

        if(btnPlayAgain.isClick()) game.reset();
        if(btnCloseGame.isClick()) callBackGame5();
    }
}
game.canvas = function() {

	//Background
    game.draw.imageRegionR(bgTex, new Rect(0, screenHeight - bgTex.height, screenWidth, bgTex.height), new Rect(0, 0, 150, bgTex.height));
    game.draw.image(bgTex, screenWidth/2 - bgTex.width, screenHeight - bgTex.height, bgTex.width, bgTex.height);
    game.draw.image(bgTex, screenWidth/2, screenHeight - bgTex.height, bgTex.width, bgTex.height, "true");

	for(let i = 0; i < bubbles.length; i++) bubbles[i].draw(bubbleTex);
	for(let i = 0; i < fireworks.length; i++) fireworks[i].draw(fireworkTex);
	words[0].draw();
	words[1].draw();

    for(let i = 0; i < flares.length; i++) flares[i].draw(flareTex);

	player.draw();

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

	btnShootLeft.draw();
    btnShootRight.draw();

    if(GAME_5_VERSION >= 1 && player.lifes > 0)
    {
        for(let i=0; i<player.lifes; i++) game.draw.image(lifeTex, 30 + 48 * i, 100, 64/3*2, 128/3*2);
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
