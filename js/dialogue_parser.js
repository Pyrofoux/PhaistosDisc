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
  console.log("will read index", current_index, sheet[current_index]);

  let processLine = async (index) => {
    var line = sheet[index];
    
    if(!line) return false;

    switch(line["Dialogue Type"])
    {

        case "SCENE_START":
        break;

        case "SKIP":
        processLine(index+1);
        break;

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
          choice.variables = line["Variables"].split(",").map(s => s.trim());
          choice.values = line["Values"].split(",").map(s => s.trim());
          return choice;
        }
        var selected = await textbox.choice(parseChoice(line1), parseChoice(line2));
        processChoice(selected);
        processLine(index+2);
      break;
    
    case "TELEPORT":
        var scene_name = line["Dialogue"];
        playScene(scene_name)
    break;

    case "TELEPORT_IF_TRUE":
        var scene_name = line["Dialogue"];
        var variable_to_check = line["Variables"];
        console.log("TELEPORT_IF_TRUE", variable_to_check, current_variables[variable_to_check])
        if(variable_to_check in current_variables &&  current_variables[variable_to_check].toUpperCase().trim() == "TRUE")
        {
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

    }
  }

  await processLine(current_index);

}

let current_variables = {};
function processChoice(choice)
{
    for(var i = 0; i < choice.variables.length;i++)
    {
        var var_name = choice.variables[i];
        var var_value = choice.values[i] ?? null;

        if(var_value[0] == "+") // incrementation instead of set 
        {
          var increment = parseInt(var_value.slice(1));
          if(!current_variables[var_name])current_variables[var_name] = 0;
          current_variables[var_name] = parseInt(current_variables[var_name]) + increment;
        }
        else // set value
        {
          current_variables[var_name] = var_value;
        }
    }

    if(screen.onChoice)screen.onChoice(choice);
}