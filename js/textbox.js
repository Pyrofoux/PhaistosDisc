class Textbox extends HTMLSprite
{
    constructor(height_ratio, id="textbox", parent="screen_container")
    {
        // create and position textbox div
        super("div", 0, 100 - height_ratio, 100, height_ratio);

        this.box.id(id);
        this.box.class("textbox");
        this.box.style("cursor","pointer");
        this.elt.addEventListener("click", () => this.pressSkip());

        // create and position speaker portraits
        this.heads = {};
        this.heads.plumed = new HTMLSpriteImg("img/symbols/svg/PLUMED_HEAD.svg", 3, 63, 12, AUTO, 24 ,30); // last two numbers are from the file data on wikipedia: width, height
        let plumed = this.heads.plumed;
        plumed.box.class("archeo_portrait");

        this.heads.tattoo = new HTMLSpriteImg("img/symbols/svg/TATTOOED_HEAD.svg", 83, 64, 10, AUTO, 23 ,32);
        let tattoo = this.heads.tattoo;
        tattoo.box.class("designer_portrait");

        // create and position speaker arrow
        this.arrow = new HTMLSprite("div", 0, 100 - height_ratio-2, 0, 0);
        this.arrow.box.addClass("textbox_arrow");
        this.arrow.box.addClass("hidden");
        // settings
        this.speak_interval = 50; // millis
        this.choice_delay = 300;

        // internal variables
        this.speak_timer;
        this.speak_html;
        this.speak_current_char = 0;
        this.done_speaking = true;
        this.speak_sound;

        //promises
        this.speaking_promise_resolve;
        this.skip_promise_resolve;
        this.choice_promise_resolve;
        
    }

    set(html)
    {
        this.box.html(html);
    }

    clear()
    {
        this.set("");
    }

    write(html)
    {
        return new Promise((resolve, reject)=>{
            this.speaking_promise_resolve = resolve; // store it so we can resolve it elsewhere
            this.done_speaking = false;
            this.speak_html = html;
            this.speak_current_char = 0;

            var stepSpeak = () =>{
            this.speak_current_char++;
            this.set(html.slice(0,this.speak_current_char+1));
            if(this.speak_current_char < html.length)
            {
                if(this.speak_sound)this.speak_sound.play(); // play voice sound
                var interval = this.speak_interval;
                if([".","?","!"].indexOf(html[this.speak_current_char]) != -1 ) interval *= 10;
                if([",",";"].indexOf(html[this.speak_current_char]) != -1 ) interval *= 5;
                this.speak_timer = setTimeout(stepSpeak, interval);
            }
            else
            {
                this.done_speaking = true;
                resolve();
            }
        }
            stepSpeak();
        });
    }

    skip()
    {
        clearTimeout(this.speak_timer);
        this.set(this.speak_html);
        this.done_speaking = true;
        this.speaking_promise_resolve();
    }

    dialogue(html, style)
    {
        this.setStyle(style);
        return new Promise((resolve)=>{
            this.skip_promise_resolve = resolve; // store it so we can resolve it elsewhere
            this.write(html);
        })
    }

    choice(choice1, choice2)
    {
        return new Promise((resolve) =>{
        this.choice_promise_resolve = resolve;
        this.clear();
        this.setStyle("CHOICE");
        let makeChoice= (choice)=>{
            var button = createElement("button");
            button.html(`▶ ${choice.html}`);
            button.parent(this.box);
            button.addClass("choice_button");

            if(choice.speaker == "Plumed Head")
            {
                button.addClass("choice_archeo");
            }
            else if(choice.speaker == "Tattoo")
            {
                button.addClass("choice_designer");
            }
            
            button.elt.dataset.speaker = choice.speaker;
            button.elt.dataset.choice = JSON.stringify(choice);

            button.mouseOut(outChoice);
            button.mouseOver(hoverChoice);
            // Delay when presenting choices, to prevent button mashing that skips choice
            setTimeout(()=>{
                button.mouseClicked(clickChoice);
            }, this.choice_delay);
           
        }

        let hoverChoice = (e)=>{
            sounds.select.play();
            var speaker = e.target.dataset.speaker;
            if(speaker == "Plumed Head")
            {
                this.setStyle("ARCHEO");
            }
            else if(speaker == "Tattoo")
            {
                this.setStyle("DESIGNER");
            }
        };

        let clickChoice = (e)=>{
           e.stopPropagation();
           var choice = JSON.parse(e.target.dataset.choice)
           this.choice_promise_resolve(choice);
           sounds.choice_made.play();
        };

        let outChoice = (e)=>{
            this.setStyle("none");
        };

        makeChoice(choice1);
        this.elt.appendChild(document.createElement("br"));
        makeChoice(choice2);
        });
    }

    pressSkip()
    {
        if(this.done_speaking) // done speaking? resolve, so we can move on
        {
            this.skip_promise_resolve();
        }
        else // the user is asking to skip this dialogue
        {
            this.skip();
        }
    }

    setStyle(style)
    {
        switch(style)
        {
            case "ARCHEO":
                this.box.style("color",COLORS.ARCHEO_TEXT_COLOR);
                this.speak_sound = sounds.blip_f;
                this.moveArrow("left");
                this.heads.plumed.box.removeClass("inactive_portrait");
                this.heads.tattoo.box.addClass("inactive_portrait");

            break;
            case "DESIGNER":
                this.box.style("color",COLORS.DESIGNER_TEXT_COLOR);
                this.speak_sound = sounds.blip_m;
                this.moveArrow("right");
                this.heads.tattoo.box.removeClass("inactive_portrait");
                this.heads.plumed.box.addClass("inactive_portrait");
            break;

            default:
                this.heads.plumed.box.addClass("inactive_portrait");
                this.heads.tattoo.box.addClass("inactive_portrait");
                this.box.style("color",COLORS.DEFAULT_TEXT_COLOR);
                this.speak_sound = sounds.letter;
                this.moveArrow("none");
            break;
        }
    }

    moveArrow(position)
    {
        switch(position)
        {
            case "left":
            this.arrow.box.show();
            //this.arrow.reposition(15);
            this.arrow.reposition(12);
            break;

            case "right":
            this.arrow.box.show();
            this.arrow.reposition(80);
            break;

            case "none":
                this.arrow.box.hide();
            break;
        }
        
    }

}