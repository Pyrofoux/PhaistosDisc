
const COLORS = {
    SCREEN_BG:"#212121",
    DEFAULT_TEXT_COLOR:"#827158",
    DEFAULT_TEXT_BGCOLOR:"#FEFBE5",
    DESIGNER_TEXT_COLOR: "#7444A7",
    ARCHEO_TEXT_COLOR: "#AA7534",
    STAMP_BG:"#F6DB44",
    STAMP_CONTOUR:"#FFDB3D",
    STAMP_SYMBOL:"#341802",
    COLOR_CLAY:"#C7866A",
    STAMP_ON_DISC:"#212121",
}

// built manually using coordToSymbols() and clicking on the canvas
const color2cell = {

    "A":
    {
    "0-0-0-0":-1,
    "254-0-0-134":0,
    "254-68-0-134":1,
    "254-178-0-134":2,
    "226-254-0-134":3,
    "171-254-0-134":4,
    "114-254-0-134":5,
    "64-254-0-134":6,
    "1-254-110-134":7,
    "1-254-131-134":8,
    "1-254-165-134":9,
    "1-254-222-134":10,
    "1-254-254-134":11,
    "0-182-254-134":12,
    "0-110-254-134":13,
    "0-72-254-134":14,
    "0-0-254-134":15,
    "47-0-254-134":16,
    "119-0-254-134":17,
    "152-0-254-134":18,
    "209-0-254-134":19,
    "243-0-254-134":20,
    "254-0-213-134":21,
    "254-0-140-134":22,
    "254-0-102-134":23,
    "254-0-68-134":24,
    "192-0-0-134":25,
    "127-0-192-134":26,
    "0-0-192-134":27,
    "0-163-192-134":28,
    "0-192-45-134":29,
    "114-192-0-134":30,
    }
};

const symbols_list = [
    "PEDESTRIAN",
    "PLUMED_HEAD",
    "TATTOOED_HEAD",
    "CAPTIVE",
    //"CHILD",
    "WOMAN",
    "HELMET",
    "GAUNTLET",
    //"TIARA",
    "ARROW",
    "BOW",
    "SHIELD",
    "CLUB",
    "MANACLES",
    //"MATTOCK",
    //"SAW",
    "LID",
    "BOOMERANG",
    "CARPENTRY_PLANE",
    //"DOLIUM",
    "COMB",
    //"SLING",
    "COLUMN",
    "BEEHIVE",
    "SHIP",
    "HORN",
    "HIDE",
    "2_HIDE",
    "BULLS_LEG",
    "CAT",
    "2_CAT",
    //"RAM",
    "EAGLE",
    "DOVE",
    "TUNNY",
    "BEE",
    "PLANE_TREE",
    //"VINE",
    "PAPYRUS",
    "ROSETTE",
    "LILY",
    "OX_BACK",
    "FLUTE",
    //"GRATER",
    //"STRAINER",
    "SMALL_AXE",
    "WAVY_BAND"
]

const symbol2color = {
    "PEDESTRIAN":"254-0-0-116",
    "PLUMED_HEAD":"0-149-254-92",
    "TATTOOED_HEAD":"0-183-171-140",
    "CAPTIVE":"39-147-142-104",
    //"CHILD":"0-0-0-0",
    "WOMAN":"191-149-254-152",
    "HELMET":"254-0-220-140",
    "GAUNTLET":"147-115-39-104",
    //"TIARA":"0-0-0-0",
    "ARROW":"136-187-0-140",
    "BOW":"152-254-0-140",
    "SHIELD":"3-255-255-69",
    "CLUB":"213-0-254-140",
    "MANACLES":"74-178-187-140",
    //"MATTOCK":"0-0-0-0",
    //"SAW":"0-0-0-0",
    "LID":"255-127-237-146",
    "BOOMERANG":"2-254-144-113",
    "CARPENTRY_PLANE":"254-218-0-104",
    //"DOLIUM":"0-0-0-0",
    "COMB":"0-182-16-140",
    //"SLING":"0-0-0-0",
    "COLUMN":"0-40-254-95",
    "BEEHIVE":"171-0-254-92",
    "SHIP":"254-34-0-140",
    "HORN":"183-255-0-89",
    "HIDE":"147-0-0-104",
    "2_HIDE":"147-0-0-208",
    "BULLS_LEG":"100-0-187-140",
    "CAT":"0-38-254-92",
    "2_CAT":"0-38-254-193",
    //"RAM":"0-0-0-0",
    "EAGLE":"78-255-0-78",
    "DOVE":"73-0-255-101",
    "TUNNY":"39-147-95-104",
    "BEE":"39-110-147-104",
    "PLANE_TREE":"254-107-0-119",
    //"VINE":"0-0-0-0",
    "PAPYRUS":"110-120-120-104",
    "ROSETTE":"163-187-74-140",
    "LILY":"63-254-0-140",
    "OX_BACK":"127-0-111-128",
    "FLUTE":"254-0-110-131",
    //"GRATER":"0-0-0-0",
    //"STRAINER":"0-0-0-0",
    "SMALL_AXE":"112-147-39-104",
    "WAVY_BAND":"44-147-39-104",
}

