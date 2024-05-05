
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

            highlighted_cell:-1,
            highlighted_symbol:-1,
        };

       this.disc.x = this.disc.cx - this.disc.w/2;
       this.disc.y = this.disc.cy - this.disc.h/2;


       this.redrawDiscImage(true);

    }

    draw()
    {
        background("pink")
        image(disc_cvs, this.disc.x, this.disc.y);
    }

    // Check if the visual info have actually changed
    // to avoid recalculating pixels at each frame
    updateDiscImage(highlighted_cell, highlighted_symbol)
    {
        var pixels_changed = false;
        if(this.disc.highlighted_cell != highlighted_cell)
        {
            this.disc.highlighted_cell = highlighted_cell;
            pixels_changed = true;
        }
        
        if(this.disc.highlighted_symbol != highlighted_symbol)
        {
            this.disc.highlighted_symbol = highlighted_symbol;
            pixels_changed = true;
        }

        if(pixels_changed)
        {
            this.redrawDiscImage();
        }
    }

    // Change pixels on the disc canvas
    // Call only when the pixels actually need to change
    redrawDiscImage(init)
    {

        let cell = this.disc.highlighted_cell;
        let symbol = this.disc.highlighted_symbol;

        disc_cvs.background(255);

        drawDisc("A_disc");
        if(this.disc.highlighted_cell > -1)
        {
            
            var c = color("blue")
            c.setAlpha(50);
            colorCell(cell, c);
            colorSymbol(cell, symbol || null, color("red"));

            info.html(`CELL ${cell}`);
            if(symbol)
            {
            cursor("pointer");
            info.html("<br/>",true);
            info.html(symbol,true);
            }
            else
            {
            cursor("default");
            }
        }
        else
        {

        }
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
        this.updateDiscImage(semantic.cell, semantic.symbol)
    }
}