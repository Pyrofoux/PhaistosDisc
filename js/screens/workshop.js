class WorkshopScreen extends Screen
{

    init(sw,sh)
    {

    }

    async onEnter(sw,sh)
    {
        this.slide_picture = null; // erase previous slide picture
        await this.slideIn(); // slide in effect
    }

    draw()
    {
        background(COLORS.SCREEN_BG);
        image(spr.symbols["PLUMED_HEAD"],0,0,200,200);
    }

    onLeave()
    {
    }

    onChoice(choice)
    {
    }
}