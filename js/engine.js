
let disc_imgs = [];
let pixels = [];
let palettes = {}
let disc_scaling = 5;

let main_cvs, disc_cvs, textbox;
let info, hidden;


//const img_names = ["A_disc", "A_cells", "A_symbols"];
const img_names = [];
const A_width = 1883;
const A_height = 1929

let pixel_density;
let screen;
let screen_width, screen_height;
let aspect_ratio = "800:700", textbox_height = 20;

let sounds = {}, spr = {};

async function preload()
{
  // disc labeled layers
  img_names.forEach(name => disc_imgs[name] = loadImage(`img/${name}.png`));
  spr.symbols = {}; // svg symbols
  spr.symbols["PLUMED_HEAD"]   = loadImage("img/PLUMED_HEAD.svg");
  spr.symbols["TATTOOED_HEAD"] = loadImage("img/TATTOOED_HEAD.svg");


  spr.slides = {}; // slide pictures
  spr.slides.blank_bg = loadImage("img/blank_slide_bg.png");
  spr.slides.blank_front = loadImage("img/blank_slide_front.png");
  spr.slides.blank = loadImage("img/blank_slide.png");
  spr.slides.disc = loadImage("img/slide_disc.png");


  spr.palace_map = loadImage("img/palace_map.png");

  spr.font = loadFont("./humming.otf");

  // sounds
  sounds.letter = loadSound("audio/letter.mp3");
  sounds.blip_m = loadSound("audio/blip_m.wav");
  sounds.blip_f = loadSound("audio/blip_f.wav");
  sounds.choice_made = loadSound("audio/choice_made.wav");
  sounds.select = loadSound("audio/select.wav");
  sounds.slide = loadSound("audio/slideshow_button.wav");
  Object.values(sounds).forEach(sound => sound.setVolume(0.5));
  sounds.choice_made.setVolume(1);
}

async function setup()
{
  pixelDensity(2);
  pixel_density = pixelDensity();
  // graphic buffer for pixel manipulations on the disc
  disc_cvs = createGraphics(A_width/disc_scaling, A_height/disc_scaling);

  // actual canvas shown on screen -- beware of the *2 ratio that p5 creates
  //main_cvs = new Canvas(cvs_width, cvs_height);
  main_cvs = new Canvas(aspect_ratio);
  screen_width = main_cvs.width;
  screen_height = main_cvs.height;
  main_cvs.parent("screen_container");
  console.log("canvas dims",screen_width, screen_height);

  /* // loading disc images pixels
  img_names.forEach( name =>{
    pixels[name] = getPixels(disc_imgs[name]);
    palettes[name] = countColors(pixels[name]);
  });
 
  // Replace color ids with their current closest match,
  // cause browsers (Chrome, Edge, not Firefox) might distort them a little
  Object.keys(color2cell.A).forEach(original_color_name => {
    var closest_match = getClosestColor(original_color_name.split("-"), palettes.A_cells);
    color2cell.A[closest_match] = color2cell.A[original_color_name];
  });
  Object.keys(color2symbol).forEach(original_color_name => {
    var closest_match = getClosestColor(original_color_name.split("-"), palettes.A_symbols);
    color2symbol[closest_match] = color2symbol[original_color_name];
  }); */

  // Other HTML elements
  info = createDiv('== DEBUG TOOLS ==');
  info.position(10, 10);

  hidden = createDiv().id("hidden");
  hidden.elt.style.display = "none";

  // create textbox
  textbox = new Textbox(textbox_height);

  // create screens
  screens = 
  {
    "demo":new DemoScreen("demo"),
    "start":new StartScreen("start"),
    "conversation":new ConvoScreen("conversation"),
    "load":new LoadScreen("load"),
    "map":new MapScreen("map"),
    "workshop":new WorkshopScreen("workshop"),
  }

  // text font when writing on canvas
  textFont(spr.font);
  textAlign(CENTER, CENTER);

  changeScreen(screens.load);
  await loadAllSheets();
  changeScreen(screens.start);
  
  //playScene("OPENING_DISCUSSION")
  //playScene("DEBUG_SCENE")
  //playScene("MINDPALACE_OPENING");

  
  // debug scenes
  for(var scene_name in all_scenes)
  {
    info.child(createElement("br"));
    var link = document.createElement("a");
    link.href="#";
    link.innerHTML = scene_name;
    link.dataset.scene_name = scene_name
    link.onclick = function(e){
      textbox.skip();
      playScene(e.target.dataset.scene_name)
    };
    info.child(link);
    console.log(link, scene_name)
  }

}

function draw()
{
  screen.preDraw(screen_width, screen_height);
  screen.draw(screen_width, screen_height);
  screen.postDraw(screen_width, screen_height);
}

function mouseClicked()
{
  var x = Math.floor(mouseX),
  y = Math.floor(mouseY);
  if(screen) screen.onClick(x,y);
}

function mouseMoved() // have to be detected another way
{
  var x = Math.floor(mouseX),
  y = Math.floor(mouseY);
  if(screen) screen.onMouseMove(x,y);
}

function changeScreen(destination_screen)
{
  if(screen)
  {
    screen.onLeave(screen_width, screen_height);
    screen.copyVariables(destination_screen);
  }
  // import current slide pictures
  screen = destination_screen;
  screen.onEnter(screen_width, screen_height);
}

function windowResized() {
  all_html_sprites.forEach(sprite => sprite.adjust());
}

