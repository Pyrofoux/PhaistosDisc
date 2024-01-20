class StartScreen extends Screen
{

    init()
    {

    }

    async onEnter()
    {
        await textbox.dialogue("Click to START GAME");
        playScene("OPENING_DISCUSSION")
    }

}