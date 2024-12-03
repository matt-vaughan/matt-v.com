class Frame { 
    constructor(x1,y1,x2,y2) {
        if ( x1 >= x2 || y1 >= y2 ) {
            throw new Error("bad arguments to new Frame()");
        }
        this.x1 = x1
        this.x2 = x2
        this.y1 = y1
        this.y2 = y2
        this.height = y2 - y1
        this.width = x2 - x1
    }
}

class Animation {
    constructor(frame) {
        this.frames = [frame]
        this.currentFrame = 0
    }
    
    addFrame( frame ) {
        this.frames.push(frame)
    }

    animate() {
        if ( this.currentFrame >= this.frames.length ) {
            this.currentFrame = 0
        }
        return this.frames[this.currentFrame++]
    }
}

class Sprite {
    constructor(filename) {
        // load the image
        this.ready = false
        this.img = new Image()
        this.img.src = filename
        this.img.onload = () => { this.ready = true };
        
        // declare & define empty object for animation objects
        // to be stores as { name_of_animation: new Animation(), ... } 
        this.animations = {}
    }

    addFrame(name, frame) {
        if ( name in this.animations ) {
            this.animations[name].addFrame(frame)
        } else {
            this.animations[name] = new Animation(frame)
        }
    }
}