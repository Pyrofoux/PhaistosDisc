class ConvoScreen extends Screen
{

    init(sw,sh)
    {
        // remember screen width and height
        this.sw = sw;
        this.sh = sh;

        // create rosette elements
        this.rosettes = [];
        for(var i = 0; i < 3; i++)
        {
            var size = 5, spacing = 8;
            let rosette = new HTMLSpriteImg("img/symbols/svg/ROSETTE.svg", 50-size/2 + (i-1)*spacing, 78-size, size, AUTO, 25, 26);
            rosette.box.addClass("discussion_token");
            rosette.box.addClass("hidden");
            this.rosettes.push(rosette);
        }
        this.rosette_count = 0;

        // stamp for unlocking stamp animation
        this.stamp = null;
    }

    onEnter()
    {
        // display rosettes
        this.rosettes.forEach(rosette =>{
            rosette.box.removeClass("hidden");
            rosette.box.removeClass("fade_out");
            rosette.box.addClass("fade_in");
        });
    }

    onLeave()
    {
        // hides rosettes
        this.rosettes.forEach(rosette =>{
            rosette.box.removeClass("fade_in");
            rosette.box.removeClass("discussion_token_gained");
            rosette.box.removeClass("orange_svg");
            rosette.box.removeClass("purple_svg");
            //rosette.box.addClass("fade_out");
            rosette.box.addClass("hidden");
        });
    }

    onChoice(choice)
    {
        var rosette = this.rosettes[this.rosette_count];
        rosette.box.removeClass("fade_in");
        rosette.box.addClass("discussion_token_gained");
        if(choice.speaker == "Plumed Head")
        {
            rosette.box.addClass("orange_svg");
        }else if(choice.speaker == "Tattoo")
        {
            rosette.box.addClass("purple_svg");
        }
        
        
        this.rosette_count++;
    }


    // animations
    playUnlockStampAnimation(workshop_screen, stamp_name)
    {
        let sw = this.sw, sh = this.sh;
        return new Promise(async (resolve)=>{
            this.stamp = new Sprite();
            this.stamp.diameter = 9/100*sw;
            this.stamp.x = sw/2;
            this.stamp.y = sh*0.66/2;
            this.stamp.symbol = stamp_name;
            this.stamp.scale = 0;

            var radialStripeAngle = 360/10;
            var finalScale = 2; 
            var scaleSpeed = 0.06;
            var stripeSpeed = 0.05;

            this.stamp.animation_direction = 1;
            this.stamp.draw = () =>
            {
                var stripeColor = color(COLORS.UNLOCK_STRIPE);
                stripeColor.setAlpha(this.stamp.scale/finalScale * 255);
                fill(stripeColor)
                var t = millis()*stripeSpeed;
                
                for(var i = 0; i < 360;  i+=2*radialStripeAngle)
                {
                    arc(0, 0, sw*1.2, sw*1.47, i+t, i+t+radialStripeAngle);
                }
                

                this.stamp.scale = constrain(this.stamp.scale +scaleSpeed * this.stamp.animation_direction, 0, finalScale);
                workshop_screen.drawStamp(this.stamp, sw, sh);
                
            };
            resolve();
        });
    }

    playUnlockStampAnimationOut(workshop_screen, stamp_name)
    {
        var finalScale = 2; 
        var scaleSpeed = 0.06;
        this.stamp.animation_direction = -1;
        return new Promise(async (resolve)=>{
            this.stamp.update = () =>
            {
                if(this.stamp.scale.x <= 0.011) // weird but encessary cause it's not a single value, but an object with setters
                {
                    this.stamp.scale.x = 0;
                    this.stamp.scale.y = 0;
                    resolve();
                    this.stamp.remove();
                }
            };        
        });
    }

}
