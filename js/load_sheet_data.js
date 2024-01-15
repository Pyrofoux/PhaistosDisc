async function fetchSheetCSV(sheet_name = "")
{
    var google_sheet_id = "1y1cXqdAg-k8oPtNJ-OyCZql3d34yrv5ROTxWBWLO77M"; // id of the google sheet. needs to be public reading
    var sheet_url = `https://docs.google.com/spreadsheets/d/${google_sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;
    const response = await fetch(sheet_url);
    const csv_data = await response.text();
    return csv_data;
}

const sheet_names = ["Conversation 0","Conversation A","Conversation B","Conversation C", "Example"]; 
let sheets = {};
let big_sheet = [];
async function loadAllSheets()
{
    // collact all sheets
    for(var i in sheet_names)
    {
        var sheet_name = sheet_names[i];
        var csv_string  = await fetchSheetCSV(sheet_name);
        var sheet = Papa.parse(csv_string, {header:true}).data; //uses papaparse.min.js from github.com/mholt/PapaParse
        sheets[sheet_name] = sheet;
        // merge all sheets into a single one
        big_sheet = big_sheet.concat(sheet);
    }
}

// Todo later: load local .csv files, using Paparse's download config