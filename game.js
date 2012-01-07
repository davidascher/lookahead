var ball;
var lastBarHit = -1;
var S = 16;
var OFF_X = 64;
var OFF_Y = 32;


function Vector(x, y){
  this.x = x;
  this.y = y;
  this.scalarMult = function(scalar){
      return new Vector(this.x * scalar, this.y * scalar);
  }
  this.dot = function(v2) {
    return this.x * v2.x + this.y * v2.y;
  };
  this.perp = function() {
    return new Vector(-1 * this.y, this.x);
  };
  this.subtract = function(v2) {
    return this.add(v2.scalarMult(-1));//new Vector(this.x - v2.x, this.y - v2.y);
  };
  this.add = function(v2) {
      return new Vector(this.x + v2.x, this.y + v2.y);
  }
}

// the cross product of vectors v1 and v2.
function cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}


function Segment(p1, p2){
  this.p1 = p1;
  this.p2 = p2;
}

var epsilon = 10e-6;
var DONT_INTERSECT = 0;
var PARALLEL_DONT_INTERSECT = 1;
var COLINEAR_DONT_INTERSECT = 2;
var INTERSECT = 3;
var COLINEAR_INTERSECT = 4;
function intersect(seg1, seg2, intersectionPoint) {
    p = seg1.p1;
    r = seg1.p2.subtract(seg1.p1);
    q = seg2.p1;
    s = seg2.p2.subtract(seg2.p1);
    rCrossS = cross(r, s);
    if(rCrossS <= epsilon && rCrossS >= -1 * epsilon){
        return PARALLEL_DONT_INTERSECT;
    }
    t = cross(q.subtract(p), s)/rCrossS;
    u = cross(q.subtract(p), r)/rCrossS;
    if(0 <= u && u <= 1 && 0 <= t && t <= 1){
        intPoint = p.add(r.scalarMult(t));
        intersectionPoint.x = intPoint.x;
        intersectionPoint.y = intPoint.y;
        return INTERSECT;
    }else{
        return DONT_INTERSECT;
    }
}



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
                this.trigger('Moved', {x: this.x - this._movement.x * this._speed, y: this._movement.y * this._speed,
                    dx: -this._movement.x*this._speed, dy: -this._movement.y*this._speed});
            }
        })
        .bind("Moved", function(args) {
            var motion, wall, left, right, top, bottom, leftend, rightend, before, after, o, walls;

            solids = Crafty("solid");
            for (var i = 0; i < solids.length; i++) {
                solid = Crafty(solids[i]);
                o = {x: solid.x + solid.w/2, y: solid.y + solid.h/2};
                left = o.x-solid.w/2;
                right = o.x+solid.w/2;
                top = o.y-solid.h/2;
                bottom = o.y+solid.h/2;
                if (solid.orientation == 'horizontal') {
                    mode = 'horizontal';
                    leftend = new Vector(left, o.y);
                    rightend = new Vector(right, o.y);
                    wall = new Segment(leftend, rightend);
                } else {
                    mode = 'vertical';
                    topend = new Vector(o.x, top);
                    bottomend = new Vector(o.x, bottom);
                    wall = new Segment(topend, bottomend);
                }
                before = new Vector(this.x-args.dx, this.y-args.dy)
                after = new Vector(this.x, this.y);
                motion = new Segment(before, after);
                var intersectionPoint = new Vector(0, 0);
                if (intersect(wall, motion, intersectionPoint) == INTERSECT) {
                    this._x = intersectionPoint.x;
                    this._y = intersectionPoint.y;
                    if (mode == 'horizontal') 
                        this._movement.y *= -1;
                    else 
                        this._movement.x *= -1;
                    if (solid.has('bar')) {
                        lastBarHit = hit;
                        x = solid;
                        this.delay(function() {
                            x.rotation += 90;
                            if (x.orientation == 'horizontal')
                                x.orientation = 'vertical';
                            else
                                x.orientation = 'horizontal'
                        },200)
                    }
                }
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
    y=OFF_Y+2*S;
    w=1;
    h=S*20-4*S;
    Crafty.e("2D, DOM, Color, Collision, wall, solid, vertical")
        .color('yellow')
        .attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
        .origin('center')
        .collision();
    x = OFF_X + S*32-2;
    y = OFF_Y + 2*S;
    w = 1;
    h = S*20-4*S
    Crafty.e("2D, DOM, Color, Collision, wall, solid, vertical")
        .color('yellow')
        .attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
        .origin('center')
        .collision();
    x = OFF_X + 2*S;
    y = OFF_Y;
    w = S*32-4*S;
    h = 1;
    Crafty.e("2D, DOM, Color, Collision, wall, solid, horizontal")
        .color('yellow')
        .attr({x:x, y:y, w:w, h:h, orientation:'horizontal'})
        .origin('center')
        .collision();
    x = OFF_X + 2*S;
    y = OFF_Y + S*20-2;
    w = S*32-4*S;
    h = 1;
    Crafty.e("2D, DOM, Color, Collision, wall, solid, horizontal")
        .color('yellow')
        .attr({x:x, y:y, w:w, h:h, orientation:'horizontal'})
        .origin('center')
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

        Crafty.e("2D, DOM, Color, Collision, bar, solid, vertical")
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

        bar = Crafty.e("2D, DOM, Color, Collision, bar, solid, horizontal")
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

