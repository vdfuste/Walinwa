const game = {
	engine: {
		fps: 60,
		loop: function(){
			game.screen.canvas.width = game.screen.width * game.screen.scale;
			game.screen.canvas.height = game.screen.height * game.screen.scale;
			game.screen.canvas.style.backgroundColor = game.screen.background;
            game.screen.canvas.style.cursor = game.inputs.mouse.overButton ? "pointer" : "default";
            game.inputs.mouse.overButton = false;

			game.screen.screenScale();

            game.update();
			game.screen.clear();
			game.canvas();

            game.inputs.mouse.clearClickPress();
            game.inputs.keypad.clearKeyPress();
		},
		run: function(){
            game.inputs.mouse.listener();
			game.inputs.keypad.listener();

            game.init();

			document.title = game.title;

			setInterval("game.engine.loop()", 1000/(this.fps));
		}
	},
    title: "GameJS",
	screen: {
		width: 720,
		height: 480,
        scale: 1.0,
		screenAdapt: true,
		background: "white",
		canvas: document.getElementById("canvas"),
		context: this.canvas.getContext("2d"),
        style: this.canvas.style,
		clear: function(x, y, width, height){
			if(x != null) this.context.clearRect(x, y, width, height);
			else this.context.clearRect(0, 0, this.width, this.height);
		},
		screenScale: function(){
			if(this.screenAdapt){
                const _x = window.innerWidth/this.width < 1 ? window.innerWidth/this.width : 1;
                const _y = window.innerHeight/this.height < 1 ? window.innerHeight/this.height : 1;

                if(_x < _y) this.scale = _x;
                else if(_y < _x) this.scale = _y;
                else this.scale = 1;
            }
		}
	},
	draw: {
		circle: function(x, y, rad, faces, color){
			faces = faces == null ? 32 : faces;
			game.screen.context.fillStyle = color != null ? color : "#ABCDEF";
			game.screen.context.beginPath();
			game.screen.context.moveTo((x + rad) * game.screen.scale, y * game.screen.scale);
		    for(let i=1; i<faces; i++){
				let a = 360/faces;
				game.screen.context.lineTo((x + Math.cos(game.math.toRadians(a*i)) * rad) * game.screen.scale, (y + Math.sin(game.math.toRadians(a*i)) * rad) * game.screen.scale);
			}
			game.screen.context.closePath();
		    game.screen.context.fill();
		},
		circleC: function(circle, faces, color){
			this.circle(circle.x, circle.y, circle.rad, faces, color);
		},
		circleLine: function(x, y, rad, faces, strokeWidth, color){
			faces = faces == null ? 32 : faces;
			game.screen.context.strokeStyle = color != null ? color : "#ABCDEF";
			game.screen.context.strokeWidth = strokeWidth != null ? strokeWidth : 1;
			game.screen.context.beginPath();
			game.screen.context.moveTo((x + rad) * game.screen.scale, y * game.screen.scale);
		    for(let i=1; i<faces; i++){
				let a = 360/faces;
				game.screen.context.lineTo((x + Math.cos(game.math.toRadians(a*i)) * rad) * game.screen.scale, (y + Math.sin(game.math.toRadians(a*i)) * rad) * game.screen.scale);
			}
			game.screen.context.closePath();
		    game.screen.context.stroke();
		},
		circleLineC: function(circle, faces, strokeWidth, color){
			faces = faces == null ? 32 : faces;
			game.screen.context.strokeStyle = color != null ? color : "#ABCDEF";
			game.screen.context.strokeWidth = strokeWidth != null ? strokeWidth : 1;
			game.screen.context.beginPath();
			game.screen.context.moveTo(circle.pos.x + circle.rad, circle.pos.y);
		    for(let i=1; i<faces; i++){
				let a = 360/faces;
				game.screen.context.lineTo(circle.pos.x + Math.cos(game.math.toRadians(a*i)) * circle.rad, circle.pos.y + Math.sin(game.math.toRadians(a*i)) * circle.rad);
			}
			game.screen.context.closePath();
		    game.screen.context.stroke();
		},
		line: function(x1, y1, x2, y2, lineWidth, color){
			game.screen.context.strokeStyle = color != null ? color : "black";
			game.screen.context.lineWidth = lineWidth != null ? lineWidth : 1;
			game.screen.context.beginPath();
			game.screen.context.moveTo(x1 * game.screen.scale, y1 * game.screen.scale);
		    game.screen.context.lineTo(x2 * game.screen.scale, y2 * game.screen.scale);
		    game.screen.context.stroke();
		},
		lineP: function(p1, p2, lineWidth, color){
			game.draw.line(p1.x, p1.y, p2.x, p2.y, lineWidth, color);
		},
		rect: function(x, y, width, height, color){
			game.screen.context.fillStyle = color != null ? color : "tomato";
			game.screen.context.fillRect(x * game.screen.scale, y * game.screen.scale, width * game.screen.scale, height * game.screen.scale);
		},
		rectR: function(rect, color){
			game.draw.rect(rect.x, rect.y, rect.width, rect.height, color);
		},
		rectLine: function(x, y, width, height, strokeWidth, color){
			game.screen.context.strokeStyle = color != null ? color : "tomato";
			game.screen.context.strokeWidth = strokeWidth != null ? strokeWidth : 1;
			game.screen.context.strokeRect(x * game.screen.scale, y * game.screen.scale, width * game.screen.scale, height * game.screen.scale);
		},
		rectLineR: function(rect, strokeWidth, color){
			game.draw.rectLine(rect.x, rect.y, rect.width, rect.height);
		},
		point: function(x, y, color){
			this.rect(new Rect(x - 2, y - 2, 4, 4), color);
		},
		pointP: function(point, color){
			this.point(point.x, point.y, color);
		},
		poly: function(polygon, color){
			game.screen.context.fillStyle = color != null ? color : "tomato";
			game.screen.context.beginPath();
			game.screen.context.moveTo(polygon.points[0].x * game.screen.scale, polygon.points[0].y * game.screen.scale);
		    for(let i=1; i<polygon.points.length; i++){
				game.screen.context.lineTo(polygon.points[i].x * game.screen.scale, polygon.points[i].y * game.screen.scale);
			}
			game.screen.context.closePath();
		    game.screen.context.fill();
		},
		polyLine: function(polygon, strokeWidth, color){
			game.screen.context.strokeStyle = color != null ? color : "tomato";
			game.screen.context.beginPath();
			game.screen.context.moveTo(polygon.points[0].x * game.screen.scale, polygon.points[0].y * game.screen.scale);
		    for(let i=1; i<polygon.points.length; i++){
				game.screen.context.lineTo(polygon.points[i].x * game.screen.scale, polygon.points[i].y * game.screen.scale);
			}
			game.screen.context.closePath();
		    game.screen.context.stroke();
		},
		text: function(text, x, y, size, color="black", align="left"){
			game.screen.context.font = size * game.screen.scale + "px Arial";
			game.screen.context.textAlign = align;
			game.screen.context.fillStyle = color;
			game.screen.context.fillText(text, x * game.screen.scale, y * game.screen.scale);
		},
        textColor: function(text, x, y, size, defaultColor, arrayColor, align){
            let _x = x;
            let _n = 0;
            for(let i=0; i<text.length; i++){
                game.draw.text(text[i], _x, y, size, arrayColor[_n][0] == i ? arrayColor[_n][1] : defaultColor, align);
                _x += game.utils.textWidth(text[i])/game.screen.scale;
                if(_n < arrayColor.length-1 && arrayColor[_n][0] == i) _n++;
            }
        },
		image: function(texture, x, y, width, height, flipX){
			if(flipX){
		        game.screen.context.translate((x + width) * game.screen.scale, y * game.screen.scale);
		        game.screen.context.scale(-1, 1);
		    }
		    if(width == null || height == null) game.screen.context.drawImage(texture, !flipX ? x * game.screen.scale : 0, !flipX ? y * game.screen.scale : 0);
			else game.screen.context.drawImage(texture, !flipX ? x * game.screen.scale : 0, !flipX ? y * game.screen.scale : 0, width * game.screen.scale, height * game.screen.scale);
		    if(flipX) game.screen.context.setTransform(1,0,0,1,0,0);
		},
		imageR: function(texture, rect, flipX){
			if(flipX){
		        game.screen.context.translate((rect.x + rect.width) * game.screen.scale, rect.y * game.screen.scale);
		        game.screen.context.scale(-1, 1);
		    }
		    game.screen.context.drawImage(texture, !flipX ? rect.x * game.screen.scale : 0, !flipX ? rect.y * game.screen.scale : 0, rect.width * game.screen.scale, rect.height * game.screen.scale);
		    if(flipX) game.screen.context.setTransform(1,0,0,1,0,0);
		},
		imageRegion: function(texture, x, y, width, height, imgX, imgY, imgWidth, imgHeight, flipX){
			if(flipX){
		        game.screen.context.translate((x + width) * game.screen.scale, y * game.screen.scale);
		        game.screen.context.scale(-1, 1);
		    }
		    game.screen.context.drawImage(texture, imgX, imgY, imgWidth, imgHeight, !flipX ? x * game.screen.scale : 0, !flipX ? y * game.screen.scale : 0, width * game.screen.scale, height * game.screen.scale);
		    if(flipX) game.screen.context.setTransform(1,0,0,1,0,0);
		},
		imageRegionR: function(texture, rect, rectImg, flipX){
			game.draw.imageRegion(texture, rect.x, rect.y, rect.width, rect.height, !flipX ? rectImg.x : 0, !flipX ? rectImg.y : 0, rectImg.width, rectImg.height);
		}
	},
	files: {
		filesPath: "./",
		imagesPath: "images/",
        createTexture: function(path){
			let img = new Image();
			img.src = this.imagesPath + path;
			return img;
		},
		readTextFile: function(path){

		},
		readXMLFile: function(path){

		},
        readJsonFile: function(path){

		}
	},
    http: {
        request: function(requestType, url, assync){
            const http = new XMLHttpRequest();
            http.open(requestType, url, assync);
            http.send(null);
        },
        getJsonByURL: function(url, doubleParse){
            let data;
            const http = new XMLHttpRequest();
            http.onreadystatechange = function(){
                if(http.readyState == 4 && http.status == 200) data = JSON.parse(http.responseText);
            };
            http.open("GET", url, false);
            http.send(null);
            return doubleParse ? JSON.parse(data) : data;
		}
    },
	inputs: {
		keypad: {
			keyState: [],
			keyIsPressed: [],
			listener: function(){
				for(let i = 0; i < 222; i++){
					this.keyState.push(false);
					this.keyIsPressed.push(false);
				}

				let _keyState = this.keyState;
				let _keyIsPressed = this.keyIsPressed;

				document.onkeydown = function(e){
					for(let i = 0; i < _keyState.length; i++){
						if(e.keyCode == i){
							//e.preventDefault();
							if(_keyState[i] != true) _keyIsPressed[i] = true;
							_keyState[i] = true;
						}
					}
				}
				document.onkeyup = function(e){
					for(let i = 0; i < _keyState.length; i++){
                        if(e.keyCode == i){
                            //e.preventDefault();
                            _keyState[i] = false;
                        }
                    }
				}
			},
			isKeyPress: function(k){
				return this.keyIsPressed[k];
			},
			isKeyDown: function(k){
				return this.keyState[k];
			},
			isKeyUp: function(k){},
            clearKeyPress: function(){
                for(let i = 0; i < this.keyIsPressed.length; i++) this.keyIsPressed[i] = false;
            }
		},
		mouse: {
			pos: null,
            isIn: false,
            rightClick: true,
            overButton: false,
			mouseState: [],
			mouseIsPressed: [],
			listener: function(){
				this.pos = new Point(0,0);
				let _pos = this.pos;

				this.mouseState.push(false);
				this.mouseIsPressed.push(false);

                let _mouseState = this.mouseState;
				let _mouseIsPressed = this.mouseIsPressed;

				if(!game.inputs.device.isTablet()){
					game.screen.canvas.onmousemove = function(e){
						_pos.x = e.offsetX;
						_pos.y = e.offsetY;
					},
					document.onmousedown = function(){
						if(_mouseState[0] != true) _mouseIsPressed[0] = true;
						_mouseState[0] = true;
					},
					document.onmouseup = function(){
						_mouseIsPressed[0] = false;
	                    _mouseState[0] = false;
					},
	                game.screen.canvas.onmouseover = function(){
	                    game.inputs.mouse.isIn = true;
	                },
					game.screen.canvas.onmouseout = function(){
						game.inputs.mouse.isIn = false;
						_mouseState[0] = false;
						_mouseIsPressed[0] = false;
					},
					document.oncontextmenu = function(){
						return game.inputs.mouse.rightClick;
					}
				}
				else{
					game.screen.canvas.addEventListener('touchstart', function(e){
						e.preventDefault();
						_pos.x = e.changedTouches[0].pageX;
						_pos.y = e.changedTouches[0].pageY;
						if(_mouseState[0] != true) _mouseIsPressed[0] = true;
						_mouseState[0] = true;
					}, false);
					game.screen.canvas.addEventListener('touchend', function(){
						_mouseIsPressed[0] = false;
	                    _mouseState[0] = false;
					}, false);
				}

			},
			isMousePress: function(){
				return this.mouseIsPressed[0];
			},
			isMouseDown: function(){
				return this.mouseState[0];
			},
			isMouseUp: function(){
				//return !this.mouseState;
			},
            initKeys: function(){

            },
            clearClickPress: function(){
                this.mouseIsPressed[0] = false;
            },
			checkColMouseRect: function(rect){
				return this.pos.x >= rect.x*game.screen.scale &&
				this.pos.x <= (rect.x + rect.width)*game.screen.scale &&
				this.pos.y >= rect.y*game.screen.scale &&
				this.pos.y <= (rect.y + rect.height)*game.screen.scale;
			}
		},
		device: {
			isTablet: function(){
				return navigator.userAgent.match(/Tablet|iPad|iPhone|Android/i);
			}
		}
	},
	math: {
		hypotenuse: function(dist1, dist2){
			return Math.sqrt(dist1*dist1 + dist2*dist2);
		},
		hypotNormalized : function(dist1, dist2){
			let h = this.hypotenuse(dist1, dist2);
			return new Point(dist1/h, dist2/h);
		},
		pointsDistance: function(point1, point2){
			return this.hypotenuse(point2.x - point1.x, point2.y - point1.y);
		},
		randomInt: function(n){
			return Math.floor(Math.random() * (n+1));
		},
		randomRangeInt: function(min, max){
			return Math.floor(Math.random() * ((max+1) - min)) + min;
		},
		toDegrees: function(angle){
			return angle * (180/Math.PI);
		},
		toRadians: function(angle){
			return angle * (Math.PI/180);
		}
	},
	physics: {
            checkColRectangles: function(rect1, rect2){
                return (rect1.x + rect1.width)*game.screen.scale >= rect2.x*game.screen.scale &&
				rect1.x*game.screen.scale <= (rect2.x + rect2.width)*game.screen.scale &&
				(rect1.y + rect1.height)*game.screen.scale >= rect2.y*game.screen.scale &&
				rect1.y*game.screen.scale <= (rect2.y + rect2.height)*game.screen.scale;
			},
			checkColCircles: function(circle1, circle2){
				return game.math.pointsDistance(circle1.pos, circle2.pos)*game.screen.scale <= (circle1.rad + circle2.rad)*game.screen.scale ? true : false;
			},
			checkColCircleRect: function(circle, rect){
				return false;
			},
			checkColPointRect: function(point, rect){
				return point.x*game.screen.scal >= rect.x*game.screen.scale &&
				point.x*game.screen.scal <= (rect.x + rect.width)*game.screen.scale &&
				point.y*game.screen.scal >= rect.y*game.screen.scale &&
				point.y*game.screen.scal <= (rect.y + rect.height)*game.screen.scale;
			},
			checkColPointCircle: function(point, circle){
				return game.math.hypotenuse(circle.x - point.x, circle.y - point.y)*game.screen.scale <= circle.rad*game.screen.scale;
			}
    },
	utils: {
		debugMode: false,
		color: {
			collider: "#3F9"
		},
		keycode: {
			backspace: 8, tab:	9,
			enter:	13, shift:	16,
			ctrl:	17, alt:	18,
			up:		38, down:	40,
			left:	37, right:	39,
			enter:	13, space:	32,
			n0:	48, n1:	49,
			n2:	50, n3:	51,
			n4:	52, n5:	53,
			n6:	54, n7:	55,
			n8:	56, n9:	57,
			a:	65, b:	66, c:	67,
			d:	68, e:	69, f:	70,
			g:	71, h:	72, i:	73,
			j:	74, k:	75, l:	76,
			m:	77, n:	78, o:	79,
			p:	80, q:	81, r:	82,
			s:	83, t:	84, u:	85,
			v:	86, w:	87, x:	88,
			y:	89, z:	90
		},
		addZeros: function(num, maxZeros){
			let n = num + "";
			let zeros = "";
			for(let i = 0; i < maxZeros - n.length; i++)  zeros += "0";
			return zeros + n;
		},
        textWidth: function(text){
            return game.screen.context.measureText(text).width;
        }
	},
	init: function(){},
	update: function(){},
	canvas: function(){},
    reset: function(){
        location.reload();
    }
}

