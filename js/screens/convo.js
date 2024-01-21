class ConvoScreen extends Screen
{

    init()
    {

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
    }

    onEnter()
    {
        this.rosettes.forEach(rosette =>{
            rosette.box.removeClass("hidden");
            rosette.box.removeClass("fade_out");
            rosette.box.addClass("fade_in");
        });
    }

    onLeave()
    {
        this.rosettes.forEach(rosette =>{
            rosette.box.removeClass("fade_in");
            rosette.box.removeClass("discussion_token_gained");
            rosette.box.removeClass("orange_svg");
            rosette.box.removeClass("purple_svg");
            rosette.box.addClass("fade_out");
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
}