class HTMLSpriteDice extends HTMLSprite
{
    constructor(src, x, y, w)
    {
        super("div", x, y, w, AUTO, w ,w);
        this.box.addClass("dice-face");
        this.pips = [];
        this.pip_value = 6;
        for(var i = 0; i < 6; i++)
        {
            this.addPip();
        }

        this.event("click", () => this.shakeToFace(int(random(1,7))));
    }

    addPip()
    {
        let pip = createElement("div");
        pip.addClass("pip");
        this.pips.push(pip);
        this.box.child(pip);
    }

    // Sets the dice face to a specific value
    // (not limited to 1 - 6!)
    showFace(value)
    {
        if(value == this.pip_value) return false; // no need to update pips
        this.pips.forEach(pip => pip.remove());
        this.pips = [];
        for(var i = 0; i < value; i++)
        {
            this.addPip();
        }
        this.pip_value = value;
    }

    // Shake animation, ends on the given value
    async shakeToFace(value)
    {
        const duration = 1000, // in milliseconds
        max_angle = 5, // in degrees
        max_scale = 1.3,
        shake_speed = 50,
        change_pips = 5; // how many values do we show before final value
        return new Promise(async (resolve) =>{

            let angle = 0, scale = 1, zero, pips_to_show;

            const firstFrame = (timeStamp) => {
                zero = performance.now();
                pips_to_show = new Array(change_pips).fill(0).map(i => int(random(1,7)));
                pips_to_show.push(value);
                animate(timeStamp);
              }

            const animate = (timestamp) => {
                const t = (performance.now() - zero) / duration; // linear time
                if (t < 1)
                {
                    angle = Math.sin(t*shake_speed)*max_angle;
                    scale = (1- Math.abs(2*t-1)) *(max_scale-1) + 1;

                    this.showFace(pips_to_show[Math.round(t * (pips_to_show.length-1))]);

                    this.box.style("transform", `scale(${scale}) rotate(${angle}deg)`);
                    requestAnimationFrame((timestamp) => animate(timestamp));
                }
                else // final state
                {
                    this.box.style("transform", `scale(1) rotate(0deg)`);
                    resolve();
                }
            }
            requestAnimationFrame(firstFrame);
        });
    }

}