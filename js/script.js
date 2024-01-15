
let disc_imgs = [];
let pixels = [];
let palettes = {}
let disc_scaling = 5;

let main_cvs, disc_cvs, textbox;
let info, hidden;


const img_names = ["A_disc", "A_cells", "A_symbols"];
const A_width = 1883;
const A_height = 1929

let pixel_density;
let screen;
let screen_width, screen_height;
let aspect_ratio = "800:700", textbox_height = 20;

let sounds = {}, spr = {};

async function preload()
{
  img_names.forEach(name => disc_imgs[name] = loadImage(`img/${name}.png`));
  sounds.letter = loadSound("audio/letter.mp3");
  sounds.blip_m = loadSound("audio/blip_m.wav");
  sounds.blip_f = loadSound("audio/blip_f.wav");

  Object.values(sounds).forEach(sound => sound.setVolume(0.5));

  spr.symbols = {};
  spr.symbols["PLUMED_HEAD"]   = loadImage("img/PLUMED_HEAD.svg");
  spr.symbols["TATTOOED_HEAD"] = loadImage("img/TATTOOED_HEAD.svg");

  console.log(sheets);
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

  // loading disc images pixels
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
  });

  // Other HTML elements
  info = createDiv('== INFO ==');
  info.position(10, 10);

  hidden = createDiv().id("hidden");
  hidden.elt.style.display = "none";

  // create textbox
  textbox = new Textbox(textbox_height);

  // create screens
  screens = 
  {
    "demo":new DemoScreen("demo"),
    "convo":new ConvoScreen("convo"),
  }

  changeScreen(screens.convo);

  // https://eev.ee/blog/2016/10/20/word-wrapping-dialogue/
  //await textbox.write("Hello! Let's see what happens if we make it realistic, you know?");

  await loadAllSheets();
  playScene("OPENING_DISCUSSION")
  //playScene("DEBUG_SCENE")
}

function draw()
{
  screen.draw();
}

function mouseClicked()
{
  var x = Math.floor(mouseX),
  y = Math.floor(mouseY);
  screen.onClick(x,y);
}

function mouseMoved() // have to be detected another way
{
  var x = Math.floor(mouseX),
  y = Math.floor(mouseY);
  screen.onMouseMove(x,y);
}

function changeScreen(destination_screen)
{
  if(screen) screen.onLeave();
  screen = destination_screen;
  screen.onEnter();
}

function windowResized() {
  all_html_sprites.forEach(sprite => sprite.adjust());
}



async function playScene(scene_name)
{
  //var sheet = sheets["Conversation 0"];
  var sheet = big_sheet;
  console.log(sheet)
  var current_index = 0;
  for(var i = 0; i < sheet.length; i++)
  {
    var line = sheet[i];
    if(line["Dialogue Type"] == "SCENE_START" && line["Dialogue"] == scene_name)
    {
      current_index = i; // found starting index of the scene
      break;
    }
  }

  current_index++; // read line under scene declaration

  let processLine = async (index) => {
    var line = sheet[index];

    switch(line["Dialogue Type"])
    {
      default: // Dialogue text
        var character = line["Character"];
        var styles = {
          "Plumed Head": "ARCHEO",
          "Plumed": "ARCHEO",
          "Tattoo":"DESIGNER",
        };

        var text = line["Dialogue"].trim();
        console.log("text",text)
        if(text != "") // empty row => skip it
        {
          await textbox.dialogue(text, styles[character]);
        }
        processLine(index+1);
      break;

      case "CHOICE_A":
      case "CHOICE_B":
        var line1 = line, line2 = sheet[index+1]; // might cause error if it doesn't exist

        var parseChoice = (line) =>
        {
          var choice = {};
          choice.html = line["Dialogue"];
          choice.speaker = line["Character"];
          //choice.variables 
          return choice;
        }
        await textbox.choice(parseChoice(line1), parseChoice(line2));
      break;

    }
  }

  await processLine(current_index, sheet);

}

