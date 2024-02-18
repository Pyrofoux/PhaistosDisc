let current_variables = {};
let current_slide_picture = null;


async function playScene(scene_name)
{
  var sheet = big_sheet;
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
  console.log("will read index", current_index, sheet[current_index]);

  let processLine = async (index) => {
    var line = sheet[index];
    
    if(!line) return false;


    if(line["Image"]) // display Image
    {
      // make sure image exists and that it's not already displayed
      if(spr.slides[line["Image"]] && current_slide_picture != line["Image"])
      {
        await screen.slideToPicture(spr.slides[line["Image"]]);
      }
    }

    switch(line["Dialogue Type"])
    {

        case "SCENE_START":
        break;

        case "SKIP":
        processLine(index+1);
        break;

        case "IF_EQUAL":
        case "IF_NOT_EQUAL":
          var is_opposite = line["Dialogue Type"] == "IF_NOT_EQUAL"
          var variable_to_check = line["Variables"];
          var value_to_check = line["Values"];
          var test = current_variables[variable_to_check] == value_to_check;
          console.log("CHECK",variable_to_check,current_variables[variable_to_check],test)
          if((!test && !is_opposite) || (test && is_opposite))
          {
            processLine(index+1);
            break;
          }
          // falls through to regular dialogue if test works
        default: // Dialogue text

          //variable assignement
          if(["IF_EQUAL","IF_NOT_EQUAL"].indexOf(line["Dialogue Type"]) == -1)
          {
            processVariableAssignement(line["Variables"],line["Values"]);
          }
          
            var character = line["Character"];
            var styles = {
            "Plumed Head": "ARCHEO",
            "Plumed": "ARCHEO",
            "Tattoo":"DESIGNER",
            };

            var text = line["Dialogue"].trim();
            console.log("TEXT",text)
            if(text != "") // empty row => skip it
            {
            await textbox.dialogue(text, styles[character]);
            }
            processLine(index+1);
        break;

      case "CHANGE_SCREEN":
        var screen_name = line["Dialogue"].trim().toLowerCase();
        if(screens[screen_name])
        {
          console.log("CHANGE_SCREEN", screen_name)
          changeScreen(screens[screen_name]);
        }
        else
        {
          console.log("CHANGE_SCREEN", screen_name, "not found");
        }
        processLine(index+1);
      break;

      case "SCREEN_ACTION":
        var action_name = line["Dialogue"].trim();
        var value_name = line["Values"].trim();
        if(screen[action_name])
        {
          console.log("SCREEN_ACTION", action_name, value_name ?? "")
          screen[action_name](value_name);
        }
        else
        {
          console.log("CHANGE_SCREEN", action_name, "not found");
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
          choice.variables = line["Variables"];
          choice.values = line["Values"];
          return choice;
        }
        var choice1 = parseChoice(line1), choice2 = parseChoice(line2);
        console.log("choices", choice1.text, choice2.text);
        var selected = await textbox.choice(choice1, choice2);
        processChoice(selected);
        processLine(index+2);
      break;
    
    case "TELEPORT":
        var scene_name = line["Dialogue"];
        console.log('TELEPORT',scene_name);
        playScene(scene_name)
    break;

    

    case "TELEPORT_IF_TRUE":
        var scene_name = line["Dialogue"];
        var variable_to_check = line["Variables"];
        console.log("TELEPORT_IF_TRUE", variable_to_check, current_variables[variable_to_check])
        var test = variable_to_check in current_variables &&  current_variables[variable_to_check].toUpperCase().trim() == "TRUE";
        if(test)
        {
            console.log('teleport',scene_name);
            playScene(scene_name);
        }
        else
        {
            processLine(index+1);
        }
    break;

    case "TELEPORT_IF_EQUAL":
        var scene_name = line["Dialogue"];
        var variable_to_check = line["Variables"];
        var value_to_check = line["Values"];
        if(current_variables[variable_to_check] == value_to_check)
        {
            playScene(scene_name);
        }
        else
        {
            processLine(index+1);
        }
    break;

    case "TELEPORT_IF_EQUAL_OR_GREATER_THAN_2":
      var scene_name = line["Dialogue"];
      var variable_to_check = line["Variables"];
      if(current_variables[variable_to_check] >= 2)
      {
        playScene(scene_name);
      }
      else
      {
        processLine(index+1);
      }
    break;

    case "TELEPORT_IF_LESS_THAN_2":
      var scene_name = line["Dialogue"];
      var variable_to_check = line["Variables"];
      if(current_variables[variable_to_check] < 2)
      {
        playScene(scene_name);
      }
      else
      {
        processLine(index+1);
      }
    break;

    case "ANIMATION": // play an animation before reading next line
      var animation_name = line["Dialogue"].trim();
      var value_name = line["Values"].trim();
      switch(animation_name)
      {
        case "BURNT_DISC":
          await screen.playDiscAnimation("burnt");
          processLine(index+1);
        break;

        case "FIRED_DISC":
          await screen.playDiscAnimation("fired");
          processLine(index+1);
        break;

        case "UNLOCK_STAMP":
          await screen.playUnlockStampAnimation(screens.workshop, value_name);
          processLine(index+1)
        break;

        case "UNLOCK_STAMP_OUT":
          await screen.playUnlockStampAnimationOut(screens.workshop, value_name);
          processLine(index+1)
        break;
      }
    break;

    }
  }

  await processLine(current_index);

}


function processChoice(choice)
{
    processVariableAssignement(choice.variables, choice.values);
    if(screen.onChoice)screen.onChoice(choice);
}

function processVariableAssignement(variables_cell, values_cell)
{
  let variables = variables_cell.split(",").map(s => s.trim());
  let values = values_cell.split(",").map(s => s.trim());
  for(var i = 0; i < variables.length;i++)
    {
      var var_name = variables[i];
      var var_value = values[i] ?? null;
      if(var_value[0] == "+") // incrementation instead of set 
      {
        var increment = parseInt(var_value.slice(1));
        if(!current_variables[var_name])current_variables[var_name] = 0;
        current_variables[var_name] = parseInt(current_variables[var_name]) + increment;
        console.log("SET", var_name, current_variables[var_name]);
      }
      else if(var_name != "") // set value
      {
        current_variables[var_name] = var_value;
        console.log("SET", var_name, current_variables[var_name]);
      }
    }
}