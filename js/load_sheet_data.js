async function fetchOnlineCSVSheet(sheet_name = "")
{
    var google_sheet_id = "1y1cXqdAg-k8oPtNJ-OyCZql3d34yrv5ROTxWBWLO77M"; // id of the google sheet. needs to be public reading
    var sheet_url = `https://docs.google.com/spreadsheets/d/${google_sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;
    const response = await fetch(sheet_url);
    const csv_data = await response.text();
    return csv_data;
}

const useOnlineSheet = true; // load online (Google Drive) or local sheet
const local_xlxs_filename = "Phaistos Discussion (live).xlsx";
const sheet_names = ["Conversation 0","Minoan Mind Palace","Workshop","Conversation 1","Conversation 2","Conversation 3", "Example","IndieMash"]; 
let sheets = {};
let big_sheet = [];
let all_scenes = [];

async function loadAllSheets()
{

    let local_sheets = {};
    if(!useOnlineSheet)
    {
        var parsed_file = XLSX.read(await (await fetch(`./${local_xlxs_filename}`)).arrayBuffer());
        local_sheets = parsed_file.Sheets;
    }
    console.log(local_sheets);
    // collect all sheets
    for(var i in sheet_names)
    {
        var sheet_name = sheet_names[i];
        var csv_string  = useOnlineSheet ? await fetchOnlineCSVSheet(sheet_name) : XLSX.utils.sheet_to_csv(local_sheets[sheet_name]);
        var pure_sheet = Papa.parse(csv_string).data; //uses papaparse.min.js from github.com/mholt/PapaParse
        
        var sheet = [];
        // Uses row 0 as headers. the config option {headers:true} of paparse is bugged. consider changing csv parsing lib
        if(pure_sheet.length > 0)
        {
        for(var i = 1; i < pure_sheet.length; i++)
        {
            var line = {};
            pure_sheet[0].forEach((column_name, index) =>{
                if(column_name)
                {
                    line[column_name] = pure_sheet[i][index];
                }
            });
            sheet.push(line);
        }
        }

        sheets[sheet_name] = sheet;
        // merge all sheets into a single one
        big_sheet = big_sheet.concat(sheet);
    }

    all_scenes = gatherScenes(big_sheet);
}

function gatherScenes(sheet)
{
    var scenes = {};
    for(var index = 0; index < sheet.length; index++)
    {
        var line = sheet[index];
        if(line["Dialogue Type"] == "SCENE_START")
        {
            scenes[line["Dialogue"]] = index;
        }
    }
    return scenes;
}

// Todo later: load local .csv files, using Paparse's download config