const color2symbol = {
    "254-0-0-116": "PEDESTRIAN",
    "0-149-254-92": "PLUMED_HEAD",
    "0-183-171-140": "TATTOOED_HEAD",
    "39-147-142-104": "CAPTIVE",
    "191-149-254-152": "WOMAN",
    "254-0-220-140": "HELMET",
    "147-115-39-104": "GAUNTLET",
    "136-187-0-140": "ARROW",
    "152-254-0-140": "BOW",
    "3-255-255-69": "SHIELD",
    "213-0-254-140": "CLUB",
    "74-178-187-140": "MANACLES",
    "255-127-237-146": "LID",
    "2-254-144-113": "BOOMERANG",
    "254-218-0-104": "CARPENTRY_PLANE",
    "0-182-16-140": "COMB",
    "0-40-254-95": "COLUMN",
    "171-0-254-92": "BEEHIVE",
    "254-34-0-140": "SHIP",
    "183-255-0-89": "HORN",
    "147-0-0-104": "HIDE",
    "147-0-0-208": "2_HIDE",
    "100-0-187-140": "BULLS_LEG",
    "0-38-254-92": "CAT",
    "0-38-254-193": "2_CAT",
    "78-255-0-78": "EAGLE",
    "73-0-255-101": "DOVE",
    "39-147-95-104": "TUNNY",
    "39-110-147-104": "BEE",
    "254-107-0-119": "PLANE_TREE",
    "110-120-120-104": "PAPYRUS",
    "163-187-74-140": "ROSETTE",
    "63-254-0-140": "LILY",
    "127-0-111-128": "OX_BACK",
    "254-0-110-131": "FLUTE",
    "112-147-39-104": "SMALL_AXE",
    "44-147-39-104": "WAVY_BAND"
  }

