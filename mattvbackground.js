class MattVBackground {
    constructor(canvas) {
        this.mouseEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
        this.canvas = canvas
        this.window = window	// constructor has the window, otherwise unvailable in 'this'
        this.canvas.width = this.window.innerWidth
        this.canvas.height = this.window.innerHeight
        this.context = this.canvas.getContext("2d")

        this.banner = new Image()
        this.banner.src = 'banner.jpg'

        // lamdas are wrapped so closure has 'this'
        this.canvas.addEventListener("mousemove", (e) => this.storeMouseEvent(e))
        window.requestAnimationFrame( () => this.draw() )
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
        
        /*this.context.fillStyle = "rgb(255,50,0)"
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        */
        try {
            const aspectR = this.canvas.width/this.canvas.height
            this.context.drawImage(this.banner,0,0,aspectR*550,550,0,0,this.canvas.width,this.canvas.height)
        } catch (e) {
            console.log('banner wasnt loaded')
        }

        /*this.context.fillStyle = "rgb(255,255,255)"
        this.context.arc(pos.x, pos.y, this.canvas.width/2, 0, 2 * Math.PI)
        this.context.fill()
        */
        
        
        this.context.lineWidth = this.canvas.width/50 + 1
        for( var i=1; i < 50; i++ ) {
            const r = 3*this.canvas.width/2 - (i*this.canvas.width/50)
            this.context.beginPath()
            this.context.strokeStyle = "rgb(255,"+(4*i+50)+", 0)"
            this.context.arc(pos.x, pos.y, r, 0, 2 * Math.PI)
            this.context.stroke()
        }

        // must wrap lambda so 'this' is in closure
        this.window.requestAnimationFrame( () => this.draw() )
    }
}