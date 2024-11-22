/*
* Matthew Vaughan
* A gravity simulator using Newton's forumla for Universal Gravity
* Not my best work... a lot of copy-paste-edit
* My first attempt at 3-D rendering
*/

// Quick and dirty rendering of a virtual space corresponding to the canvas height and width
const WIDTH = 800
const HEIGHT = 600
const DEPTH = 800 // used for calculating coefficient 

const canvas = document.getElementById("canvas")
canvas.width = WIDTH
canvas.height = HEIGHT

class PointMass {
    constructor( x, y, z, mass ) {
        this.x = x
        this.y = y
        this.z = z
        this.mass = mass
    }

    centerOfMass( pointmass ) {
        const mass = this.mass + pointmass.mass
        const x = (this.x*this.mass + pointmass.x*pointmass.mass) / mass
        const y = (this.y*this.mass + pointmass.y*pointmass.mass) / mass
        const z = (this.z*this.mass + pointmass.z*pointmass.mass) / mass
        return new PointMass(x, y, z, mass)
    }

    draw( ctx ) {
        ctx.save()
        ctx.strokeStyle = "rgb(255,30,30)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(this.x, this.y, 3, 0, 2.0 * Math.PI)
        ctx.stroke()
        ctx.restore()
    }
}

class EmptyPointMass {
    constructor() { }

    centerOfMass( pointmass ) {
        return pointmass
    }
}

class Circle {
    constructor( density, radius, x, y, z ) {
        this.density = density
        this.radius  = radius
        this.x       = x
        this.y       = y
        this.z       = z
        this.dx      = 0
        this.dy      = 0
        this.dz      = 0
        this.volume  = (4.0/3.0) * Math.PI * this.radius * this.radius * this.radius
        this.mass    = this.density * this.volume
    }

    pointMass() {
        return new PointMass(this.x, this.y, this.z, this.mass)
    }

    accel( centerOfMass ) {
        const G = 0.01
        const ddx = G * (centerOfMass.mass - this.mass) / (centerOfMass.x*centerOfMass.x)
        const ddy = G * (centerOfMass.mass - this.mass) / (centerOfMass.y*centerOfMass.y)
        const ddz = G * (centerOfMass.mass - this.mass) / (centerOfMass.z*centerOfMass.z)
        
        // accelerate on x-axis
        if (this.x < centerOfMass.x) {
            this.dx += ddx
        } else {
            this.dx -= ddx
        }
        // accelerate on y-axis
        if (this.y < centerOfMass.y) {
            this.dy += ddy
        } else {
            this.dy -= ddy
        }
        // accelerate on z-axis
        if (this.z < centerOfMass.z) {
            this.dz += ddz
        } else {
            this.dz -= ddz
        }
        // move
        this.x += this.dx
        this.y += this.dy
        this.z += this.dz
        // wrap to view
        //if (this.x > WIDTH) this.x = 0
        //if (this.x <= 0 ) this.x = WIDTH
        //if (this.y > HEIGHT) this.y = 0
        //if (this.y <= 0) this.y = HEIGHT
    }

