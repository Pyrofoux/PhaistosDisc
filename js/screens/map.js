class MapScreen extends Screen
{

    init(sw,sh)
    {
        this.map = {
            cx:sw*0.5,
            cy:sh*0.375,
            ratio:spr.palace_map.width/spr.palace_map.height
        };

       this.map.h = sh*0.7;
       this.map.w = this.map.h*this.map.ratio;
       this.map.x = this.map.cx - this.map.w/2;
       this.map.y = this.map.cy - this.map.h/2;

       this.default_title = "MINOAN MIND PALACE";
        this.doors_data = [
            {x:60,y:40,destination:"WORKSHOP",char:"WORKSHOP"}
        ];

        this.doors = new Group();
        this.doors.width = 15;
        this.doors.height = 15;
        this.doors.rotation = 45;
        this.doors.strokeColor = "gold";
        this.doors.textColor   = "gold";
        this.doors.textStrokeWeight  = 0;
        this.doors.textSize  = 1.5/100*sw;
        this.doors.strokeWeight = sw/250;
        this.doors.color = COLORS.SCREEN_BG;
        //this.doors.text = "!";
        this.doors.textFont = "Humming"; // doesn't work, can be set with textFont()

        this.title = new HTMLSprite("div",50,72);
        this.title.box.addClass("map_title");
        this.title.box.addClass("hidden");
        this.title.box.html(this.default_title);
    }

    async onEnter(sw,sh)
    {
        this.slide_picture = null; // erase previous slide picture
        await this.slideIn(); // slide in effect

        this.doors_data.forEach(data=>this.makeDoor(data.destination, data.x, data.y, data.char, sw, sh));
    }

    draw()
    {
        background(COLORS.SCREEN_BG);
        image(spr.palace_map, this.map.x, this.map.y, this.map.w, this.map.h);

        if(this.doors)
        {
            var pointing = false;
            this.doors.forEach((door,index)=>{

                if(door.mouse.hovering())
                {
                    if(!pointing)
                    {
                        pointing = true;
                        cursor("pointer");
                    };
                    door.color = "orange";
                    this.changeTitle(door.destination);
                }
                else
                {
                    door.color = COLORS.SCREEN_BG;
                }

                if(door.mouse.presses())
                {
                    this.clickedDoor(door.destination);
                }

            });

            if(!pointing)
            {
                cursor("default");
                this.changeTitle(this.default_title);
            }
        }
        

    }

    makeDoor(destination, x, y, char, sw, sh)
    {
        var d = new this.doors.Sprite();
        d.x = x/100*sw;
        d.y = y/100*sh;
        d.label = char;
        d.destination = destination;

        var default_draw = d._draw;
        d.draw = ()=>{
            default_draw(); // draw default shape
            noStroke();
            rotate(-d.rotation) // make sure text is aligned horizontally
            textSize(d.textSize)
            fill(this.doors.textColor)
            text(d.label, 0, d.height+1*sw/100)
        };

    }

    clickedDoor(destination)
    {
        cursor("default")
        switch(destination)
        {
            case "WORKSHOP":
                playScene("KILN_OPENING");
            break;
        }
    }

    showTitle(display)
    {
        if(display)
        {
            this.title.box.removeClass("hidden");
            this.title.box.removeClass("fade_out");
            this.title.box.addClass("fade_in");
        }
        else
        {
            this.title.box.removeClass("fade_in");
            this.title.box.addClass("fade_out");
        }
    }

    changeTitle(name)
    {
        this.title.box.html(name.toUpperCase());
    }

    onLeave()
    {
        this.showTitle(false);
        this.doors.removeAll();
    }

    MAKE_TITLE_APPEAR() // controlled from sheet
    {
        this.showTitle(true);
    }
}