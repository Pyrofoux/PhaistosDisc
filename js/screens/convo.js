class ConvoScreen extends Screen
{

    init()
    {
        this.heads = {};
        this.heads.plumed = new HTMLSpriteImg("img/PLUMED_HEAD.svg", 3, 58, 15, AUTO, 24 ,30); // last two numbers are from the file data on wikipedia: width, height
        let plumed = this.heads.plumed;
        plumed.box.class("archeo_portrait");

        this.heads.tattoo = new HTMLSpriteImg("img/TATTOOED_HEAD.svg", 83, 60, 12, AUTO, 23 ,32);
        let tattoo = this.heads.tattoo;
        tattoo.box.class("designer_portrait");

        this.rosettes = [];
        for(var i = 0; i < 3; i++)
        {
            var size = 5, spacing = 8;
            let rosette = new HTMLSpriteImg("img/ROSETTE.svg", 50-size + (i-1)*spacing, 78-size, size, AUTO, 25, 26);
            rosette.box.class("discussion_token");
            this.rosettes.push(rosette);
        }

        this.rosette_count = 0;
    }

    onChoice(choice)
    {
        var rosette = this.rosettes[this.rosette_count];
        if(choice.speaker == "Plumed Head")
        {
            rosette.box.addClass("orange_svg");
        }else if(choice.speaker == "Tattoo")
        {
            rosette.box.addClass("purple_svg");
        }
        rosette.box.addClass("discussion_token_gained");
        
        this.rosette_count++;
    }

    draw()
    {
        background("#212121");
    }
}