const cell2symbol= [
[{"x":1204,"y":1791,"symbol":"PLUMED_HEAD"},
{"x":1087,"y":1806,"symbol":"SHIELD"},
{"x":1018,"y":1818,"symbol":"CLUB"},
{"x":920,"y":1776,"symbol":"PEDESTRIAN"},
{"x":842,"y":1785,"symbol":"BOOMERANG"}],

[{"x":635,"y":1710,"symbol":"BEEHIVE"},
{"x":518,"y":1653,"symbol":"OX_BACK"},
{"x":434,"y":1569,"symbol":"SHIELD"}],

[{"x":332,"y":1494,"symbol":"CAT"},
{"x":272,"y":1410,"symbol":"WAVY_BAND"},
{"x":227,"y":1350,"symbol":"HELMET"}],

[{"x":182,"y":1251,"symbol":"CAT"},
{"x":209,"y":1170,"symbol":"2_CAT"},
{"x":164,"y":1119,"symbol":"BEE"}],

[{"x":95,"y":1047,"symbol":"PLUMED_HEAD"},
{"x":134,"y":966,"symbol":"SHIELD"},
{"x":170,"y":882,"symbol":"CAPTIVE"},
{"x":152,"y":804,"symbol":"OX_BACK"},
{"x":155,"y":720,"symbol":"TUNNY"}],

[{"x":200,"y":597,"symbol":"HIDE"},
{"x":257,"y":498,"symbol":"WAVY_BAND"},
{"x":296,"y":432,"symbol":"HELMET"},
{"x":350,"y":351,"symbol":"SHIELD"}],

[{"x":473,"y":273,"symbol":"HIDE"},
{"x":566,"y":228,"symbol":"SMALL_AXE"},
{"x":659,"y":174,"symbol":"GAUNTLET"}],

[{"x":791,"y":147,"symbol":"PLUMED_HEAD"},
{"x":929,"y":141,"symbol":"SHIELD"},
{"x":1036,"y":132,"symbol":"WOMAN"},
{"x":1105,"y":162,"symbol":"BOOMERANG"}],

[{"x":1369,"y":276,"symbol":"EAGLE"},
{"x":1465,"y":336,"symbol":"HORN"},
{"x":1492,"y":390,"symbol":"PLANE_TREE"}],

[{"x":1576,"y":486,"symbol":"PLUMED_HEAD"},
{"x":1645,"y":576,"symbol":"SHIELD"},
{"x":1675,"y":663,"symbol":"FLUTE"},
{"x":1735,"y":732,"symbol":"CARPENTRY_PLANE"},
{"x":1726,"y":813,"symbol":"PLANE_TREE"}],

[{"x":1735,"y":960,"symbol":"PEDESTRIAN"},
{"x":1744,"y":1032,"symbol":"FLUTE"},
{"x":1750,"y":1098,"symbol":"OX_BACK"},
{"x":1741,"y":1182,"symbol":"HELMET"}],

[{"x":1669,"y":1317,"symbol":"PLUMED_HEAD"},
{"x":1639,"y":1416,"symbol":"SHIELD"},
{"x":1573,"y":1494,"symbol":"DOVE"},
{"x":1528,"y":1581,"symbol":"COLUMN"},
{"x":1465,"y":1650,"symbol":"ROSETTE"}],

[{"x":1351,"y":1608,"symbol":"LILY"},
{"x":1285,"y":1644,"symbol":"BOW"}],

[{"x":1159,"y":1590,"symbol":"PLUMED_HEAD"},
{"x":1036,"y":1605,"symbol":"HIDE"},
{"x":958,"y":1599,"symbol":"SHIP"},
{"x":830,"y":1572,"symbol":"ARROW"},
{"x":770,"y":1554,"symbol":"COLUMN"},
{"x":725,"y":1536,"symbol":"BOOMERANG"}],

[{"x":620,"y":1467,"symbol":"BULLS_LEG"},
{"x":536,"y":1401,"symbol":"PEDESTRIAN"}],

[{"x":449,"y":1296,"symbol":"PLUMED_HEAD"},
{"x":395,"y":1179,"symbol":"SHIELD"},
{"x":395,"y":1071,"symbol":"EAGLE"},
{"x":368,"y":972,"symbol":"HORN"}],

[{"x":383,"y":891,"symbol":"PLUMED_HEAD"},
{"x":395,"y":783,"symbol":"SHIELD"},
{"x":425,"y":684,"symbol":"HIDE"},
{"x":482,"y":588,"symbol":"2_HIDE"},
{"x":551,"y":519,"symbol":"PLANE_TREE"},
{"x":581,"y":444,"symbol":"PAPYRUS"},
{"x":653,"y":423,"symbol":"COMB"}],

[{"x":776,"y":369,"symbol":"TUNNY"},
{"x":848,"y":363,"symbol":"COLUMN"}],

[{"x":955,"y":354,"symbol":"PLUMED_HEAD"},
{"x":1060,"y":390,"symbol":"SHIELD"},
{"x":1171,"y":423,"symbol":"EAGLE"},
{"x":1285,"y":477,"symbol":"HORN"}],

[{"x":1375,"y":558,"symbol":"PLUMED_HEAD"},
{"x":1435,"y":645,"symbol":"HIDE"},
{"x":1495,"y":729,"symbol":"SHIP"},
{"x":1513,"y":861,"symbol":"ARROW"},
{"x":1537,"y":924,"symbol":"COLUMN"},
{"x":1537,"y":984,"symbol":"BOOMERANG"}],

[{"x":1519,"y":1104,"symbol":"BULLS_LEG"},
{"x":1465,"y":1191,"symbol":"PEDESTRIAN"}],

[{"x":1450,"y":1323,"symbol":"PLUMED_HEAD"},
{"x":1354,"y":1374,"symbol":"SHIELD"},
{"x":1210,"y":1395,"symbol":"EAGLE"},
{"x":1117,"y":1389,"symbol":"HORN"}],

[{"x":1003,"y":1398,"symbol":"PLUMED_HEAD"},
{"x":902,"y":1380,"symbol":"SHIELD"},
{"x":788,"y":1347,"symbol":"HIDE"},
{"x":716,"y":1281,"symbol":"MANACLES"},
{"x":656,"y":1194,"symbol":"DOVE"},
{"x":635,"y":1140,"symbol":"BOOMERANG"},
{"x":581,"y":1020,"symbol":"2_HIDE"}],

[{"x":581,"y":864,"symbol":"WOMAN"},
{"x":629,"y":780,"symbol":"BOOMERANG"},
{"x":668,"y":717,"symbol":"LID"},
{"x":692,"y":636,"symbol":"CARPENTRY_PLANE"}],

[{"x":848,"y":573,"symbol":"EAGLE"},
{"x":949,"y":594,"symbol":"HORN"},
{"x":1021,"y":606,"symbol":"SHIELD"}],

[{"x":1153,"y":648,"symbol":"PLUMED_HEAD"},
{"x":1237,"y":696,"symbol":"SHIELD"},
{"x":1285,"y":768,"symbol":"CLUB"},
{"x":1315,"y":864,"symbol":"PEDESTRIAN"}],

[{"x":1336,"y":981,"symbol":"COLUMN"},
{"x":1333,"y":1080,"symbol":"CARPENTRY_PLANE"},
{"x":1258,"y":1152,"symbol":"PLANE_TREE"}],

[{"x":1168,"y":1173,"symbol":"ARROW"},
{"x":1084,"y":1185,"symbol":"TATTOOED_HEAD"},
{"x":985,"y":1203,"symbol":"ROSETTE"}],

[{"x":848,"y":1152,"symbol":"PLUMED_HEAD"},
{"x":908,"y":1050,"symbol":"SHIELD"},
{"x":779,"y":1032,"symbol":"HIDE"},
{"x":785,"y":924,"symbol":"2_HIDE"},
{"x":812,"y":837,"symbol":"PLANE_TREE"},
{"x":857,"y":771,"symbol":"PAPYRUS"},
{"x":964,"y":789,"symbol":"COMB"}],

[{"x":1060,"y":813,"symbol":"CLUB"},
{"x":1123,"y":876,"symbol":"PEDESTRIAN"}],

[{"x":1150,"y":960,"symbol":"ARROW"},
{"x":1102,"y":1050,"symbol":"TATTOOED_HEAD"},
{"x":994,"y":975,"symbol":"ROSETTE"}],
];

