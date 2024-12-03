class BackgroundCanvas {
    constructor(canvas) {
        this.rick = new Sprite('./rick.jpg')
        this.animation_name = document.getElementById("animation_name").value

        this.x1 = 0; this.x2 = 0; this.y1 =0; this.y2 = 0

        this.mouseEvent = { clientX: window.innerWidth/2, clientY: window.innerHeight/2 }
        this.mouseDown = false

        this.canvas = canvas
        this.window = window	// constructor has the window, otherwise unvailable in 'this'
        this.canvas.width = this.window.innerWidth
        this.canvas.height = this.window.innerHeight / 2
        this.context = this.canvas.getContext("2d")

        // lamdas are wrapped so closure has 'this'
        this.canvas.addEventListener("mousemove", (e) => this.storeMouseEvent(e))
        this.canvas.addEventListener("mousedown", (e) => this.markMouseDown(e))
        this.canvas.addEventListener("mouseup", (e) => this.markMouseUp(e))
        document.getElementById("add_frame").addEventListener("click", () => this.newFrame())
        window.requestAnimationFrame( () => this.draw() )
    }
    
    markMouseDown(event) {
        this.mousedown = true
        const pos = this.getMousePos()
        this.x1 = pos.x
        this.y1 = pos.y
    }

    markMouseUp(event) {
        this.mousedown = false
    }

    storeMouseEvent(event) {
        this.mouseEvent = event
        if ( this.mousedown ) {
            const pos = this.getMousePos()
            this.x2 = pos.x
            this.y2 = pos.y
        }
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

    newFrame() {
        const frame = new Frame(Math.min(this.x1,this.x2), Math.min(this.y1,this.y2), 
            Math.max(this.x1,this.x2), Math.max(this.y1,this.y2))

        this.rick.addFrame(this.animation_name, frame)
    }

    draw() {
        const pos = this.getMousePos()
        const rect = this.canvas.getBoundingClientRect()

        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)

        if ( this.rick.ready ) {
            this.context.drawImage(this.rick.img, 0, 0, this.rick.img.width, this.rick.img.height)
            if ( this.animation_name in this.rick.animations ) {
                let frame = this.rick.animations[this.animation_name].animate()
                this.context.drawImage(this.rick.img, frame.x1, frame.y1, frame.width, frame.height,0,0,frame.width,frame.height)
            }
        }

        this.context.lineWidth = 2
        this.context.strokeStyle = "rgba(255,0,0,0.8)"
        this.context.strokeRect(this.x1, this.y1, this.x2-this.x1, this.y2-this.y1)

        this.window.requestAnimationFrame( () => this.draw() )
    }
}