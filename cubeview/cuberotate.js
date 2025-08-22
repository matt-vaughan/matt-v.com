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
        for( let i=1; i <= 4; i++ ) {
            cs = cs.concat(this.color.map(v=>v/i))
            cs = cs.concat(this.color.map(v=>v/i))
        }
        return cs
    }
}

class CubeContainer {
    constructor() {
        this.cubes = {}
    }

    indexOf(x,y,z) {
        return ""+x+"."+y+"."+z
    }

    add(x, y, z, cube) {
        this.cubes[this.indexOf(x,y,z)] = cube
    }

    remove(x,y,z) {
        delete this.cubes[this.indexOf(x,y,z)]
    }

    forEach(f) {
        Object.values(this.cubes).forEach(f)
    }
}

class UIParameters {
    constructor() {
        this.grid = []
        for( let i=0; i < 20; i++ ) {
            let column_depths = []
            for( let j=0; j < 20; j++ ) {
                let cells = []
                for( let k=0; k < 20; k++ ) {
                    cells.push("grid_cell_unoccupied")
                }
                column_depths.push(cells)
            }
            this.grid.push(column_depths)
        }
        this.drawCubeGrid()
        document.getElementById("z_index").addEventListener("input", () => {
            this.drawCubeGrid() 
        })

        this.mouseDown = false;
    }
    
    get_cube_color() {
        const hexcode = document.getElementById("color").value
        const brightness = Number.parseFloat(document.getElementById("brightness").value)
        const red   = Number.parseInt(hexcode.substring(1,3), 16) / 255
        const green = Number.parseInt(hexcode.substring(3,5), 16) / 255
        const blue  = Number.parseInt(hexcode.substring(5,7), 16) / 255
        return [red*brightness, green*brightness, blue*brightness]
    }

    get_z_index() {
        return document.getElementById("z_index").value
    }

    get_zoom() {
        return new Number(document.getElementById("zoom").value)
    }

    drawCubeGrid() {
        const z_index = this.get_z_index()
        let xyGrid = document.getElementById('xyGrid')
        let html = "<table>";
        for( let i=19; i >= 0; i-- ) {
            html += `<tr class="grid_row">`
            for( let j=0; j < 20; j++ ) {
                // variable for holding background-color style
                var other_z_style = ""

                // determine if a cube occupies another z_index
                if ( this.grid[j][i][z_index] == "grid_cell_unoccupied" ) {
                    for ( let k=0; k < 20; k++ ) {
                        if ( this.grid[j][i][k] == "grid_cell_occupied" ) {
                            other_z_style = " style=\"background-color: #619595;\" "
                            break
                        }
                    }
                }
                

                html += `<td ${other_z_style} class="grid_cell ${this.grid[j][i][z_index]}" id="xyGrid_${j}_${i}">&nbsp;</td>`
            }
            html += `</tr>`
        }
        html += "</table>"
        xyGrid.innerHTML = html
        
        // add on click events
        for( let i=0; i < 20; i++ ) {
            for( let j=0; j < 20; j++ ) {
                /*document.getElementById("xyGrid_"+i+"_"+j).addEventListener("click",
                    () => {
                        this.clickGridCell(i, j, this.get_z_index())
                    }
                );*/
                document.getElementById("xyGrid_"+i+"_"+j).addEventListener("mouseover", () => {
                    if (this.mouseDown) {
                        this.clickGridCell(i, j, this.get_z_index())
                    }
                });
                document.getElementById("xyGrid_"+i+"_"+j).addEventListener("mousedown", () => {
                    this.mouseDown = true;
                    this.clickGridCell(i, j, this.get_z_index())
                });
                document.getElementById("xyGrid_"+i+"_"+j).addEventListener("mouseup", () => {
                    this.mouseDown = false;
                });
            }
        }
    }

    clickGridCell(x,y,z) {
        if ( this.grid[x][y][z] == "grid_cell_unoccupied") {
            this.grid[x][y][z] = "grid_cell_occupied"
            document.getElementById("xyGrid_"+x+"_"+y).classList.remove("grid_cell_unoccupied")
            document.getElementById("xyGrid_"+x+"_"+y).classList.add("grid_cell_occupied")
            document.getElementById("xyGrid_"+x+"_"+y).style.backgroundColor = document.getElementById("color").value
            cubes.add(x, y, z, new Cube(x*20, y*20, z*20, 10, this.get_cube_color()))
        } else {
            this.grid[x][y][z] = "grid_cell_unoccupied"
            document.getElementById("xyGrid_"+x+"_"+y).classList.remove("grid_cell_occupied")
            document.getElementById("xyGrid_"+x+"_"+y).classList.add("grid_cell_unoccupied")
            document.getElementById("xyGrid_"+x+"_"+y).style.backgroundColor = "#2f4f4f"
            cubes.remove(x,y,z)
        }
        
    }
}

const WIDTH      = 400
const HEIGHT     = 400
const DEPTH      = 400 // used for calculating coefficient
let cubes        = new CubeContainer()
let uiParameters = new UIParameters()

/*============= Creating a canvas ======================*/
var canvas = document.getElementById('canvas');
canvas.width = WIDTH
canvas.height = HEIGHT
gl = canvas.getContext('experimental-webgl');

/*==================== MATRIX ====================== */

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
var mo_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
var view_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];

view_matrix[14] = view_matrix[14] + uiParameters.get_zoom();

/*================= Mouse events ======================*/

var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

var mouseDown = function(e) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
};

var mouseUp = function(e){
    drag = false;
};

var mouseMove = function(e) {
    if (!drag) return false;
    dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
    dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
    THETA+= dX;
    PHI+=dY;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
};

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);

/*=========================rotation================*/

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

/*=================== Drawing =================== */

var THETA = 0,
PHI = 0;
var time_old = 0;

var animate = function(time) {
    /*========== Defining and storing the geometry ==========*/
    var indices = []
    var vertices = []
    var colors = []
    view_matrix[14] = uiParameters.get_zoom();

    cubes.forEach( cube => {
        indices = indices.concat(cube.indices(vertices.length/3))
        //console.log(vertices.length/3)
        vertices = vertices.concat(cube.vertices())
        colors = colors.concat(cube.colors())
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

    /*=================== SHADERS =================== */
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

    var shaderprogram = gl.createProgram();
    gl.attachShader(shaderprogram, vertShader);
    gl.attachShader(shaderprogram, fragShader);
    gl.linkProgram(shaderprogram);

    /*======== Associating attributes to vertex shader =====*/
    var _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
    var _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
    var _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var _position = gl.getAttribLocation(shaderprogram, "position");
    gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(_position);

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    var _color = gl.getAttribLocation(shaderprogram, "color");
    gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(_color);
    gl.useProgram(shaderprogram);



    var dt = time-time_old;

    if (!drag) {
        dX *= AMORTIZATION, dY*=AMORTIZATION;
        THETA+=dX, PHI+=dY;
    }

    //set model matrix to I4

    mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
    mo_matrix[3] = 0,

    mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
    mo_matrix[7] = 0,

    mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
    mo_matrix[11] = 0,

    mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
    mo_matrix[15] = 1;

    rotateY(mo_matrix, THETA);
    rotateX(mo_matrix, PHI);

    time_old = time; 
    gl.enable(gl.DEPTH_TEST);

    // gl.depthFunc(gl.LEQUAL);

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clearDepth(1.0);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}
animate(0);