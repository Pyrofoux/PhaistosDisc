
class Game1Screen extends Screen
{
    init()
    {
        this.state = this.initialState();
        

        this.disc = {
            cx:screen_width*0.5,
            cy:screen_height*0.375,
            w:A_width/disc_scaling,
            h:A_height/disc_scaling,
        };

       this.disc.x = this.disc.cx - this.disc.w/2;
       this.disc.y = this.disc.cy - this.disc.h/2;

       // visual GUI state
        this.vstate = {
            highlighted_cell:-1,
            highlighted_symbol:-1,
        }

       this.createInitialSprite();
       this.redrawDiscImage(true);
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
            //blocked_cells: [ 11, 13, 19, 27, 30 ],
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
        this.tokens = {};

        // hero token
        let hero = new Sprite();
        hero.radius = 10;
        hero.color = "white";
        let coord_hero = this.disc2screen(cell_centers[this.state.hero]);
        hero.x = coord_hero.x;
        hero.y = coord_hero.y;
        hero.collider = "kinematic";
        this.tokens.hero = hero;

        // taur
        let taur = new Sprite();
        taur.radius = 10;
        taur.color = "#212121";
        let coord_taur = this.disc2screen(cell_centers[this.state.taur]);
        taur.x = coord_taur.x;
        taur.y = coord_taur.y;
        taur.collider = "kinematic";
        this.tokens.taur = taur;

        // dice
        var size = 5, spacing = 8;
        let dice = new HTMLSpriteDice("div",1, 4, 6);
        console.log(dice);
        //dice.shakeToFace(5)

    }

    draw()
    {
        background("pink")
        image(disc_cvs, this.disc.x, this.disc.y);
    }

    // Check if the visual info have actually changed
    // to avoid recalculating pixels at each frame
    updateDiscImage(changed)
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
            this.redrawDiscImage();
        }
    }

    // Change pixels on the disc canvas
    // Call only when the pixels actually need to change
    redrawDiscImage(init)
    {

        let cell = this.vstate.highlighted_cell;

        disc_cvs.background(255);

        drawDisc("A_disc");

        var blocked_cells = this.getBlockedCells();
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
            info.html(`CELL ${cell}`);
            cursor("pointer");
        }
        else
        {
            cursor("default")
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
        if(x >= A_width || y >= A_height) return false;


        var dx = x*disc_scaling;
        var dy = y*disc_scaling;

        var semantic = coordToSymbols(dx,dy);

        if(semantic.cell > -1)
        {
            let start_cell = this.state.taur;
            this.state.taur = semantic.cell;
            let end_cell = this.state.taur;
            await this.moveToken(this.tokens.taur, start_cell, end_cell)
        }

        // redraw image disc after click
        this.redrawDiscImage();
    }

    onMouseMove(mx,my)
    {
        var x = (mx  - this.disc.x);
        var y = (my  - this.disc.y);
        if(x < 0 || y < 0) return false;
        if(x >= A_width || y >= A_height) return false;


        var dx = x*disc_scaling;
        var dy = y*disc_scaling;

        var semantic = coordToSymbols(dx,dy)
        this.updateDiscImage
        ({
            highlighted_cell:semantic.cell,
        });
    }
}