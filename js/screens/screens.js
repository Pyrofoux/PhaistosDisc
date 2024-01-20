class Screen
{
    constructor(id)
    {
        this.id = id;

        // sliding effect
        this.slide_speed = 1; // percentage of millis()
        this.sliding_time = null;
        this.sliding_y = null;
        this.slide_promise_resolve;

        // slideshow background picture
        this.slide_picture = null;

        this.init(screen_width, screen_height);
    }

    init(){}

    onEnter(){}

    onLeave(){}

    onClick(){}

    onMouseMove(){}

    slideToPicture(picture, width = 50, height = AUTO, slide_bg = true) // shortcut to slide to a picture
    {

        if(height == AUTO)
        {
            height = picture.height/picture.width*width;
        }

        if(width == AUTO)
        {
            width = picture.width/picture.height*height;
        }

        this.slide_picture = {
            picture: picture,
            width:width,
            height:height,
            slide_bg:slide_bg
        }
        return this.slideIn();
    }

    slideIn() // triggers slideshow transition
    {
        sounds.slide.play();
        return new Promise((resolve)=>{
            this.sliding_time = millis();
        if(!this.slideshow_cvs) // remember previous canvas state
        {
            
            this.slideshow_cvs = createGraphics(main_cvs.elt.clientWidth,main_cvs.elt.clientHeight);
        }
        this.slideshow_cvs.clear();
        this.slideshow_cvs.image(main_cvs, 0, 0);

        this.slide_promise_resolve = resolve;
        });
    }

    copyVariables(next_screen) // for seemingless transitions
    {
        // slideshow variable
        next_screen.sliding_time = this.sliding_time;
        next_screen.sliding_y = this.sliding_y;
        next_screen.slide_promise_resolve= this.slide_promise_resolve;
        next_screen.slide_picture = this.slide_picture; 
    }

    preDraw(sw,sh)
    {
        if(this.sliding_time != null) // translate for slideshow transition 
        {
            var start_y = sh;
            var t = millis()-this.sliding_time;
            this.sliding_y = start_y-t*this.slide_speed
            
            if( this.sliding_y > 0)
            {
                translate(0,  this.sliding_y);
            } else
            {
                this.sliding_time = null;
                this.sliding_y = null;
                translate(0,0);
                this.slide_promise_resolve();
            }
        }
    }

    draw(sw,sh)
    {
        clear();
        background(COLORS.SCREEN_BG);
    }

    postDraw(sw,sh)
    {
        if(this.slide_picture)
        {
            var w = this.slide_picture.width*sw/100, h = this.slide_picture.height*sw/100;
            var y = this.sliding_y || 0;

            // background of the slide
            if(this.slide_picture.slide_bg)
            {
                image(spr.slides.blank,0,0,screen_width, screen_height*0.66);
            }
            
            // picture on the slide
            image(this.slide_picture.picture, (sw-w)*0.5, (sh*0.66-h)*0.5, w, h);
        }

        if(this.sliding_y != null) // translate for slideshow transition 
        {
            // draw previous canvas state
            image(this.slideshow_cvs, 0, -sh);
        }
    }

}



class DemoScreen extends Screen
{
    init()
    {
        this.pawns = new Group();
        this.pawns.radius = 10;
        this.pawns.color = "red";
        this.disc = {
            cx:screen_width*0.5,
            cy:screen_height*0.375,
            w:A_width/disc_scaling,
            h:A_height/disc_scaling,
        };

       this.disc.x = this.disc.cx - this.disc.w/2;
       this.disc.y = this.disc.cy - this.disc.h/2;

    }

    draw()
    {
        background("pink")
        image(disc_cvs, this.disc.x, this.disc.y);
    }

    onClick(mx,my)
    {
        var dx = (mx  - this.disc.x)*disc_scaling;
        var dy = (my  - this.disc.y)*disc_scaling;

        var semantic = coordToSymbols(dx,dy);
        var b = new this.pawns.Sprite();
        b.x = mx;
        b.y = my;
        b.radius = 10;
        b.text = semantic.symbol || "";
        b.speed = 0;
    }

    onMouseMove(mx,my)
    {
        var dx = (mx  - this.disc.x)*disc_scaling;
        var dy = (my  - this.disc.y)*disc_scaling;

        //console.log(_x  - this.disc.x)

        var semantic = coordToSymbols(dx,dy)
  
        disc_cvs.background(255);
        drawDisc("A_disc")
        //drawDisc("A_cells")
        if(semantic.cell > -1)
        {
            
            var c = color("blue")
            c.setAlpha(50);
            colorCell(semantic.cell, c);
            colorSymbol(semantic.cell, semantic.symbol || null, color("red"));

            info.html(`CELL ${semantic.cell}`);
            if(semantic.symbol)
            {
            cursor("pointer");
            info.html("<br/>",true);
            info.html(semantic.symbol,true);
            }
            else
            {
            cursor("default");
            }

        }
    }
}