//Classes
class Point{
	constructor(x, y){
		this.x = x != null ? x : 0;
		this.y = y != null ? y : 0;
	}
}
class Rect{
	constructor(x, y, width, height){
		this.x = x != null ? x : 100;
		this.y = y != null ? y : 100;
		this.width = width != null ? width : 64;
		this.height = height != null ? height : 64;
	}
	getPos(){
		return new Point(this.x, this.y);
	}
    getBounds(){
        return new Rect(this.x, this.y, this.width, this.height);
    }
}
class Circle{
	constructor(pos, rad){
		this.pos = pos != null ? pos : { x: 0, y: 0 };
		this.rad = rad != null ? rad : 1;
	}
}
class Polygon{
    constructor(points){
        this.points = new Array(points.length);
        for(let i=0; i<points.length; i++) this.points[i] = points[i];
    }
}

class DrawableObject extends Rect{
    constructor(texture, rect, imgRect){
        super(rect.x, rect.y, rect.width, rect.height);
        this.texture = texture;
        this.imgRect = imgRect;

    }
    draw(){
        if(typeof this.texture === typeof "") game.draw.rectR(this.getBounds(), this.texture);
        else{
            const _r = this.imgRect == null ? new Rect(0, 0, this.texture.width, this.texture.height) : this.imgRect;
            game.draw.imageRegionR(this.texture, this.getBounds(), _r);
        }
    }
}
class ColliderObject extends DrawableObject{
    constructor(){
        super();
        this.collider = new Rect(0, 0, this.width, this.height);
    }
    draw(){
        super.draw();
        if(game.utils.debbugMode)
        {
            game.draw.rectLine(this.getCollider(), 1, game.utils.color.collider);
        }
    }
    getCollider(){
        return new Rect(this.x + this.collider.x, this.y + this.collider.y, this.collider.width, this.collider.height);
    }
}

class Button extends DrawableObject {
    constructor(text, rect, texture){
        super(texture, rect);
        this.text = text;
    }
    isOver(){
        return game.inputs.mouse.checkColMouseRect(this.getBounds());
    }
    isClick(type){
		return type == "Down" ? game.inputs.mouse.isMouseDown() : game.inputs.mouse.isMousePress() && this.isOver();
    }
    draw(){
        super.draw();
        game.draw.text(this.text, this.getBounds().x + this.getBounds().width/2, this.getBounds().y + this.getBounds().height/2 + 10, this.getBounds().height/2, "white", "center");
        if(!game.inputs.mouse.overButton && this.isOver()) game.inputs.mouse.overButton = true;
    }
}
