class BackgroundCanvas {
    constructor(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;

        this.background = new Image();
        this.background.src = "./background.png";

        this.midground = new Image();
        this.midground.src = "./midground.png";
            
        this.background_y = 0;
        this.midground_y  = 0;

        window.requestAnimationFrame( () => this.draw() );
    }

    draw()  {
        this.ctx.drawImage(this.background, 0, this.background_y, 600, 600, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.midground, 0, this.midground_y, 600, 600, 0, 0, this.canvas.width, this.canvas.height);

        this.background_y += 1;
        if ( this.background_y >= 600 ) {
            this.background_y = 0;
        }

        this.midground_y += 2;
        if ( this.midground_y >= 600 ) {
            this.midground_y = 0;
        }

        window.requestAnimationFrame( () => this.draw() );
    }
}