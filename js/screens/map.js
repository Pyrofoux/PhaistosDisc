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
            {x:60,y:40,destination:"WORKSHOP",label:"WORKSHOP"},
            {x:40,y:30,destination:"THEATRE",label:"THEATRE"},
        ];

        this.unlocked_doors = [];

        this.doors = new Group();
        this.doors.width = 15;
        this.doors.height = 15;
        this.doors.rotation = 45;
        this.doors.textSize  = 1.6/100*sw;
        this.doors.strokeWeight = sw/250;
        this.doors.color = COLORS.SCREEN_BG;
        this.doors.strokeColor = COLORS.MAP_ICON_STROKE;

        this.doors.textFont = "Humming"; // doesn't work, can be set with textFont()

        this.title = new HTMLSprite("div",50,72);
        this.title.box.addClass("map_title");
        this.title.box.addClass("hidden");
        this.title.box.html(this.default_title);

    }

    async onEnter(sw,sh)
    {
        this.slide_picture = null; // erase previous slide picture
        // display/hide title
        if(current_variables["FADEIN_MAP_TITLE"] != "TRUE")
        {
            //this.title.box.addClass("hidden");
            this.showTitle(false);
            console.log("Hiding title")
        }
        else
        {
            this.showTitle(true);
            console.log("Showing title")
        }

        this.checkUnlockedDoors();
        this.doors_data.forEach(data=> // create doors
            {
                if(this.unlocked_doors.indexOf(data.destination) != -1)
                {
                    this.makeDoor(data.destination, data.x, data.y, data.label, sw, sh);
                }
            });
        await this.slideIn(); // slide in effect

    }

    checkUnlockedDoors() // check from current_variables which doors are unlocked
    {
        var unlocked = new Set();
        unlocked.add("WORKSHOP"); // the WORKSHOP door is always unlocked

        this.doors_data.forEach(door =>{
            // check if variables like UNLOCKED_STAMP_ROSETTE are set to TRUE
            if(current_variables[`UNLOCKED_DOOR_${door.destination.toUpperCase()}`] == "TRUE")
            {
                unlocked.add(door.destination);
            }
        });
        this.unlocked_doors = Array.from(unlocked);
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
                    door.color       = COLORS.MAP_ICON_SELECTED;
                    door.strokeColor = COLORS.MAP_ICON_SELECTED;
                    //this.changeTitle(door.destination);
                }
                else
                {
                    door.color = COLORS.SCREEN_BG;
                    door.strokeColor = COLORS.MAP_ICON_STROKE;
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

    makeDoor(destination, x, y, label, sw, sh)
    {
        var d = new this.doors.Sprite();
        d.x = x/100*sw;
        d.y = y/100*sh;
        d.label = label;
        d.destination = destination;
        d.alpha = 0; // used to change opacity
        if(current_variables[`FADEIN_MAP_${d.destination}`] == "TRUE")d.alpha = 100
        d.fading_in = false;
        var default_draw = d._draw;
        d.draw = ()=>{
            if(d.fading_in) d.alpha += 1;
            if(d.alpha >= 100)
            {
                d.alpha = 100;
                d.fading_in = false;
            }

            drawingContext.globalAlpha = d.alpha/100;
            default_draw(); // draw default shape

            rotate(-d.rotation) // make sure text is aligned horizontally
            textSize(d.textSize)
            fill(d.strokeColor)
            strokeWeight(0.5/100*sw);
            stroke(COLORS.SCREEN_BG)
            text(d.label, 0, d.height+1*sw/100)
        };

    }

    clickedDoor(destination)
    {
        cursor("default")
        switch(destination)
        {
            // todo: logic to check when to send to the tuto scene or not
            case "WORKSHOP":
                playScene("KILN_OPENING");
            break;

            case "THEATRE":
                playScene("THEATRE_OPENING");
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
            //this.title.box.addClass("fade_out");
            
            this.title.box.addClass("hidden");
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

    FADE_IN(name) // fade in effect, controlled from sheet
    {
        if(name == "TITLE") // fade in effect for the map's title
        {
            this.showTitle(true);
            current_variables["FADEIN_MAP_TITLE"] = "TRUE";
        }
        else // fade in effect for the doors on the map
        {
            this.doors.forEach(door=>{
                if(door.destination == name)
                {
                    door.fading_in = true;
                    current_variables[`FADEIN_MAP_${door.destination}`] = "TRUE";
                }
            });
        }
    }
}