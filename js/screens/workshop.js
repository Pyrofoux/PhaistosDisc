class WorkshopScreen extends Screen
{

    init(sw,sh)
    {
        // turn black svgs into white, so easier to project color
        img_symbols.forEach( name =>spr.symbols[name].filter(INVERT));
        
        this.square_in_circle = sqrt(2)/2;
        this.disc_size = 35/100*sw;

        this.button_text = "▼ INSERT DISC ▼";
        this.stamps_data = [
            {"symbol":"PEDESTRIAN"},
            {"symbol":"DELETE"},
            {"symbol":"BEE"},
            {"symbol":"SHIP"},
            {"symbol":"ARROW"},
            {"symbol":"SHIELD"},
            {"symbol":"ROSETTE"},
            {"symbol":"BEE"},
        ];

        this.unlocked_stamps = [];
        this.stamped_symbols = [];

        this.stamps = new Group();
        this.stamps.collider = "kinematic";
        this.stamps.diameter = 9/100*sw;

        this.empty_slots = new Group();
        this.empty_slots.collider = "static";
        this.empty_slots.diameter = 9/100*sw;

        // graphic buffer to print stamps on, and circle clip
        this.stamp_buffer = createGraphics(this.disc_size, this.disc_size);
        this.disc_mask = createGraphics(this.disc_size, this.disc_size);
        this.disc_mask.fill("red");
        this.disc_mask.circle(this.disc_size/2,this.disc_size/2,this.disc_size-2);
        this.disc_mask = this.disc_mask.get(); // convert to img
        
    }

    async onEnter(sw,sh)
    {

        this.slide_picture = null; // erase previous slide picture
        this.checkUnlockedStamps();
        this.createSprites(sw,sh);
        await this.slideIn(); // slide in effect

    }

    checkUnlockedStamps() // check from current_variables which stamps are unlocked
    {
        var unlocked = new Set();
        unlocked.add("PEDESTRIAN"); // the PEDESTRIAN stamp and DELETE are always unlocked
        unlocked.add("DELETE");

        this.stamps_data.forEach(stamp =>{
            // check if variables like UNLOCKED_STAMP_ROSETTE are set to TRUE
            if(true || current_variables[`UNLOCKED_STAMP_${stamp.symbol.toUpperCase()}`] == "TRUE")
            {
                unlocked.add(stamp.symbol);
            }
        });
        this.unlocked_stamps = Array.from(unlocked);
    }

    drawStamp(stamp, sw, sy)
    {
        push();
        stroke(COLORS.STAMP_CONTOUR);
        noStroke();

        if(stamp.symbol != "DELETE") // bottom of the stamps
        {
            fill(COLORS.STAMP_FOOT);
            circle(0, sw*0.8/100*stamp.scale, stamp.diameter);
        }
        circle(0,0,stamp.diameter);
        

        drawingContext.save();
        let gradient;
        if(stamp.symbol == "DELETE")
        {
            gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, stamp.radius);
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.5, 'darkgrey');
            gradient.addColorStop(0.85, COLORS.COLOR_CLAY);
            //gradient.addColorStop(0.9, '#FA6E2F');
        }
        else
        {
            gradient = drawingContext.createLinearGradient(-stamp.diameter, -stamp.diameter, stamp.diameter, stamp.diameter);
            gradient.addColorStop(0, '#FA6E2F');
            gradient.addColorStop(0.5, 'gold');
            gradient.addColorStop(0.9, '#FA6E2F');
        }
        
        drawingContext.fillStyle = gradient;
        drawingContext.fill();
        drawingContext.restore();

        tint(COLORS.STAMP_SYMBOL);
        if(stamp.symbol != "DELETE")
        {
            this.drawSymbol(stamp.symbol, 0, 0, stamp.diameter*this.square_in_circle);
        }
        
        pop();
    }

    async draw(sw,sh)
    {
        background(COLORS.SCREEN_BG);
        
        var grabbed = false;
        var pointed = false;
        this.stamps.forEach(async (stamp,index)=>{
            if(stamp.mouse.hovering())
            {
                if(stamp.symbol != "DELETE")grabbed = true;
                else pointed = true;
            }

            
            if(stamp.mouse.released())
            {
               if(stamp.symbol == "DELETE") // click on DELETE: refresh all sprites
               {
                sounds.clear.play();
                this.deleteSprites();
                this.createSprites(sw,sh);
               } else if(this.areColliding(stamp, this.disc))
               {
                 sounds.stamp.play();
                 this.stampTrace(stamp);
               }
            }

            // move with the mouse
            if (stamp.mouse.dragging() && stamp.symbol != "DELETE") {
                stamp.moveTowards(mouse.x,mouse.y,1) // full tracking
            }
            else{ // don't keep speed
                // uncessary with animation now
                stamp.moveTo(stamp.initial_x, stamp.initial_y, 15)
            }
            // prevent getting out of bounds
            stamp.x = constrain(stamp.x, 0 + stamp.diameter/2, sw - stamp.diameter/2);
            stamp.y = constrain(stamp.y, 0 + stamp.diameter/2, sh*0.8 - stamp.diameter/2);
        });

        if(!grabbed && !pointed)
        {
            cursor("default");
        }

        if(pointed)
        {
            cursor("pointer");
        }

        if(grabbed)
        {
            cursor("grab");
        }

        // keyboard shortcut for manual debugging
        /* if (kb.released(' ')){ 
            //await this.playDiscAnimation(sw,sh, "burnt");
            await this.playDiscAnimation(sw,sh, "fired");
        } */
    }

    drawSymbol(symbol, x, y, fit, cvs)
    {
        var img = spr.symbols[symbol];
        var w = fit, h = fit;
        if(img.width > img.height) // fit image into a square
        {
            h = w*img.height/img.width
        }
        else
        {
            w = h*img.width/img.height;
        }
        if(!cvs) image(img,x,y,w,h);
        else cvs.image(img,x-w/2,y-h/2,w,h) // tried to fix a weird shift, good enough for now
    }

    async stampTrace(stamp)
    {
        // draw stamp on disc
        //stamp.x = this.disc.x - this.disc.radius + dx + stamp.radius
        var dx =  -this.disc.x + this.disc.radius + stamp.x;
        var dy =  -this.disc.y + this.disc.radius + stamp.y;
        dy += 0.8/100*screen_width; // vertical offset to account for stamp height
        var symbol = stamp.symbol, diameter = stamp.diameter;
        this.stamped_symbols.push({symbol,dx,dy,diameter});
        this.drawDiscSymbols();
        stamp.moveTo(stamp.initial_x, stamp.initial_y, 15);

        this.onStamp();
    }

    drawDiscSymbols() // draw symbols on the stamp buffer
    {
        this.stamp_buffer.clear();
        
        this.stamp_buffer.stroke("white"); // to be teinted after
        this.stamp_buffer.strokeWeight(2);

        // draw center rosette
        this.drawSymbol("ROSETTE", this.disc_size/2, this.disc_size/2, this.stamps.diameter*0.8, this.stamp_buffer);
        this.stamp_buffer.noFill();
        this.stamp_buffer.circle(this.disc_size/2, this.disc_size/2, this.stamps.diameter);
        
        // draw separation lines
        this.stamp_buffer.line(this.disc.radius,-this.disc.diameter,this.disc.radius,this.disc.radius-this.stamps.diameter/2);
        this.stamp_buffer.line(this.disc.radius,this.disc.diameter,this.disc.radius,this.disc.radius+this.stamps.diameter/2);
        this.stamp_buffer.line(-this.disc.diameter,this.disc.radius,this.disc.radius-this.stamps.diameter/2,this.disc.radius);
        this.stamp_buffer.line(this.disc.diameter,this.disc.radius,this.disc.radius+this.stamps.diameter/2,this.disc.radius);
        //this.stamp_buffer.line(-this.disc.diameter,this.disc.radius,this.disc.diameter,this.disc.radius);
       
        //this.stamp_buffer.drawingContext.setLineDash([5]);
    

        // draw symbols
        this.stamped_symbols.forEach((stamped)=>{
        this.drawSymbol(stamped.symbol, stamped.dx, stamped.dy, stamped.diameter*this.square_in_circle, this.stamp_buffer)
        });

        

        this.stamp_buffer.tint(COLORS.STAMP_ON_DISC)

        // circular mask -- have to do it only once cause we lose pixel quality each time with this method
        // has to do with pixel density info being lost between Graphcis and its copy
        // tried to fix, but doesn't work if iterated, so we clear and redo it each time
        var density = this.stamp_buffer.pixelDensity(), width = this.stamp_buffer.width, height = this.stamp_buffer.height;
        let buffer_clone = createImage(Math.round(width * density), Math.round(height * density));
        buffer_clone.copy(this.stamp_buffer, 0, 0, width, height, 0, 0, width * density, height * density);
        buffer_clone.mask( this.disc_mask );
        this.stamp_buffer.clear();
        this.stamp_buffer.image(buffer_clone, 0,  0, width, height);
    }

    addDiscCracks()
    {
        this.stamp_buffer.stroke(COLORS.STAMP_ON_DISC);
        this.stamp_buffer.strokeWeight(2);

        // generate points of the cracks
        var marks = [], n_marks = 10, c_r = this.stamps.diameter, c_a = 45;
        for(var i = 0; i < n_marks; i++)
        {
            c_r = i*(100/n_marks);
            c_a += (2*(i%2) -1)*random(0,15);
            marks.push([c_r, c_a]);
        }

        // draw the marks
        for(var i = 1; i< marks.length; i++)
        {
            var a1 = marks[i-1][1], r1 = marks[i-1][0]*(this.disc_size-this.stamps.diameter)/200+this.stamps.diameter/2;
            var a2 = marks[i][1], r2 = marks[i][0]*(this.disc_size-this.stamps.diameter)/200+this.stamps.diameter/2;
            for(var j = 0; j <= 3; j++) // H+V symetry
            {
                var d_a = j*90;
                this.stamp_buffer.line(
                    this.disc_size/2+cos(a1+d_a)*r1, this.disc_size/2+sin(a1+d_a)*r1,
                    this.disc_size/2+cos(a2+d_a)*r2, this.disc_size/2+sin(a2+d_a)*r2)
            }
            
        }
    }

    clearDisc() // clear disc and draw separation
    {
        this.stamped_symbols = [];
        this.drawDiscSymbols();
    }

    createSprites(sw,sh)
    {

        // create "insert disc" button
        this.button = new HTMLSprite("div",50,72);
        this.button.box.addClass("workshop_button");
        this.button.box.addClass("hidden");
        this.button.box.html(this.button_text);
        this.button.event("click", () => this.onClickInsertDisc(sw,sh))

        // create stamps
        var start_x = 20;
        var start_y = 30;
        var num = this.stamps_data.length;

        this.stamps_data.forEach((data,index)=>{

            // coordinates of the stamps
            var ox, oy;
            oy = start_y + (-num/2+1/2+ index-index%2)*6;
            ox = start_x + (index%2)*60;
            ox *= sw/100; 
            oy *= sw/100;

            // create empty stamps slots
            if(data.symbol != "DELETE" || this.unlocked_stamps.indexOf("DELETE") == -1) 
            { // do not do empty slot for an unlocked "DELETE" symbol
                var empty_slot = new this.empty_slots.Sprite();
                empty_slot.x = ox;
                empty_slot.y = oy + sw*0.8/100; // vertical shift to map to bottom of stamp
                empty_slot.color = COLORS.EMPTY_SLOT_FILL;
                empty_slot.strokeWeight = 0;
                empty_slot.layer = 1;
            }
            

            // only display unlocked stamps
            if(this.unlocked_stamps.indexOf(data.symbol) == -1)
            {
                return false;
            }

            var stamp = new this.stamps.Sprite();
            stamp.symbol = data.symbol;

            stamp.x = ox; 
            stamp.y = oy;

            stamp.initial_x = stamp.x;
            stamp.initial_y = stamp.y;

            stamp.layer = 2;
            
            stamp.draw = () => this.drawStamp(stamp, sw, sh);
        });

        // create clay disc
        this.disc = new Sprite();
        this.disc.diameter = this.disc_size;
        this.disc.x = sw*50/100;
        //this.disc.y = sh*50/100;
        this.disc.y = sh*30/100;
        this.disc.color = COLORS.COLOR_CLAY;
        this.disc.collider = "kinematic";
        this.disc.strokeWeight = 3;
        this.disc.layer = 0;
        this.disc.tint = 0;
        this.disc.draw = () => this.drawDisc();

        // create reader, looking like a kiln
        this.reader = new Sprite();
        this.reader.width = this.disc_size + 2/100*sw;
        this.reader.height = this.disc_size + 2/100*sw;
        this.reader.x = 50/100*sw;
        this.reader.y = 105/100*sh;
        this.reader.collider = "kinematic";
        this.reader.draw = () => this.drawReader(sw,sh);
        this.reader.layer = -1;
        this.reader.sw = sw;
        this.reader.sh = sh;
        this.clearDisc();
    }

    drawDisc()
    {
        //return false; // debug
        fill(COLORS.COLOR_CLAY); // draw clay disk
        
            noStroke();
            circle(0,0, this.disc.diameter);

            drawingContext.save();
            let gradient;
            gradient = drawingContext.createRadialGradient(0, 0, 0, 0, 0, this.disc.radius);
            gradient.addColorStop(0, '#996854');
            gradient.addColorStop(0.85, COLORS.COLOR_CLAY);
            gradient.addColorStop(0.90, '#996854');
            
            drawingContext.fillStyle = gradient;
            drawingContext.fill();
            drawingContext.restore();

            // cooking color change
            var cooking_color = color("#A12215")
            
            color(250,50,50);
            var t = this.disc.rotationSpeed/20; // from 0 to 1
            cooking_color.setAlpha(t*120)
            fill(cooking_color);
            circle(0,0,this.disc.diameter);

            if(this.disc.cooking == "burnt" || this.disc.cooking == "fired")
            {
                this.disc.burnt_t = this.disc.burnt_t ?? 0;
                if(!this.disc.lock_color_change) this.disc.burnt_t = 1-this.disc.rotationSpeed/20
                var t = this.disc.burnt_t; // from 0 to 1, will not increase when disc rotates again
                var burnt_color;
                if(this.disc.cooking == "burnt")
                {
                    burnt_color = color("#4e4e4c");
                    burnt_color.setAlpha(t*200)
                }
                else
                {
                    burnt_color = color("#FFD37C");
                    burnt_color.setAlpha(t*110)
                }
                fill(burnt_color);
                circle(0,0,this.disc.diameter);
            }

            // draw stamped symbols
            rotate_and_draw_image(this.stamp_buffer, -this.disc_size/2, -this.disc_size/2, this.disc_size, this.disc_size /*, this.disc.rotation */)
            // draw a hole
            /* fill(COLORS.SCREEN_BG);
            circle(0,0,sw*4/100); */

            
            

            
    }

    drawReader(sw,sh)
    {
        strokeWeight(2)
        fill(COLORS.KILN_READER_BG)
        rect(0,0,this.disc.width+sw*2/100,this.disc.height+sw*2/100);

        fill(COLORS.COLOR_CLAY)
        stroke(COLORS.STAMP_ON_DISC);
        strokeWeight(3)
        circle(0,0,this.disc_size);

        fill(COLORS.STAMP_ON_DISC);
        strokeWeight(3)
        // [ distance from center, angular distance, radius]
        var spots = [
            [20,0,2.5],
            [50,25,2.5],
            [50,-25,2.5],
            [80,0,2.5],
            [80,-25,2.5],
            [80, 25,2.5],
            [35,0,1.5],
            [65,15,1.5],
            [65,-15,1.5],
        ]
        for(var angle = 0; angle < 360; angle += 60)
        {
            noStroke();
            spots.forEach(coord=>{
                var ang = angle+coord[1]*60/100;
                var x = cos(ang);
                var y = sin(ang);
                circle(x*coord[0]*this.disc_size/200,y*coord[0]*this.disc_size/200,coord[2]*sw/100)
            });

            stroke(COLORS.STAMP_ON_DISC);
            line(0,0, this.disc_size*cos(angle+30)/2, this.disc_size*sin(angle+30)/2)
        }
    }

    deleteSprites()
    {
        this.stamps.removeAll();
        this.empty_slots.removeAll();
        this.disc.remove();
        this.reader.remove();
        this.button.remove();

    }

    playDiscAnimation(result = "burnt")
    {
       // get screen width/height
       var sw = this.reader.sw, sh = this.reader.sh;

       // define disc rotation animation
       var rotationAnimation = () => new Promise(async (resolve) =>{
            var acceleration = 0.05, max_speed = 20, slow_down_speed = 5;
            var duration_peak_speed = 175; // in frames
            var decreasing = false, done = false;
            this.disc.lock_color_change = false;
            this.disc.cooking = "raw";
            while (!done) // rotation loop
            {
                // wait for next animation frame
                //await new Promise(resolve => {requestAnimationFrame(resolve);});
                await waitFrames(1);
                
                var speed = this.disc.rotationSpeed;
                speed = constrain(speed+acceleration, 0, max_speed) // accelerating
                if(speed == max_speed) // attained peak speed
                {
                    decreasing = true;
                    if(this.disc.cooking == "raw" && result == "burnt")this.addDiscCracks();
                    this.disc.cooking = result; // "burnt" or "fired"
                }
                if(decreasing) // peak speed => decrease
                {
                    duration_peak_speed -= 1;
                }

                if(duration_peak_speed < 0) // decelration
                {
                    acceleration = -1*Math.abs(acceleration);
                }

                this.disc.rotationSpeed = speed;
                if(acceleration <= 0 && (speed <= 3 && this.disc.rotation % 360 <= 1) || speed == 0) // done rotating
                {
                    done = true;    
                }
            }
            this.disc.rotation = 0
            this.disc.rotationSpeed = 0;
            //this.disc.rotation = this.disc.rotation %360; // otherwise takes a long time to undo each turn
            this.disc.lock_color_change = true;
            await this.disc.rotateTo(0,slow_down_speed);
            resolve();
        });
        

        return new Promise(async (resolve)=>{

            sounds.disc_open.play();
            await this.reader.moveTo({x:this.reader.x,y:sh*0.8-this.reader.h/2}, 4)
            await waitFrames(100);
            sounds.disc_mount.play();
            await this.disc.moveTo(this.reader,6);
            await waitFrames(100);
            sounds.disc_read.play();
            await rotationAnimation();
            resolve();
        });
    }

    onStamp()
    {
        // each symbol is present once in `stamped`
        var stamped = new Set();
        this.stamped_symbols.forEach(trace => stamped.add(trace.symbol));
        stamped = Array.from(stamped);

        if(stamped.length >= 1) // allow to insert disc if more than one symbol
        {
            this.showButton(true);
        }

    }

    onClickInsertDisc(sw,sh)
    {
        this.showButton(false);
        
        // each symbol is present once in `stamped`
        var stamped = new Set();
        this.stamped_symbols.forEach(trace => stamped.add(trace.symbol));
        stamped = Array.from(stamped).sort();

        var stamped_string = stamped.join("-");
        var number_different_stamps = stamped.length;

        current_variables["STAMPED_SYMBOLS"] = stamped_string;
        current_variables["NUMBER_STAMPS"]   = number_different_stamps;
        playScene("WORKSHOP_DECISION_TREE");
        // todo: logic to decide if disc should be burnt or fired should be here
        // todo: store a variable "workshop_tutorial_done" within current_variables, through the csv script

        console.log(current_variables)
        //this.playDiscAnimation(sw,sh, )

    }

    showButton(display)
    {
        if(display)
        {
            this.button.box.removeClass("hidden");
            this.button.box.removeClass("fade_out");
            this.button.box.addClass("fade_in");
        }
        else
        {
            this.button.box.removeClass("fade_in");
            this.button.box.addClass("hidden");
        }
    }

    areColliding(c1,c2)
    {
        return dist(c1.x, c1.y, c2.x, c2.y) <= c1.radius + c2.radius;
    }

    onLeave()
    {
        this.deleteSprites();
    }

    onChoice(choice)
    {
    }
}