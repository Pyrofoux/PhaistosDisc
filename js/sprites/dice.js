class HTMLSpriteDice extends HTMLSprite
{
    constructor(x, y, w)
    {
        super("div", x, y, w, AUTO, w ,w);
        this.box.addClass("dice-face");
        this.pips = [];
        this.pip_value = 6;
        for(var i = 0; i < 6; i++)
        {
            this.addPip();
        }

        this.clickable = false;
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

            // Dice must not be clickable during animation
            this.setClickable(false);

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

    setClickable(enabled)
    {
        this.clickable = enabled;
        if(this.clickable)
        {
            this.box.addClass("clickable-dice");
        }
        else
        {
            this.box.removeClass("clickable-dice");
        }
    }

}

class HTMLSpriteDicePair
{
    constructor(x1, y1, x2, y2, w)
    {
        this.dice = [];
        this.dice[0] = new HTMLSpriteDice(x1, y1, w);
        this.dice[1] = new HTMLSpriteDice(x2, y2, w);
        this.pip_values = [6, 6];
    }

    showFace(values)
    {
        this.dice[0].showFace(values[0]);
        this.dice[1].showFace(values[1]);
        this.pip_values = values;
    }

    async shakeToFace(values)
    {
        return Promise.all([
        this.dice[0].shakeToFace(values[0]),
        this.dice[1].shakeToFace(values[1]) ]);
    }

    event(...args)
    {
        this.dice[0].event(...args);
        this.dice[1].event(...args);
    }

    get clickable() {
        return this.dice[0].clickable && this.dice[1].clickable;
    }

    setClickable(enabled)
    {
        this.dice[0].setClickable(enabled);
        this.dice[1].setClickable(enabled);
    }

}