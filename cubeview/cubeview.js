
// Quick and dirty rendering of a virtual space corresponding to the canvas height and width
const WIDTH = 400
const HEIGHT = 400
const DEPTH = 400 // used for calculating coefficient 

const canvas = document.getElementById("canvas")
canvas.width = WIDTH
canvas.height = HEIGHT

class Cube {
    constructor(x, y, z, length, color) {
        this.x = x
        this.y = y
        this.z = z
        this.length = length
        this.color = color // should be an array of 3
    }

    vertices() {
        // aspect ratio
        const xar = 2.0 / WIDTH
        const yar = 2.0 / HEIGHT
        const zar = 2.0 / DEPTH
        // produce vertices
        let vs = [
            // back
            this.x - this.length, this.y - this.length, this.z - this.length, // left bottom
            this.x + this.length, this.y - this.length, this.z - this.length, // right bottom
            this.x - this.length, this.y + this.length, this.z - this.length, // left top
            this.x + this.length, this.y + this.length, this.z - this.length, // right top 
            // front
            this.x - this.length, this.y - this.length, this.z + this.length, // left bottom
            this.x + this.length, this.y - this.length, this.z + this.length, // right bottom
            this.x - this.length, this.y + this.length, this.z + this.length, // left top
            this.x + this.length, this.y + this.length, this.z + this.length // right top
        ]
        // adjust vertices for aspect ratio
        for( var i=0; i < vs.length; i=i+3 ) {
            vs[i]   = xar*vs[i] - 1
            vs[i+1] = yar*vs[i+1] - 1
            vs[i+2] = zar*vs[i+2] - 1
        }
        return vs
    }

    // provide 12 indices for cube
    indices( offset ) {
        let is = [ 
            0,1,2, 1,2,3, // back
            0,2,4, 4,6,2, // left
            1,3,5, 5,7,3, // right
            4,5,6, 5,6,7, // front
            0,1,4, 4,5,1, // bottom
            2,3,6, 6,7,3 // top
        ]
        for( let i=0; i < is.length; i++ ) {
            is[i] = is[i] + offset
        }
        return is
    }

    // provide one color per triangle (index)
    colors() {
        let cs = []
        for( let i=0; i < 12; i++ ) {
            cs = cs.concat(this.color)
        }
        return cs
    }
}

//const cubes = [   new Cube(10, 250, 350, 100, [3,0,1]) ]
const cubes = [ new Cube(10, 0, 0, 50, [0,1,1]),
                new Cube(100, 0, 0, 30, [0,1,1])]
                //, new Cube(100, 200, 50, 30, [2,1,3]),
 //                   new Cube(350, 200, 0, 30, [2,2,2])] 

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


var time_old = null
function drawGL(time) {
    if ( time_old === null ) time_old = time
    
    const gl = document.getElementById("canvas").getContext("experimental-webgl")

    let vertices = []
    let indices = []
    let colors = []
    cubes.forEach(cube => {
        indices  = indices.concat(cube.indices(vertices.length))
        vertices = vertices.concat(cube.vertices())
        colors   = colors.concat(cube.colors())
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

    // changes here

    window.requestAnimationFrame(drawGL)
}

window.requestAnimationFrame(drawGL)
