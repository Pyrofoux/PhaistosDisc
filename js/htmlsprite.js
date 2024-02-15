let all_html_sprites = [];
class HTMLSprite
{
    constructor(elmt_type, x, y, w, h, image_w, image_h)
    {  
        this.box = createElement(elmt_type);
        this.box.parent("screen_container");
        if (image_w && image_h) this.box.size(image_w, image_h); // helpful when loading images
        this.elt = this.box.elt;
        // percentage of the current screen
        this.reposition(x,y,w,h);
        
        
        all_html_sprites.push(this);
    }

    adjust()
    {
        var sw = main_cvs.elt.clientWidth,
        sh = main_cvs.elt.clientHeight;

        /* sw = main_cvs.width;
        sy = main_cvs.width; */

        var w = this._w == AUTO ? AUTO : this._w * sw;
        var h = this._h == AUTO ? AUTO : this._h * sh;

        this.box.size(w, h);
        this.box.position(this._x * sw, this._y * sh);
    }

    reposition(x,y,w,h) // set in percentage of the current screen. can use the AUTO p5 const
    {
        this._x = x/100 || this._x;
        this._y = y/100 || this._y;
        this._w = (w == AUTO ? AUTO : w/100) || this._w;
        this._h = (h == AUTO ? AUTO : h/100) || this._h;
        this.adjust();
    }

    remove()
    {
        this.box.remove();
    }

    event(...args)
    {
        this.box.elt.addEventListener(...args);
    }
}

class HTMLSpriteImg extends HTMLSprite
{
    constructor(src, x, y, w, h, image_w, image_h)
    {
        super("img", x, y, w, h, image_w, image_h),
        this.box.elt.src = src;
    }
}