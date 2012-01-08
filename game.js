var ball;
var lastBarHit = -1;
var S = 16;
var OFF_X = 64;
var OFF_Y = 32;


function oneTwoPlayers() {
}


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

intersectLineLine = function(a1, a2, b1, b2) {
    var result;
    
    var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
    var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
    var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;

        if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
            return {x: a1.x + ua * (a2.x - a1.x),
                    y: a1.y + ua * (a2.y - a1.y)}
        }
    }
};


Crafty.c("Shooter", {   
    _speed: 5,
    _moving: true,
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
            if (e.key == Crafty.keys.A) {
                console.log("TRIGGERING");
                Crafty('bar').each(function() {
                    this.rotation += 10;
                })
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
            var motion, p1, p2, left, right, top, bottom, leftend, rightend, before, after, o, walls;

            solids = Crafty("solid");
            for (var i = 0; i < solids.length; i++) {
                solid = Crafty(solids[i]);
                if (solid[0] == lastBarHit) continue;
                o = {x: solid.x + solid.w/2, y: solid.y + solid.h/2};
                if (solid.orientation == 'vertical' || ! solid.has('bar')) {
                    left = o.x-solid.w/2;
                    right = o.x+solid.w/2;
                    top = o.y-solid.h/2;
                    bottom = o.y+solid.h/2;
                } else {
                    left = o.x-solid.h/2;
                    right = o.x+solid.h/2;
                    top = o.y-solid.w/2;
                    bottom = o.y+solid.w/2;
                }
                if (solid.orientation == 'horizontal') {
                    mode = 'horizontal';
                    p1 = new Vector(left, o.y);
                    p2 = new Vector(right, o.y);
                } else {
                    mode = 'vertical';
                    p1 = new Vector(o.x, top);
                    p2 = new Vector(o.x, bottom);
                }
                before = new Vector(this.x-args.dx, this.y-args.dy)
                after = new Vector(this.x, this.y);
                p = intersectLineLine(p1, p2, before, after)
                if (p) {
                    this._x = p.x;
                    this._y = p.y;
                    console.log("moving to", p.x, p.y);
                    console.log('wall goes from ('+p1.x+','+p1.y+') to ('+p2.x+','+p2.y+')')
                    if (mode == 'horizontal') 
                        this._movement.y *= -1;
                    else 
                        this._movement.x *= -1;
                    if (solid.has('bar')) {
                        lastBarHit = solid[0];
                        console.log("Rotating", lastBarHit);
                        solid.rotation += 90;
                        console.log("rotation is now", solid.rotation)
                        if (solid.orientation == 'horizontal')
                            solid.orientation = 'vertical';
                        else
                            solid.orientation = 'horizontal'
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

    for (var i = 0; i < 11; i ++) {
        Crafty.e("2D, DOM, Color")
            .color('rgba(255,255,255,.2)')
            .attr({ x: OFF_X, 
                    y: OFF_Y + i * 2*S,
                    w: 513, h: 1})
    }
    for (var i = 0; i < 17; i ++) {
        Crafty.e("2D, DOM, Color")
            .color('rgba(255,255,255,.2)')
            .attr({ x: OFF_X + i * 2*S, 
                    y: OFF_Y,
                    w: 1, h: 320})
    }


    for (var i = 0; i < 17; i ++) {
        for (var j = 0; j < 11; j ++) {
            if (! (i % 2) != (j % 2)) {
            Crafty.e("2D, DOM, Color, dot")
                .color('grey')
                .attr({ x: OFF_X + i * S*2 -1, 
                        y: OFF_Y + j * S*2 -1,
                        w: 3, h: 3})
            }
        }
    }
    w=3;
    x=OFF_X+.5-w/2;
    y=OFF_Y+2*S;
    h=S*20-4*S;
    Crafty.e("2D, DOM, Color, Collision, Persist, wall, solid, vertical")
        .color('yellow')
        .attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
        .origin('center')
        .collision();
    w = 3;
    x = OFF_X + S*32+.5-w/2;
    y = OFF_Y + 2*S;
    h = S*20-4*S
    Crafty.e("2D, DOM, Color, Collision, Persist, wall, solid, vertical")
        .color('red')
        .attr({x:x, y:y, w:w, h:h, orientation:'vertical'})
        .origin('center')
        .collision();
    h = 3;
    x = OFF_X + 2*S;
    y = OFF_Y+.5-h/2;
    w = S*32-4*S;
    Crafty.e("2D, DOM, Color, Collision, Persist, wall, solid, horizontal")
        .color('blue')
        .attr({x:x, y:y, w:w, h:h, orientation:'horizontal'})
        .origin('center')
        .collision();
    h = 3;
    x = OFF_X + 2*S;
    y = OFF_Y + S*20+.5-h/2;
    w = S*32-4*S;
    Crafty.e("2D, DOM, Color, Collision, Persist, wall, solid, horizontal")
        .color('green')
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
        w = 3;
        h = S*3.5;
        x = OFF_X + horiz * 2 * S +.5 - w/2;
        y = OFF_Y + vert * 2 * S - h/2;

        e = Crafty.e("2D, DOM, Persist, Color, bar, solid")
            .color('green')
            .attr({x: x, y: y, w: w, h: h, orientation: Math.random() > .5 ? 'vertical' : 'horizontal'})
            .origin("center");
        if (e.orientation == 'horizontal')
            e.rotation += 90;
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
        w = 3;
        h = S*3.5;
        x = OFF_X + horiz * 2 * S + .5 - w/2;
        y = OFF_Y + vert * 2 * S - h/2;

        bar = Crafty.e("2D, DOM, Persist, Color, bar, solid")
            .color('blue')
            .attr({x: x, y: y, w: w, h: h, orientation: Math.random() > .5 ? 'vertical' : 'horizontal'})
            .origin("center");
        if (bar.orientation == 'horizontal')
            bar.rotation += 90;
    }
}

function doMenu(message, triggermap) {
    menu = Crafty.e("2D, DOM, Text, Prompt").attr({ w: 100, h: 20, x: 150, y: 60 })
            .css('opacity', '0')
            .text(message)
            .css({ "text-align": "center"});
    var keycode, keycodemap = {};
    for (var key in triggermap) {
        keycode = Crafty.keys[key];
        keycodemap[keycode] = triggermap[key];
    }
    console.log(keycodemap);

    menu.bind("KeyDown", function(e) {
        if (keycodemap[e.key] != undefined) {
            menu.destroy();
            console.log(keycodemap[e.key])
            Crafty.trigger(keycodemap[e.key]);
        }
    })
}

window.onload = function () {
    Crafty.init(640, 400);
    // Crafty.canvas.init();
    var bg = Crafty.background("#000");
    Crafty.bind('everybodyrotate', function() {
        Crafty('bar').each(function() {
            this.rotation += 10;
        })
    })
    Crafty.bind("KeyDown", function(e) {
        if (e.key == Crafty.keys.A) {
            console.log("TRIGGERING");
            Crafty('bar').each(function() {
                this.rotation += 45;
            })
        }
    })
    Crafty.bind("1or2?", function() {
        doMenu("(1) or (2) players?", {'1': 'moveorshoot?', '2': 'moveroshoot?'})
    })
    Crafty.bind("toporbottom?", function() {
        doMenu("(T)op or (B)ottom?", {'T': 'shoottop!', 'B': 'shootbottom!'})
    })
    Crafty.bind("shoottop!", function() {
        x = OFF_X + S;
        y = OFF_Y + S-2;
        w = 5;
        h = 5;
        ball = Crafty.e("2D, DOM, Persist, Collision, ball, Shooter, bounce")
            .attr({x: x, y: y, w: w, h: h})
            // .origin("center")
            // .collision()
            .shooter('BR');
    });
    Crafty.bind("shootbottom!", function() {
        x = OFF_X + S;
        y = OFF_Y + S;
        w = 11;
        h = 11;
        ball = Crafty.e("2D, DOM, Persist, Collision, ball, Shooter, bounce")
            .attr({x: x, y: y, w: w, h: h})
            .origin("center")
            .collision()
            .shooter('BR');
    });
    Crafty.bind("moveorshoot?", function() {
        doMenu("(M)ove or (S)hoot?", {'M': 'direction?', 'S': 'toporbottom?'})
    })
    generateWorld();
    Crafty.trigger("1or2?");
};

