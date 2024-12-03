
const MAX = 9 // it's the speed of light... 9px a frame

class Charge {
    constructor(x,y,c) {
        // position, they MUST be integers (map to pixel values)
        // also, if they're floats, they'll break the accellerate method
        this.x = x
        this.y = y
        // velocity, they SHOULD be floats
        this.dx = 0
        this.dy = 0
        // this circle's charge... 
        // ...can be negative or positive and defines the radius (charge density/area = 1)
        this.c = c
    }
    
    move( canvas, mouseInfo ) {
        // if we're hovering over this charge (circle) ...
        const R = 15 * Math.sqrt(Math.abs(1.0*this.c/Math.PI))
        if ( Math.abs(mouseInfo.x - this.x) < R && Math.abs(mouseInfo.y - this.y) < R ) {
            // if we're pressing the mouse (mousedown, not yet mouseup) then drag
            if ( mouseInfo.down == true ) {
                this.x = mouseInfo.x 
                this.y = mouseInfo.y
            }
        } else { // if we're not hovering over this charge, just use the regular logic
            // velocity upper boundary
            if ( Math.abs(this.dx) > MAX ) {
                this.dx = this.dx > 0 ? MAX : -MAX
            }

            if ( Math.abs(this.dy) > MAX ) {
                this.dy = this.dy > 0 ? MAX : -MAX
            }

            // x and y must remain integer values
            this.x += Math.round(this.dx)
            this.y += Math.round(this.dy)

            // bounce off the sides
            if ( (this.x < 0 && this.dx < 0) || (this.x > canvas.width && this.dx > 0) ) {
                this.dx = -this.dx
            }
            if ( (this.y < 0 && this.dy < 0) || (this.y > canvas.width && this.dy > 0) ) {
                this.dy = -this.dy
            }
        }
    }
}

class Charges {
    constructor() {
        this.charges = []
    }

    move( canvas, mouseInfo ) {
        this.charges.forEach(charge => {
            charge.move( canvas, mouseInfo )
        })
    }
    
    // n^2 accellerate function
    accellerateQuadratic() {
        for( let i=0; i < this.charges.length; ++i ) {
            for ( let j=i+1; j < this.charges.length; ++j ) {
                const K = 0.01 // columbs law -- stand in constant

                const rx = (this.charges[j].x - this.charges[i].x) / 5
                const ry = (this.charges[j].y - this.charges[i].y) / 5
                
                const signOf = (v) => { return v < 0 ? -1 : 1 }

                let ddx = (rx == 0 || Math.abs(rx) > 500) ? 0 : K * -(1.0 * this.charges[j].c * this.charges[i].c) / (signOf(rx)*rx*rx)
                let ddy = (ry == 0 || Math.abs(ry) > 500) ? 0 : K * -(1.0 * this.charges[j].c * this.charges[i].c) / (signOf(ry)*ry*ry)
                
                // do not permit above the maximum
                if ( Math.abs(ddx) > MAX ) {
                    ddx = signOf(ddx)*MAX
                    console.log( "speed of light X")
                    console.log( ddx," = ddx = " , K, " * (",this.charges[j].c,"*",this.charges[i].c,") / ", rx,"^2" )    
                }

                if ( Math.abs(ddy) > MAX ) {
                    ddy = signOf(ddy)*MAX
                    console.log( "speed of light Y")
                    console.log( K, " * (",this.charges[j].c,"*",this.charges[i].c,") / ", ry,"^2" )
                }

                // dampen the accelleration
                ddx *= (1.0 - (MAX*ddx)/(MAX*MAX))
                ddy *= (1.0 - (MAX*ddy)/(MAX*MAX))
                
                this.charges[i].dx += ddx
                this.charges[i].dy += ddy
                this.charges[j].dx -= ddx
                this.charges[j].dy -= ddy
            }
        }        
    }

    addCharge(charge) {
        this.charges.push(charge)
    }
}

class BackgroundCanvas {
    constructor(canvas) {
        this.mouseEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
        this.mouseDown = false

        this.canvas = canvas
        this.window = window	// constructor has the window, otherwise unvailable in 'this'
        this.canvas.width = this.window.innerWidth
        this.canvas.height = this.window.innerHeight
        this.context = this.canvas.getContext("2d")

        this.charges = new Charges();
        for( let i = 2; i < 20; i++ ) {
            let dx = this.canvas.width / 20
            let dy = this.canvas.height / 20

            let charge1 = new Charge(i*dx, dy, (1.0 + i%3) );
            let charge2 = new Charge(dx, i*dy, (-1.0 - i%3) );
            let charge3 = new Charge(i*dx, i*dy, (1.0 + i%3) );
            let charge4 = new Charge(i*dx, (21-i)*dy, (-1.0 - i%3) );
            let charge5 = new Charge(20*dx, i*dy, (1.0 + i%3) );
            let charge6 = new Charge(i*dx, 20*dy, (-1.0 - i%3) );

            this.charges.addCharge(charge1)
            this.charges.addCharge(charge2)
            this.charges.addCharge(charge3)
            this.charges.addCharge(charge4)
            this.charges.addCharge(charge5)
            this.charges.addCharge(charge6)
        }

        // lamdas are wrapped so closure has 'this'
        document.addEventListener("mousemove", (e) => this.storeMouseEvent(e))
        document.addEventListener("mousedown", (e) => this.markMouseDown(e))
        document.addEventListener("mouseup", (e) => this.markMouseUp(e))
        window.requestAnimationFrame( () => this.draw() )
    }
    
    markMouseDown(event) {
        this.mouseDown = true
    }

    markMouseUp(event) {
        this.mouseDown = false
    }

    storeMouseEvent(event) {
        this.mouseEvent = event
    }

    getMousePos() {
        const rect = this.canvas.getBoundingClientRect(), // abs. size of element
            scaleX = this.canvas.width / rect.width,    // relationship bitmap vs. element for x
            scaleY = this.canvas.height / rect.height;  // relationship bitmap vs. element for y

        return {
            x: (this.mouseEvent.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
            y: (this.mouseEvent.clientY - rect.top) * scaleY     // been adjusted to be relative to element
        }
    }

    draw() {
        const pos = this.getMousePos()
        const rect = this.canvas.getBoundingClientRect()

        this.context.fillStyle = "rgb(0,0,0)"
        this.context.fillRect(0, 0, rect.width, rect.height)

        this.context.lineWidth = 2
        this.charges.charges.forEach(charge =>{
            this.context.beginPath()
            if ( charge.c < 0 )
                this.context.strokeStyle = "rgba(10,50,205,0.9)"
            else
                this.context.strokeStyle = "rgba(205,50,10,0.9)"
            this.context.fillStyle = "rgba(30,250,170,0.3)"
            this.context.arc(charge.x, charge.y, 15 * Math.sqrt(Math.abs(charge.c/Math.PI)), 0, 2 * Math.PI)
            this.context.stroke()
            this.context.fill()
        })

        this.context.beginPath()
        this.context.strokeStyle = "rgb(0,150,30)"
        this.context.arc(pos.x, pos.y, 3, 0, 2 * Math.PI)
        this.context.stroke()

        this.charges.accellerateQuadratic()
        this.charges.move(this.canvas, {x: pos.x, y: pos.y, down: this.mouseDown })

        this.window.requestAnimationFrame( () => this.draw() )
    }
}