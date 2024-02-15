// after CIRCLE/RECTANGLE collision check
function closestEdge(circle, rect) {

  

    var cx = circle.x, cy = circle.y, cr = circle.radius,
        rl = rect.x - rect.w/2, rr = rect.x - rect.w/2;
        rt = rect.y - rect.h/2, rb = rect.y + rect.h/2;
  
      // left, right, top, bottom
    var dists = [rl-cx,cx-rr,cy-rb, rt-cy].map(d => d > 0 ? d : NaN)
    //var dists = [rl-cx-cr,cx+cr-rr,cy+cr-rb, rt-cy-cr].map(d => d > -cr/2 ? d : NaN)
    var min_dist = min(...dists);
    var side = dists.indexOf(min_dist);
    return side; // 0: left, 1: right, 2:top, 3:bottom
  
  }
  
  function triangle_mod(x,n) // 0 1 2 3 2 1 0 1 2 3 2 1 0
  {
    var a = x%(2*n);
    return a > n ? 2*n-a : a
  }




  var timers = [];
  function tick(name, reset = -1) // function to easily count ticks
  {
    if(!timers[name])
    {
        timers[name] = 1;
    }
    else
    {
      timers[name]++;
    }

    if(reset != -1)
    {
        timers[name] = reset;
    }

    return timers[name];
  }

function searchIn(obj, value)
{
  for(var i in obj)
  {
    if(typeof obj[i] == "object")
    {
      if(searchIn(obj[i], value) != -1)
      {
        return i;
      }
    }
    else
    {
      if(obj[i] == value) return i;
    }
  }
  return -1;
}

// handy funciton with same parameters as image()
function rotate_and_draw_image(img, img_x, img_y, img_width, img_height, angle){
  push()
  translate(img_x+img_width/2, img_y+img_height/2);
  rotate(degrees(angle));
  image(img, 0, 0, img_width, img_height);
  pop();
}

async function waitFrames(frames)
{
  return new Promise(async (resolve) =>{
    for(var i = 0; i < frames; i++) await new Promise(resolve => {requestAnimationFrame(resolve);});
    resolve();
  })
}