    // returns 3-d vertices as array
    // it's a diamond right now, for simplicity sake
    vertices() {
        // aspect ratio
        const xar = 2.0 / WIDTH
        const yar = 2.0 / HEIGHT
        const zar = 2.0 / DEPTH
        let vs = [
            // top (0 - 4)
            this.x,  this.y+this.radius,  this.z,
            this.x-(this.radius*0.50), this.y+(this.radius*Math.sqrt(0.5)), this.z-(this.radius*0.50),
            this.x+(this.radius*0.50), this.y+(this.radius*Math.sqrt(0.5)), this.z-(this.radius*0.50),
            this.x-(this.radius*0.50), this.y+(this.radius*Math.sqrt(0.5)), this.z+(this.radius*0.50),
            this.x+(this.radius*0.50), this.y+(this.radius*Math.sqrt(0.5)), this.z+(this.radius*0.50),
            // upper back (5 - 8)
            this.x-(this.radius*0.50), this.y+(this.radius*0.5), this.z-(this.radius*Math.sqrt(0.5)),
            this.x-(this.radius*Math.sqrt(0.5)), this.y+(this.radius*0.5), this.z-(this.radius*0.50),
            this.x+(this.radius*Math.sqrt(0.5)), this.y+(this.radius*0.5), this.z-(this.radius*0.50),
            this.x+(this.radius*0.50), this.y+(this.radius*0.5), this.z-(this.radius*Math.sqrt(0.5)),
            // upper front (9 - 12)
            this.x-(this.radius*0.50), this.y+(this.radius*0.5), this.z+(this.radius*Math.sqrt(0.5)),
            this.x-(this.radius*Math.sqrt(0.5)), this.y+(this.radius*0.5), this.z+(this.radius*0.50),
            this.x+(this.radius*Math.sqrt(0.5)), this.y+(this.radius*0.5), this.z+(this.radius*0.50),
            this.x+(this.radius*0.50), this.y+(this.radius*0.5), this.z+(this.radius*Math.sqrt(0.5)),            
            // center (13 - 20)
            this.x-this.radius, this.y, this.z,
            this.x-(this.radius*Math.sin(Math.PI/4)), this.y, this.z-(this.radius*Math.sin(Math.PI/4)),
            this.x, this.y, this.z-this.radius,
            this.x+(this.radius*Math.sin(Math.PI/4)), this.y, this.z-(this.radius*Math.sin(Math.PI/4)),
            this.x+this.radius, this.y, this.z,
            this.x+(this.radius*Math.sin(Math.PI/4)), this.y, this.z+(this.radius*Math.sin(Math.PI/4)),
            this.x, this.y, this.z+this.radius,
            this.x-(this.radius*Math.sin(Math.PI/4)), this.y, this.z+(this.radius*Math.sin(Math.PI/4)),
            // lower back (20 - 23)
            this.x-(this.radius*0.50), this.y-(this.radius*0.5), this.z-(this.radius*Math.sqrt(0.5)),
            this.x-(this.radius*Math.sqrt(0.5)), this.y-(this.radius*0.5), this.z-(this.radius*0.50),
            this.x+(this.radius*Math.sqrt(0.5)), this.y-(this.radius*0.5), this.z-(this.radius*0.50),
            this.x+(this.radius*0.50), this.y-(this.radius*0.5), this.z-(this.radius*Math.sqrt(0.5)),
            // lower front (24 - 27)
            this.x-(this.radius*0.50), this.y-(this.radius*0.5), this.z+(this.radius*Math.sqrt(0.5)),
            this.x-(this.radius*Math.sqrt(0.5)), this.y-(this.radius*0.5), this.z+(this.radius*0.50),
            this.x+(this.radius*Math.sqrt(0.5)), this.y-(this.radius*0.5), this.z+(this.radius*0.50),
            this.x+(this.radius*0.50), this.y-(this.radius*0.5), this.z+(this.radius*Math.sqrt(0.5)),
            // bottom (28 - 32)
            this.x-(this.radius*0.50), this.y-(this.radius*Math.sqrt(0.5)), this.z-(this.radius*0.50),
            this.x+(this.radius*0.50), this.y-(this.radius*Math.sqrt(0.5)), this.z-(this.radius*0.50),
            this.x-(this.radius*0.50), this.y-(this.radius*Math.sqrt(0.5)), this.z+(this.radius*0.50),
            this.x+(this.radius*0.50), this.y-(this.radius*Math.sqrt(0.5)), this.z+(this.radius*0.50),
            this.x, this.y-this.radius, this.z
        ]
        for( var i=0; i < vs.length; i=i+3 ) {
            vs[i]   = xar*vs[i] - 1
            vs[i+1] = yar*vs[i+1] - 1
            vs[i+2] = zar*vs[i+2] - 1
        }
        return vs
        return [ 
            -1 + xar*(this.x-this.radius), -1 + yar*this.y,               -1 + zar*this.z,
            -1 + xar*this.x,               -1 + yar*(this.y+this.radius), -1 + zar*this.z,
            -1 + xar*(this.x+this.radius), -1 + yar*this.y,               -1 + zar*this.z,
            -1 + xar*this.x,               -1 + yar*(this.y-this.radius), -1 + zar*this.z,
            -1 + xar*this.x,               -1 + yar*this.y,               -1 + zar*(this.z+this.radius),
            -1 + xar*this.x,               -1 + yar*this.y,               -1 + zar*(this.z-this.radius)]
    }

    draw( ctx ) {
        // 2-d part
        const densityColor = 255 - Math.floor(this.density * 75)
        ctx.save()
        ctx.strokeStyle = "rgb(200, " + densityColor + ", " + densityColor + ")"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, 2.0 * Math.PI)
        ctx.stroke()
        ctx.restore()
    }
}

const circles = [   new Circle(1.0, 10.0, 250, 350, 30), new Circle(1.0, 60.0, 350, 350, 400), 
                    new Circle(1.0, 9.0, 350, 470, 100), new Circle(1.0, 7.0, 450, 150, 500),
                    new Circle(1.0, 11.0, 575, 400, 200), new Circle(1.0, 8,0, 75, 175, 600) ] 

function centerOfMass( circles ) {
    let centerOfMass = new EmptyPointMass()
    circles.forEach(circle => {
        centerOfMass = centerOfMass.centerOfMass(circle.pointMass())  
    })
    return centerOfMass 
}

/*==================== Rotation ====================*/
function rotateZ(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]-s*m[1];
    m[4] = c*m[4]-s*m[5];
    m[8] = c*m[8]-s*m[9];

    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;
}