const cell_centers = [
{"cell":0,"x":1028,"y":1811},
{"cell":1,"x":542,"y":1652},
{"cell":2,"x":278,"y":1430},
{"cell":3,"x":176,"y":1182},
{"cell":4,"x":140,"y":870},
{"cell":5,"x":266,"y":462},
{"cell":6,"x":548,"y":213},
{"cell":7,"x":1025,"y":132},
{"cell":8,"x":1448,"y":309},
{"cell":9,"x":1688,"y":633},
{"cell":10,"x":1757,"y":1058},
{"cell":11,"x":1598,"y":1469},
{"cell":12,"x":1340,"y":1652},
{"cell":13,"x":944,"y":1592},
{"cell":14,"x":563,"y":1442},
{"cell":15,"x":401,"y":1181},
{"cell":16,"x":470,"y":624},
{"cell":17,"x":812,"y":354},
{"cell":18,"x":1133,"y":405},
{"cell":19,"x":1445,"y":750},
{"cell":20,"x":1499,"y":1164},
{"cell":21,"x":1298,"y":1362},
{"cell":22,"x":821,"y":1164},
{"cell":23,"x":635,"y":738},
{"cell":24,"x":932,"y":579},
{"cell":25,"x":1307,"y":723},
{"cell":26,"x":1322,"y":1095},
{"cell":27,"x":1097,"y":1200},
{"cell":28,"x":872,"y":966},
{"cell":29,"x":1127,"y":834},
{"cell":30,"x":1091,"y":996}
]