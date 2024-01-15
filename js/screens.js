class Screen
{
    constructor(id)
    {
        this.id = id;
        this.init();
    }

    init()
    {

    }

    draw()
    {

    }

    onEnter()
    {

    }

    onLeave()
    {

    }

    onClick()
    {

    }

    onMouseMove()
    {
        
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

        console.log(screen_width, screen_height)

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


class ConvoScreen extends Screen
{

    init()
    {
        this.heads = {};
        this.heads.plumed = new HTMLSpriteImg("img/PLUMED_HEAD.svg", 3, 58, 15, AUTO, 24 ,30);
        let plumed = this.heads.plumed;
        plumed.box.class("archeo_portrait");

        this.heads.tattoo = new HTMLSpriteImg("img/TATTOOED_HEAD.svg", 83, 60, 12, AUTO, 23 ,32);
        let tattoo = this.heads.tattoo;
        tattoo.box.class("designer_portrait");
    }

    draw()
    {
        background("#212121");
    }
}