function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1]*c-m[2]*s;
    m[5] = m[5]*c-m[6]*s;
    m[9] = m[9]*c-m[10]*s;

    m[2] = m[2]*c+mv1*s;
    m[6] = m[6]*c+mv5*s;
    m[10] = m[10]*c+mv9*s;
}

function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv0 = m[0], mv4 = m[4], mv8 = m[8];

    m[0] = c*m[0]+s*m[2];
    m[4] = c*m[4]+s*m[6];
    m[8] = c*m[8]+s*m[10];

    m[2] = c*m[2]-s*mv0;
    m[6] = c*m[6]-s*mv4;
    m[10] = c*m[10]-s*mv8;
}

/*==================== MATRIX =====================*/
function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
    return [
        0.5/ang, 0 , 0, 0,
        0, 0.5*a/ang, 0, 0,
        0, 0, -(zMax+zMin)/(zMax-zMin), -1,
        0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
    ];
}
var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);
var mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
var view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
// translating z
view_matrix[14] = view_matrix[14]-3;//zoom


function allIndices( points ) {
    let indices = []
    for( let i=0; i < points.length/3; i++ ) {
        for( let j=i+2; j < points.length/3; j++ ) {
            indices = indices.concat([i,i+1,j])
        }
    }
    return indices
}

var time_old = null
function drawGL(time) {
    if ( time_old === null ) time_old = time
    
    const gl = document.getElementById("canvas").getContext("experimental-webgl")

    var vertices = []
    var indices = []
    var colors = []
    circles.forEach(circle => {
        const vs = circle.vertices()
        const ics = allIndices(vs)
        
        const color1 = 2 + (vertices.length/vs.length % 5)
        const color2 = (vertices.length/vs.length % 2)
        const color3 = 2 * (vertices.length/vs.length % 3)

        vertices = vertices.concat(vs)
        indices = indices.map(i => i + vs.length/3).concat(ics) 
        /*indices = indices.map(i => i + 20).concat([
            0,1,2, 0,1,3,  0,2,3, 0,2,4,
            1,2,7, 2,7,9, 1,3,5, 3,5,13, 2,4,14, 4,14,12, 3,4,10, 4,10,11, 
            //3,5,7, 3,5,11, 3,7,9, 3,6,12,
            15,16,7, 16,7,9, 15,17,5, 17,5,13, 16,18,14, 18,14,12, 17,18,10, 18,10,11,
            19,15,16, 19,15,17, 19,16,17, 19,16,18
            //0,1,4,  4,1,2,  0,1,5,  5,1,2,  0,3,4,  0,3,5,  2,3,4,  2,3,5
        ])*/
        
        while( colors.length < vertices.length ) {
            colors = colors.concat([color1,color2,color3])
        }
    })

    // Create and store data into vertex buffer
    var vertex_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Create and store data into color buffer
    var color_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Create and store data into index buffer
    var index_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    /*=================== Shaders =========================*/
    var vertCode = 'attribute vec3 position;'+
    'uniform mat4 Pmatrix;'+
    'uniform mat4 Vmatrix;'+
    'uniform mat4 Mmatrix;'+
    'attribute vec3 color;'+//the color of the point
    'varying vec3 vColor;'+

    'void main(void) { '+//pre-built function
        'gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);'+
        'vColor = color;'+
    '}';

    var fragCode = 'precision mediump float;'+
    'varying vec3 vColor;'+
    'void main(void) {'+
        'gl_FragColor = vec4(vColor, 1.);'+
    '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);

    /* ====== Associating attributes to vertex shader =====*/
    var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
    var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
    var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var position = gl.getAttribLocation(shaderProgram, "position");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false,0,0) ;

    // Position
    gl.enableVertexAttribArray(position);
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var color = gl.getAttribLocation(shaderProgram, "color");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false,0,0) ;

    // Color
    gl.enableVertexAttribArray(color);
    gl.useProgram(shaderProgram);

    /*================= Drawing ===========================*/    
    var dt = time-time_old;
    rotateZ(mov_matrix, dt*0.00005);//time
    rotateY(mov_matrix, dt*0.00002);
    rotateX(mov_matrix, dt*0.00003);
    time_old = time;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // find center of mass and apply acceleration
    const com = centerOfMass(circles)
    circles.forEach(circle => {
        circle.accel(com)
    })

    window.requestAnimationFrame(drawGL)
}

function draw() {
    // the 2-d canvas
    const ctx = document.getElementById("canvas").getContext("2d")
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // draw circles(
    for( var i = 0; i < circles.length; i++ ) {
        circles[i].draw(ctx)
    }

    // calculate center of mass
    const com = centerOfMass(circles)

    com.draw(ctx)

    // accelerate
    circles.forEach(circle => {
        circle.accel(com)
    })

    window.requestAnimationFrame(draw)
}

window.requestAnimationFrame(drawGL)
