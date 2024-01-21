class WorkshopScreen extends Screen
{

    init(sw,sh)
    {
        // turn black svgs into white, so easier to project color
        img_symbols.forEach( name =>spr.symbols[name].filter(INVERT));
        
        this.square_in_circle = sqrt(2)/2;
        this.disc_size = 25/100*sw;

        this.stamps_data = [
            {"symbol":"PEDESTRIAN"},
            {"symbol":"BEE"},
            {"symbol":"SHIP"},
            {"symbol":"ARROW"},
            {"symbol":"SHIELD"},
            {"symbol":"ROSETTE"},
            {"symbol":"BEE"},
            {"symbol":"DELETE"},
        ];
        this.stamps = new Group();
        this.stamps.collider = "kinematic";

        // graphic buffer to print stamps on, and circle clip
        this.stamp_buffer = createGraphics(this.disc_size, this.disc_size);
    }

    async onEnter(sw,sh)
    {

        this.slide_picture = null; // erase previous slide picture
        

        // create stamps
        this.stamps_data.forEach((data,index)=>{
            var stamp = new this.stamps.Sprite();
            stamp.symbol = data.symbol;
            stamp.x = (50 + (index-this.stamps_data.length/2+1/2)*10  )      /100*sw;
            stamp.later = 2;
            stamp.y = 8/100*sw;
            stamp.draw = () => this.drawStamp(stamp, sw, sh);
        });

        // create clay disc
        this.disc = new Sprite();
        this.disc.diameter = this.disc_size;
        this.disc.x = sw*50/100;
        this.disc.y = sh*50/100;
        this.disc.color = COLORS.COLOR_CLAY;
        this.disc.collider = "kinematic";
        this.disc.strokeWeight = 3;
        this.disc.layer = 0;
        this.disc.draw = () =>{
            fill(COLORS.COLOR_CLAY);
            noStroke();
            circle(0,0, this.disc.diameter);
            image(this.stamp_buffer, 0,0);
        }

        this.clearDisc();
        await this.slideIn(); // slide in effect

    }

    drawStamp(stamp, sw, sy)
    {
        push();
        fill(COLORS.STAMP_BG);
        stroke(COLORS.STAMP_CONTOUR);
        noStroke()
        circle(0,0,stamp.diameter);

        drawingContext.save();
        let gradient = drawingContext.createLinearGradient(-stamp.diameter/2, -stamp.diameter/2, stamp.diameter/2, stamp.diameter/2);
        
        if(stamp.symbol == "DELETE")
        {
            gradient.addColorStop(0, '#FA6E2F');
            gradient.addColorStop(0.5, 'darkgrey');
            gradient.addColorStop(0.9, '#FA6E2F');
        }
        else
        {
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
        else cvs.image(img,x+(fit-w)/4,y+(fit-h)/4,w,h) // tried to fix a weird shift, good enough for now
    }

    draw(sw,sh)
    {
        background(COLORS.SCREEN_BG);
        
        var grabbed = false;
        var pointed = false;
        this.stamps.forEach((stamp,index)=>{
            if(stamp.mouse.hovering())
            {
                if(stamp.symbol != "DELETE")grabbed = true;
                else pointed = true;
            }

            
            if(stamp.mouse.released())
            {
               if(stamp.symbol == "DELETE")
               {
                sounds.clear.play();
                this.clearDisc();
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
                stamp.vel.x = 0;
                stamp.vel.y = 0;
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
    }

    stampTrace(stamp)
    {
            //stamp.x = this.disc.x - this.disc.radius + dx + stamp.radius


        var dx =  -this.disc.x + this.disc.radius + stamp.x - stamp.radius;
        var dy =  -this.disc.y + this.disc.radius + stamp.y - stamp.radius;
        this.stamp_buffer.tint(COLORS.STAMP_ON_DISC)
        this.drawSymbol(stamp.symbol, dx, dy, stamp.diameter*this.square_in_circle, this.stamp_buffer)
    }

    clearDisc() // clear disc and draw separation
    {
        this.stamp_buffer.clear();
        this.stamp_buffer.stroke(COLORS.STAMP_ON_DISC);
        this.stamp_buffer.strokeWeight(2);
        this.stamp_buffer.drawingContext.setLineDash([5]);
        //this.stamp_buffer.line(-this.disc.radius,0,this.disc.radius,0);
        this.stamp_buffer.line(this.disc.radius,-this.disc.diameter,this.disc.radius,this.disc.diameter);
        this.stamp_buffer.line(-this.disc.diameter,this.disc.radius,this.disc.diameter,this.disc.radius);

    }

    areColliding(c1,c2)
    {
        return dist(c1.x, c1.y, c2.x, c2.y) <= c1.radius + c2.radius;
    }

    onLeave()
    {
        this.stamps.removeAll();
        this.disc.remove();
    }

    onChoice(choice)
    {
    }
}