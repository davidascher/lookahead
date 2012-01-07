var ball;
var lastBarHit = -1;
var S = 16;
var OFF_X = 64;
var OFF_Y = 32;

Crafty.c("Shooter", {	
	_speed: 2,
    _moving: false,
	init: function() {
            this._movement= { x: 0, y: 0};
	},
	shooter: function(direction) { // direction is one of TL, TR, BL, BR
		if (direction == "TL") {
			this._movement = {x: -1, y: -1}
		} else if (direction == "TR") {
			this._movement = {x: 1, y: -1}
		} else if (direction == "BL") {
			this._movement = {x: -1, y: 1}
		} else if (direction == "BR") {
			this._movement = {x: 1, y: 1}
		} else {
			alert('oops');
		}
		
		this.bind("KeyDown", function(e) {
			if(e.key == Crafty.keys.SPACE) {
				this._moving = ! this._moving;
			}
		})
		.bind("EnterFrame",function() {
			if(this._moving) {
				this.x += this._movement.x * this._speed;
				this.y += this._movement.y * this._speed;
				this.trigger('Moved', {x: this.x - this._movement.x * this._speed, y: this.y * this._speed});
			}
		})
		.bind("Moved", function() {
			var hit;
			var hits = this.hit('solid');
	        if (hits.length) {
	        	hit = hits[0].obj;
	        	if (hit === lastBarHit) return;
	        	console.log(this._x, this._x + this._movement.x, OFF_X + Math.round((this._x-OFF_X) / (1.0*S)) * S);
	        	console.log(this._y, this._y + this._movement.y, OFF_Y + Math.round((this._y-OFF_Y) / (1.0*S)) * S);

	        	if (hit.orientation == 'horizontal') {
		            this._movement.y *= -1;
		        } else {
		        	this._movement.x *= -1;
		        }
	        	this._x = OFF_X + Math.round((this._x-OFF_X) / (1.0*S)) * S + this._movement.x * this._speed * 2;
	        	this._y = OFF_Y + Math.round((this._y-OFF_Y) / (1.0*S)) * S + this._movement.y * this.	_speed * 2;
	        	// console.log(this._x, this._y);
	            if (hit.has('bar')) {
	            	lastBarHit = hit;
            		hit.rotation += 90;
	        		if (hit.orientation == 'horizontal')
	        			hit.orientation = 'vertical';
	        		else
	        			hit.orientation = 'horizontal'
			    }
		        return;
	        }
	    });

        //Apply movement if key is down when created
        if(Crafty.keydown[Crafty.keys['SPACE']]) {
            this.trigger("KeyDown", {key: Crafty.keys['SPACE'] });
        }
		
		return this;
	},
});


function generateWorld() {
	var x,y,w,h;
	for (var i = 0; i < 15; i ++) {
		for (var j = 0; j < 9; j ++) {
			if (! (i % 2) != (j % 2)) {
			Crafty.e("2D, DOM, littledot")
				.attr({ x: OFF_X + i * S*2 + S, y: OFF_Y + j * S*2  + S});
			}
		}
	}
	x=OFF_X;
	y=OFF_Y+S;
	w=12;
	h=S*20-2*S;
	Crafty.e("2D, DOM, Color, Collision, wall, solid")
		.color('yellow')
	   	.attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
	   	.collision();
	x = OFF_X + S*32-2;
	y = OFF_Y + S;
	w = 12;
	h = S*20-2*S
	Crafty.e("2D, DOM, Color, Collision, wall, solid")
		.color('yellow')
	   	.attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
	   	.collision();
	x = OFF_X + S;
	y = OFF_Y;
	w = S*32-2*S;
	h = 12;
	Crafty.e("2D, DOM, Color, Collision, wall, solid")
		.color('yellow')
	   	.attr({x:x, y:y, w:w, h:h, orientation:'horizontal'})
	   	.collision();
	x = OFF_X + S;
	y = OFF_Y + S*20-2;
	w = S*32-2*S;
	h = 12;
	Crafty.e("2D, DOM, Color, Collision, wall, solid")
		.color('yellow')
	   	.attr({x:x, y:y, w:w, h:h, orientation:'horizontal'})
		.origin("center")
	   	.collision();
	   
	var player1_walls = [
		[1,3],
		[1,5],
		[1,7],
		[2,4],
		[2,6],
		[3,5]
		];
	var bar, horiz, vert, w, h, x, y;
	for (var index =0; index < player1_walls.length; index++) {
		horiz = player1_walls[index][0];
		vert = player1_walls[index][1];
		w = S/2;
		h = S*3.5;
		x = OFF_X + horiz * 2 * S - w/2;
		y = OFF_Y + vert * 2 * S - h/2;

		Crafty.e("2D, DOM, Color, Collision, bar, solid")
			.color('green')
			.attr({x: x, y: y, w: w, h: h, orientation: 'vertical'})
			.collision()
			.origin("center")
	}

	var player2_walls = [
		[15,3],
		[15,5],
		[15,7],
		[14,4],
		[14,6],
		[13,5]
		];
	for (var index =0; index < player2_walls.length; index++) {
		horiz = player2_walls[index][0];
		vert = player2_walls[index][1];
		w = S/2;
		h = S*3.5;
		x = OFF_X + horiz * 2 * S - w/2;
		y = OFF_Y + vert * 2 * S - h/2;

		bar = Crafty.e("2D, DOM, Color, Collision, bar, solid")
			.color('blue')
			.attr({x: x, y: y, w: w, h: h, orientation: 'horizontal'})
			.origin("center");
		bar.rotation += 90;
		bar.collision();
	}

	x = OFF_X + S;
	y = OFF_Y + S;
	w = 11;
	h = 11;
	ball = Crafty.e("2D, DOM, Collision, ball, Shooter, bounce")
		.attr({x: x, y: y, w: w, h: h})
		// .collision(new Crafty.polygon([x+w/2-1,y+h/2-1],[x+w/2+1,y+h/2-1],[x+w/2+1,y+h/2+1],[x+w/2-1,y+h/2+1]))
		.origin("center")
		.collision()
		.shooter('BR');
}

Crafty.c("shoot", {
	init:function() {
		
	},
	shoot: function() {
		return this;
	},
})

window.onload = function () {
	//start crafty
	Crafty.init(640, 400);
	Crafty.canvas.init();

	//the loading screen that will display while our assets load
	Crafty.scene("loading", function () {
		//load takes an array of assets and a callback when complete
		Crafty.load(["tiles.png"], function () {
		    //turn the sprite map into usable components
		    Crafty.sprite(32, "tiles.png", {
		        littledot: [1, 0],
		    });
			Crafty.scene("main"); //when everything is loaded, run the main scene
		});

		//black background with some loading text
		Crafty.background("#000");
		Crafty.e("2D, DOM, Text").attr({ w: 300, h: 30, x: 150, y: 120 })
		.text("Loading")
		.css({ "text-align": "center" });
		});   //automatically play the loading scene
		Crafty.scene("loading");

		Crafty.scene("main", function() {
			generateWorld();
		});
	};

