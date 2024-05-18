
class GameDefeat extends Screen
{
    init()
    {
        // State contains information about the current state of the game
        this.state = this.initialState();
        
        // Data for displaying the Phaistos disc
        this.disc = {
            cx:screen_width*0.5,
            cy:screen_height*0.4,
            w:A_width/disc_scaling,
            h:A_height/disc_scaling,
        };

        this.disc.x = this.disc.cx - this.disc.w/2;
        this.disc.y = this.disc.cy - this.disc.h/2;

        // visual GUI state
        this.vstate = {
            pixels_changed:false,
            highlighted_cell:-1,
            highlighted_symbol:-1,
            blocked_cells:[],
            clickable_cells: new Array(31).fill(0).map((v, i) => i),
        }

        // sprites for tokens and dice
        this.tokens = {};
        this.dice = {}
    }

    async onEnter()
    {
        this.createInitialSprite();
        this.redrawDiscImage(true);
        await this.slideIn(); // slide in effect
    }

    onLeave()
    {
        this.deleteSprites();
    }


    disc2screen(coords)
    {
        let sx = coords.x/disc_scaling, sy = coords.y/disc_scaling;
        return {x:this.disc.x+sx, y:this.disc.y+sy};
    }

    initialState()
    {
        return {
            hero_turn: false, 
            hero:  0,
            taur: 30,
            dice_roll : [0, 0],
        }
    }

    getBlockedCells()
    {
        // blocked cells are the ones that share a symbol
        // with the cell the Taur is on
        let blocked_cells = new Set();
        let blocked_symbols = cell2symbol[this.state.taur].map(symbol_data => symbol_data.symbol);
        for(var i = 0; i < cell2symbol.length; i++)
        {
            let cell_symbols = cell2symbol[i].map(symbol_data => symbol_data.symbol);
            for(let blocked_symbol of blocked_symbols)
            {
                if(cell_symbols.indexOf(blocked_symbol) != -1)
                {
                    blocked_cells.add(i);
                }
            }
        }
        return Array.from(blocked_cells);
    }

    createInitialSprite()
    {

        // hero token
        let hero = new Sprite();
        hero.radius = 10;
        hero.color = "white";
        let coord_hero = this.disc2screen(cell_centers[this.state.hero]);
        hero.x = coord_hero.x;
        hero.y = coord_hero.y;
        hero.collider = "kinematic";
        this.tokens.hero = hero;

        // taur token
        let taur = new Sprite();
        taur.radius = 10;
        taur.color = "#212121";
        let coord_taur = this.disc2screen(cell_centers[this.state.taur]);
        taur.x = coord_taur.x;
        taur.y = coord_taur.y;
        taur.collider = "kinematic";
        this.tokens.taur = taur;

        // dice for each player
        let die_width = 6, dice_positions = {
            "white":[{x:1, y:4} ,{x:1, y:15} ],
            "black":[{x:80, y:4} ,{x:80, y:15} ],
        };

        for(let color in dice_positions)
        {
            let position = dice_positions[color];
            let dice = new HTMLSpriteDicePair(position[0].x, position[0].y, position[1].x, position[1].y, die_width);
            
            // temporary
            dice.event("click", () => 
                {
                    if(dice.clickable) dice.shakeToFace([int(random(1,7)), int(random(1,7))]);
                    dice.setClickable(true);
                });
            dice.setClickable(true);

            this.dice[color] = dice;
        }
    }

    deleteSprites()
    {
        this.tokens.hero.remove();
        this.tokens.taur.remove();
        this.dice.white.remove();
        this.dice.black.remove();
    }

    draw()
    {
        if(this.vstate.pixels_changed)
        {
            this.redrawDiscImage();
            this.vstate.pixels_changed = false;
        }

        background("#212121")
        image(disc_cvs, this.disc.x, this.disc.y);
    }

    // Check if the visual info have actually changed
    // to avoid recalculating pixels at each frame
    updateVisualState(changed)
    {
        let pixels_changed = false;
        for(let property in changed)
        {
            if(changed[property] != this.vstate[property])
            {
                this.vstate[property] = changed[property];
                pixels_changed = true;
            }
        }

        if(pixels_changed)
        {
            this.vstate.pixels_changed = true;
        }
    }

    // Change pixels on the disc canvas
    // Call only when the pixels actually need to change
    redrawDiscImage(init)
    {

        let cell = this.vstate.highlighted_cell;

        disc_cvs.clear()
        drawDisc("A_surface");
        drawDisc("A_disc");

        var blocked_cells = this.vstate.blocked_cells;
        var c = color("red");
        c.setAlpha(50);
        for(let blocked_cell of blocked_cells)
        {
            colorCell(blocked_cell, c);
        }

        if(cell > -1)
        {
            var c = color("blue")
            c.setAlpha(50);
            colorCell(cell, c);
        }
    }


    // animation to move token cell by cell
    async moveToken(token, start_cell, end_cell, callback)
    {
        return new Promise(async resolve =>{
        let delta = Math.sign(end_cell - start_cell);
        for(let i = start_cell; i != end_cell + delta; i += delta)
        {
            let target = this.disc2screen(cell_centers[i]);
            await token.moveTo(target, 10);
        }
        resolve();
        });
    }

    async onClick(mx,my)
    {
        var x = (mx  - this.disc.x);
        var y = (my  - this.disc.y);

        if(x < 0 || y < 0) return false;
        if(x >= this.disc.w || y >= this.disc.h) return false;


        var dx = x*disc_scaling;
        var dy = y*disc_scaling;

        var semantic = coordToSymbols(dx,dy);

        if(semantic.cell > -1)
        {
            let start_cell = this.state.taur;
            this.state.taur = semantic.cell;
            let end_cell = this.state.taur;
            await this.moveToken(this.tokens.taur, start_cell, end_cell);
            await waitFrames(1); // to avoid jittery frame
            this.updateVisualState({blocked_cells: this.getBlockedCells()});
        }
    }

    onMouseMove(mx,my)
    {
        var x = (mx  - this.disc.x);
        var y = (my  - this.disc.y);
        if(x < 0 || y < 0) return false;
        if(x >= this.disc.w || y >= this.disc.h) return false;


        var dx = x*disc_scaling;
        var dy = y*disc_scaling;

        var semantic = coordToSymbols(dx,dy);
        if(this.vstate.clickable_cells.includes(semantic.cell))
        {
            this.updateVisualState
            ({
                highlighted_cell:semantic.cell,
            });

            info.html(`CELL ${semantic.cell}`);
            cursor("pointer");
        }
        else
        {
            cursor("default")
        }
        
    }
}