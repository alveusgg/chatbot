//---------- Config -----------------------------------------------
const devPrefix = process.env.NODE_ENV == 'development' ? `$` : '!';
const commandPrefix = devPrefix;

const twitchChannelList = process.env.NODE_ENV == 'development' ? ["spacevoyage"] : ["spacevoyage", "alveussanctuary", "alveusgg"];

const alveusTwitchID = 636587384;
const pauseNotify = true;
const pauseGameChange = true;
const pauseTwitchMarker = true;
const pauseCloudSceneChange = false;
const announceChatSceneChange = false;
//UTC TIME
const notifyHours = { start: 14, end: 23 };
const globalMusicSource = "Music Playlist Global";
const ptzPrefix = "ptz";

const userRanks = {
    mods: Symbol("mods"),
    vips: Symbol("vips"),
    subs: Symbol("subs"),
    all: Symbol("all"),
}

let userPermissions = {
    commandPriority: ["commandAdmins", "commandSuperUsers", "commandMods", "commandOperator", "commandVips", "commandUsers"],
    commandAdmins: ["spacevoyage", "maya", "theconnorobrien", "alveussanctuary"],
    commandSuperUsers: ["ellaandalex", "dionysus1911", "dannydv", "maxzillajr", "illjx", "kayla_alveus", "alex_b_patrick",
        "lindsay_alveus", "strickknine", "tarantulizer", "spiderdaynightlive", "srutiloops", "evantomology", "amanda2815"],
    commandMods: [userRanks.mods],
    commandOperator: ["stolenarmy_", "berlac", "dansza", "merger3", "nitelitedf", "fixterjake14",
        "purplemartinconservation", "wazix11", "lazygoosepxls", "alxiszzz", "shutupleonard", "taizun", "lumberaxe1", "glennvde",
        "wolfone_", "dohregard", "lakel1", "darkrow_", "minipurrl", "gnomechildboi", "danman149", "hunnybeehelen", "strangecyan",
        "viphippo", "bagel_deficient", "rhinofriend"],
    commandVips: [userRanks.vips, "tfries_", "sivvii_", "ghandii_", "axialmars",
        "jazz_peru", "stealfydoge", "xano218", "experimentalcyborg", "klav___", "monkarooo", "nixxform", "madcharliekelly",
        "josh_raiden", "jateu", "storesE6", "rebecca_h9", "matthewde", "user_11_11", "huniebeexd", "kurtyykins",
        "breacherman", "bryceisrightjr", "sumaxu", "mariemellie", "ewok_626", "quokka64", "nov1cegg",
        "casualruffian", "likethecheesebri", "otsargh", "just_some_donkus", "fiveacross",
        "itszalndrin", "nicoleeverleigh", "fishymeep", "ponchobee"],
    commandUsers: [userRanks.subs]
}

let userBlacklist = ["RestreamBot"];

//OBS Scene Commands
const commandPermissionsScenes = {
    commandAdmins: ["testadminscene"],
    commandSuperUsers: ["testsuperscene", "backpackcam", "localbackpackcam", "serverpccam", "localpccam", "servernuthousecam", "phonecam"],
    commandMods: ["testmodscene", "alveusserver", "brbscreen", "ellaintro", "kaylaintro", "connorintro", "intro", "poboxintro", "aqintro",
        "accintro", "accbrb", "accending", "ccintro", "ccbrb", "ccending", "sntintro", "sntbrb", "sntending", "nickintro", "nickbrb", "nickending"],
    commandOperator: [],
    commandVips: [],
    commandUsers: []
}

//Customcam scene names
const commandPermissionsCustomCam = {
    commandAdmins: [],
    commandSuperUsers: ["nuthousecam", "localpccam", "backpackcam", "phonecam"],
    commandMods: ["wolfcam", "wolfcam2", "wolfcam3", "wolfcam4", "wolfcam5", "wolfcam6", "wolfcam7", "wolfcam8", "wolfcam9", "wolfcam10", "parrotcam", "pasturecam",
        "crowcam", "crowcam2", "crowcam3", "crowcam4", "foxcam", "foxcam2", "foxcam3", "foxcam4", "4camoutdoor", "marmosetcam", "marmosetcam2", "marmosetcam3",
        "nightcams", "nightcamsbig", "chickencam"],
    commandOperator: ["constructioncam"],
    commandVips: ["georgiecam", "noodlecam", "patchycam", "toastcam", "puppycam", "hankcam", "hankcam2", "hankcam3", "roachcam", "isopodcam",
        "noodlehidecam", "georgiewatercam", "georgiemulticam", "indoorcams", "indoorcamsbig", "chincam", "ratcam", "ratcam2", "ratcam3", "ratcam4", "orangeisopodcam"],
    commandUsers: []
}

//Mic permissions
const commandPermissionsMic = {
    commandAdmins: [],
    commandSuperUsers: ["backpackmic","chatchatmic","localpcmic","chickenmic","foxmic","nuthousemic","pcmic","phonemic","phonedirectmic"],
    commandMods: ["crowmic","marmosetmic","parrotmic","pasturemic","wolfmic","wolfden2mic","wolfindoormic"],
    commandOperator: [],
    commandVips: ["music"],
    commandUsers: []
}

//PTZ Commands
const commandPermissionsCamera = {
    commandAdmins: ["testadmincamera"],
    commandSuperUsers: ["testsupercamera", "ptzcontrol", "ptzoverride", "ptzclear"],
    commandMods: ["testmodcamera", "ptztracking", "ptzirlight", "ptzwake"],
    commandOperator: ["ptzhomeold", "ptzseta", "ptzgetinfo", "ptzset", "ptzpan", "ptztilt", "ptzmove", "ptzir", "ptzdry",
        "ptzfov", "ptzstop", "ptzsave", "ptzremove", "ptzrename", "ptzcenter", "ptzareazoom", "ptzclick", "ptzdraw",
        "ptzspeed", "ptzgetspeed", "ptzspin", "ptzcfocus"],
    commandVips: ["ptzhome", "ptzpreset", "ptzzoom", "ptzzoomr", "ptzload", "ptzlist", "ptzroam", "ptzroaminfo", "ptzfocus", "ptzgetfocus", "ptzfocusr", "ptzautofocus", "ptzgetcam"],
    commandUsers: []
}

//Extra Commands
const commandPermissionsExtra = {
    commandAdmins: ["testadminextra"],
    commandSuperUsers: ["testsuperextra", "resetcloudsource", "resetcloudsourcef", "setalveusscene", "setcloudscene", "changeserver", "setmute", "camclear"],
    commandMods: ["testmodextra", "resetsource", "resetsourcef", "camload", "camlist", "camsave", "camrename", "campresetremove", "customcams", "customcamsbig", "customcamstl", "customcamstr", "customcamsbl", "customcamsbr",
        "unmutecam", "unmuteallcams", "nightcams", "nightcamsbig", "indoorcams", "addcam"],
    commandOperator: [],
    commandVips: ["getvolume", "setvolume", "resetvolume", "removecam", "swapcam", "scenecams", "mutecam", "muteallcams", "musicvolume", "musicnext", "musicprev", "mutemusic", "unmutemusic", "mutemusiclocal", "unmutemusiclocal", "resetbackpack", "resetpc", "resetlivecam", "resetbackpackf", "resetpcf", "resetlivecamf", "resetcam", "resetextra", "resetphone", "resetphonef"],
    commandUsers: []
}

//Unifi Commands
const commandPermissionsUnifi = {
    commandAdmins: [],
    commandSuperUsers: ["apclientinfo", "apclientreconnect"],
    commandMods: ["apsignal", "apreconnect"],
    commandOperator: [],
    commandVips: [],
    commandUsers: []
}

// //One Direction, If on OBS Scene, allow subscenes commands
// //scene names are lowercase, no spaces, no s/es
// let onewayCommands = {
//     "4camoutdoor": ["foxcam", "foxcam2", "foxcam3", "foxcam4", "pasturecam"]
// }

// const onewayNotifications = {
//     "4camoutdoor": ["foxes", "fox den", "fox multicam", "fox corner", "pasture"]
// }

// //Scene Names in OBS
// const notifyScenes = ["Parrots", "Parrots Muted Mic", "Crows", "Crows Outdoor", "Crows Muted Mic",
//     "Crows Multicam", "Nuthouse", "4 Cam Crows", "3 Cam Crows", "Pasture", "Foxes",
//     "Marmoset", "Marmoset Indoor", "Marmoset Multi",
//     "Fox Den", "Fox Corner", "Fox Multicam", "Fox Muted Mic", "4 Cam Outdoor"];

//ADD IP INFO IN ENV
const axisCameras = {
    "bb": ["orangeisopodcam"],
    "chicken": ["chickencam"],
    "chin": ["chincam"],
    "construction": ["constructioncam"],
    "crow": ["crowcam", "crowcam4"],
    "crowoutdoor": ["cowcam2", "crowcam3"],
    "fox": ["foxcam", "foxcam2"],
    "foxcorner": ["foxcam3"],
    "foxden": ["foxcam4"],
    "georgie": ["georgiecam", "georgiemulticam"],
    "georgiewater": ["georgiewatercam"],
    "hank": ["hankcam", "hankcam3"],
    "hankcorner": ["hankcam2"],
    "marmoset": ["marmosetcam", "marmosetcam3"],
    "marmosetindoor": ["marmosetcam2"],
    "marty": ["isopodcam"],
    "noodle": ["noodlecam"],
    "parrot": ["parrotcam"],
    "pasture": ["pasturecam"],
    "patchy": ["patchycam"],
    "puppy": ["puppycam"],
    "rat": ["ratcam", "ratcam2", "ratcam3", "ratcam4"],
    "roach": ["roachcam"],
    "toast": ["toastcam"],
    "wolf": ["wolfcam", "wolfcam6", "wolfcam7", "wolfcam8"],
    "wolfcorner": ["wolfcam2", "wolfcam9", "wolfcam10"],
    "wolfden2": ["wolfcam4"],
    "wolfden": ["wolfcam3"],
    "wolfindoor": ["wolfcam5"],
};

//Audio source in OBS
//lowercase, no spaces, no s/es, cleanName()
const audioSources = {
    "backpackmic": { source: "maya rtmp 1", defaultVolume: -7.6, scenes: ["backpack"] },
    "chatchatmic": { source: "chat chats audio", defaultVolume: -7.6, scenes: ["chatchat"] },
    "chickenmic": { source: "Chicken Camera", defaultVolume: -7.6, scenes: ["chickencam"] },
    "crowmic": { source: "crow mic", defaultVolume: -7.6, scenes: ["crowcam","crowcam2","crowcam3","crowcam4"] },
    "foxmic": { source: "fox mic", defaultVolume: -2.6, scenes: ["foxcam","foxcam2","foxcam3","foxcam4"] },
    "localpcmic": { source: "local rtmp desktop", defaultVolume: -7.6, scenes: ["localpccam"] },
    "marmosetmic": { source: "marmoset mic", defaultVolume: -7.6, scenes: ["marmosetcam","marmosetcam2","marmosetcam3"] },
    "music": { source: globalMusicSource, defaultVolume: -7.6, scenes: ["music"] },
    "nuthousemic": { source: "nuthouse local", defaultVolume: -7.6, scenes: ["nuthousecam"] },
    "parrotmic": { source: "Parrot Camera", defaultVolume: -7.6, scenes: ["parrotcam"] },
    "pasturemic": { source: "Pasture Camera", defaultVolume: -2.6, scenes: ["pasturecam"] },
    "pcmic": { source: "local rtmp desktop", defaultVolume: -7.6, scenes: ["pccam"] },
    "phonemic": { source: "alveus rtmp mobile", defaultVolume: -7.6, scenes: ["phonecam"] },
    "phonedirectmic": { source: "alveus rtmp mobile mic", defaultVolume: -7.6, scenes: ["phonemic"] },
    "wolfmic": { source: "wolf mic", defaultVolume: -7.6, scenes: ["wolfcam","wolfcam2","wolfcam3","wolfcam6","wolfcam7","wolfcam8","wolfcam10"] },
    "wolfden2mic": { source: "wolf den2 camera", defaultVolume: -7.6, scenes: ["wolfcam4","wolfcam9"] },
    "wolfindoormic": { source: "wolf camera indoor", defaultVolume: -7.6, scenes: ["wolfcam5"] },
}

//CCam Argument for Command Mapping. Converting base to source name
const customCamSources = {
    "3cam": "georgie noodle isopod",
    "4cam": "georgie noodle isopod roach",
    "4camoutdoor": "pasture parrot marmoset fox",
    "backpack": "backpack",
    "chickencam": "chicken",
    "chincam": "chin",
    "constructioncam": "construction",
    "connorpc": "connorpc",
    "crowcam2": "crowoutdoor",
    "crowcam3": "crowmulti",
    "crowcam4": "crowmulti2",
    "crowcam": "crow",
    "foxcam2": "foxmulti",
    "foxcam3": "foxcorner",
    "foxcam4": "foxden",
    "foxcam": "fox",
    "georgiecam": "georgie",
    "georgiemulticam": "georgiemulti",
    "georgiewatercam": "georgiewater",
    "hankcam2": "hankcorner",
    "hankcam3": "hankmulti",
    "hankcam": "hank",
    "indoorcams": "georgie hank puppy chin isopod roach",
    "indoorcamsbig": "georgie hank puppy chin isopod roach",
    "isopodcam": "isopod",
    "localpccam": "pc",
    "marmosetcam2": "marmosetindoor",
    "marmosetcam3": "marmosetmulti",
    "marmosetcam": "marmoset",
    "nightcams": "wolf pasture parrot fox crow marmoset",
    "nightcamsbig": "wolf pasture parrot fox crow marmoset",
    "noodlecam": "noodle",
    "noodlehidecam": "noodlehide",
    "nuthousecam": "nuthouse",
    "orangeisopodcam": "orangeisopod",
    "parrotcam": "parrot",
    "pasturecam": "pasture",
    "patchycam": "patchy",
    "pccam": "pc",
    "phonecam": "phone",
    "puppycam": "puppy",
    "ratcam2": "rat2",
    "ratcam3": "rat3",
    "ratcam4": "ratmulti",
    "ratcam": "rat",
    "ratcamall": "rat rat2 rat3",
    "roachcam": "roaches",
    "serverpccam": "pc",
    "toastcam": "toast",
    "wolfcam2": "wolfcorner",
    "wolfcam3": "wolfden",
    "wolfcam4": "wolfden2",
    "wolfcam5": "wolfindoor",
    "wolfcam6": "wolfmulti",
    "wolfcam7": "wolfmulti2",
    "wolfcam8": "wolfmulti3",
    "wolfcam9": "wolfmulti4",
    "wolfcam10": "wolfmulti5",
    "wolfcam": "wolf",
}

//OBS Scene Names
let obsSources = {
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    accintro: "ACCIntro",
    aqintro: "AQIntro",
    backpackcam: "Backpack Server", //Cloud server
    brbscreen: "BRB", //Cloud server
    ccbrb: "CCBRB",
    ccending: "CCEnding",
    ccintro: "CCIntro",
    connorintro: "ConnorIntro",
    ellaintro: "EllaIntro",
    intro: "INTRO",
    kaylaintro: "KaylaIntro",
    localbackpackcam: "Backpack",
    localpccam: "Alveus PC",
    nickbrb: "NickBRB",
    nickending: "NickEnding",
    nickintro: "NickIntro",
    phonecam: "Phone Server", //Cloud server
    poboxintro: "POBoxIntro",
    servernuthousecam: "fullcam nuthouse",
    serverpccam: "Alveus PC Server",//"Alveus PC Server", //Cloud server
    sntbrb: "SNTBRB",
    sntending: "SNTEnding",
    sntintro: "SNTIntro",
}
//OBS Cloud Scene Names
let obsCloudSources = {
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    accintro: "ACCIntro",
    aqintro: "AQIntro",
    backpackcam: "Maya LiveU",
    brbscreen: "BRB",
    ccbrb: "CCBRB",
    ccending: "CCEnding",
    ccintro: "CCIntro",
    connorintro: "ConnorIntro",
    ellaintro: "EllaIntro",
    intro: "Intro",
    kaylaintro: "KaylaIntro",
    localbackpackcam: "Alveus Server",
    localpccam: "Alveus Server",
    nickbrb: "NickBRB",
    nickending: "NickEnding",
    nickintro: "NickIntro",
    phonecam: "Phone",
    poboxintro: "POBoxIntro",
    servernuthousecam: "Alveus Nuthouse",
    serverpccam: "Alveus PC",
    sntbrb: "SNTBRB",
    sntending: "SNTEnding",
    sntintro: "SNTIntro",
}

//Allow Swapping between same group
const camGrouping = {
    crowbase: ["crowcam", "crowcam2", "crowcam3", "crowcam4"],
    foxbase: ["foxcam", "foxcam2", "foxcam3", "foxcam4"],
    wolfbase: ["wolfcam", "wolfcam2", "wolfcam3", "wolfcam4", "wolfcam5", "wolfcam6", "wolfcam7", "wolfcam8", "wolfcam9", "wolfcam10"],
    marmosetbase: ["marmosetcam", "marmosetcam2", "marmosetcam3"],
}

//Cams and Mics to use for commands that change multiple at once
const accessGrouping = {
    outdoorcam: ["pasturecam","parrotcam",...camGrouping[crow],...camGrouping[wolf],...camGrouping[marmoset],...camGrouping[fox]],
    admincam: ["backpack","chatchat","localpccam","nuthousecam","pccam","phonecam","phonemic"],
    modmic: ["pasturecam","parrotcam",...camGrouping[crow],...camGrouping[wolf],...camGrouping[marmoset]],
    adminmic: ["backpack","chatchat","localpccam","nuthousecam","pccam","phonecam","phonemic",...camGrouping[fox]],
}

const commandSceneAlias = {
    "4camoutdoor": ["4camoutdoors", "multioutdoor"],
    accbrb: ["acbrb"],
    accending: ["acending", "accend", "acend"],
    accintro: ["acintro"],
    ccbrb: ["cbrb"],
    ccending: ["cending", "ccend", "cend"],
    ccintro: ["cintro"],
    chatchat: ["bugmic", "chatchatmic"],
    chincam: ["chinchillacam", "chinscam", "chincam", "snorkcam", "moomincam", "fluffycam"],
    connorintro: ["penis"],
    connorpc: ["connordesktop"],
    constructioncam: ["timelapsecam"],
    crowcam2: ["crowcamoutdoor", "crowcamoutdoors", "crowoutdoorcam", "crowoutcam"],
    crowcam3: ["crowcammulti", "crowmulticam", "crowoutcrowinmulticam", "crowoutcrowincam", "crowoutcrowcam", "crowcrowincam"],
    crowcam4: ["crowcammulti2", "crowmulti2cam", "crowincrowoutmulticam", "crowincrowoutcam", "crowcrowoutcam", "crowincrowcam"],
    crowcam: ["crowcamindoor", "crowindoorcam", "crowincam", "crowinsidecam"],
    foxcam2: ["foxmulticam", "foxcammulti", "foxfoxcornercam", "foxfoxcornermulticam"],
    foxcam3: ["foxwideangle", "foxcornercam"],
    foxcam4: ["foxdencam", "foxcamden"],
    foxcam: ["foxcam", "foxescam"],
    georgiecam: ["georgcam"],
    georgiewatercam: ["georgieunderwatercam"],
    hankcam2: ["mrmctraincam2 ", "choochoocam2", "hankthetankchoochoomrmctraincam3", "hanknightcam", "hankcornercam"],
    hankcam3: ["mrmctraincam3 ", "choochoocam3", "hankthetankchoochoomrmctraincam3", "hankmulticam"],
    hankcam: ["mrmctraincam ", "choochoocam", "hankthetankchoochoomrmctraincam"],
    indoorcams: ["4cams", "indoorcam", "insidecams", "insidecam"],
    indoorcamsbig: ["indoorcambig", "insidecamsbig", "insidecambig"],
    isopodcam: ["isopodscam", "martycam", "martyisopodcam"],
    localpccam: ["desktopcam", "pclocalcam", "pccamlocal", "alveuspccam"],
    marmosetcam2: ["marmosetindoorcam", "marmosetsindoorcam", "marmsindoorcam", "marminsidecam", "marmsincam", "marmindoorcam", "marmincam"],
    marmosetcam3: ["marmosetmulticam", "marmosetsmulticam", "marmsmulticam", "marmmulticam", "marmoutmarmincam", "marmmarmincam", "marmoutmarmcam", "marmoutmarminmulticam", "marmosetoutmarmosetinmulticam"],
    marmosetcam: ["marmosetoutdoorcam", "marmosetscam", "marmcam", "marmscam", "marmsoutdoorcam", "marmsoutcam", "marmoutdoorcam", "marmoutcam"],
    nickending: ["nickend"],
    nightcams: ["nightcam", "outdoorcams", "outdoorcam", "outsidecam", "outsidecams", "livecams", "livecam"],
    nightcamsbig: ["nightcambig", "outdoorcamsbig", "outdoorcambig", "outsidecambig", "outsidecamsbig", "nightcamb", "nightcams2", "ncb"],
    nuthousecam: ["nutcam"],
    orangeisopodcam: ["bbcam", "bbisopodcam", "sisopodcam", "isopodorangecam", "oisopodcam", "spanishisopodcam", "isopod2cam", "isopodcam2"],
    phonecam: ["alveusphonecam", "winniecam", "goatcam"],
    phonemic: ["phoneaudio", "mobilemic"],
    puppycam: ["scorpioncam"],
    ratcam2: ["ratmiddlecam", "rat2cam", "ratmcam"],
    ratcam3: ["ratbottomcam", "rat3cam", "ratbcam"],
    ratcam4: ["ratmulticam", "rat4cam"],
    ratcam: ["ratcam1", "rattopcam", "rat1cam", "nillacam", "chipscam", "chipcam", "rattcam"],
    ratcamall: ["ratallcam", "ratstackcam"],
    roachcam: ["roachescam", "barbaracam"],
    servernuthousecam: ["servernutcam", "remotenutcam", "remotenuthousecam"],
    serverpccam: ["pccam", "pcservercam", "remotepccam", "serverpccam"],
    sntbrb: ["showbrb", "tellbrb", "showntellbrb", "showandtellbrb"],
    sntending: ["showending", "tellending", "showntellending", "showandtellending", "sntend"],
    sntintro: ["showintro", "tellintro", "showntellintro", "showandtellintro"],
    wolfcam2: ["wolvescornercam", "wolfcornercam", "wolfsidecam", "wolfdeckcam", "wolf2cam"],
    wolfcam3: ["wolvesdencam", "wolfdencam", "wolfponddencam"],
    wolfcam4: ["wolvesden2cam", "wolfden2cam", "wolfdeckdencam"],
    wolfcam5: ["wolvesindoorcam", "wolfindoorcam", "wolfinsidecam", "wolfincam", "wolficam", "wolfcamindoor", "wolfcamin", "wolfcaminside"],
    wolfcam6: ["wolvesmulticam", "wolfmulticam", "wolfoutmulticam", "wolfwolfcornermulticam"],
    wolfcam7: ["wolfindoormulticam", "wolfinmulticam", "wolfinsidemulticam", "wolfwolfinmulticam", "wolfwolfincam"],
    wolfcam8: ["wolfdenmulticam", "wolfwolfdenmulticam", "wolfwolfdencam"],
    wolfcam9: ["wolfden2multicam", "wolfwolfden2multicam", "wolfwolfden2cam"],
    wolfcam10: ["wolfcornermulticam", "wolfcornerwolfincam", "wolfcornerwolfinmulticam", "wolfcwolfincam", "wolfcwolficam"],
    wolfcam: ["wolvescam", "timbercam", "awacam", "wolfocam", "wolfoutcam", "wolfoutdoorcam", "wolfoutsidecam", "wolfcamout", "wolfcamoutdoor"],
}

const commandControlAlias = {
    ptzfocus: ["ptzsetfocus"],
    ptzfocusr: ["ptzsetfocusr"],
    ptzdry: ["ptzshake", "ptzhecrazy"],
    "resetlivecam": ["resetlivecams", "restartlivecam", "restartlivecams"],
    "resetlivecamf": ["resetlivecamsf", "restartlivecamf", "restartlivecamsf"],
    "resetbackpack": ["resetbackpackcam", "restartbackpack", "restartbackpackcam"],
    "resetbackpackf": ["resetbackpackcamf", "restartbackpackf", "restartbackpackcamf"],
    "resetextra": ["resetextracam"],
    "resetphone": ["resetphonecam"],
    "resetphonef": ["resetphonecamf"],
    customcams: ["cc", "ccams", "ccam", "customcam"],
    customcamsbig: ["ccb", "ccamsb", "ccamb", "customcambig", "customcamb", "customcamsb"],
    customcamstl: ["piptl", "customcamtl", "customcamtopleft", "pipul"],
    customcamstr: ["piptr", "customcamtr", "customcamtopright", "pipur"],
    customcamsbl: ["pipbl", "customcambl", "customcambottomleft", "pipll"],
    customcamsbr: ["pipbr", "customcambr", "customcambottomright", "piplr"],
    camsave: ["camssave", "savelayout", "layoutsave", "savecam"],
    camload: ["camsload", "loadcam", "loadcams", "loadlayout", "loadpreset"],
    campresetremove: ["campresetremove", "removecampreset", "removelayout", "removepreset"],
    camrename: ["camsrename", "renamecam", "renamecams"],
    camlist: ["camslist", "listcam", "listcams", "listlayout", "listlayouts", "layouts"],
    setvolume: ["volumeset", "camvolume", "micvolume"],
    getvolume: ["volumeinfo", "volumeget", "getvolumes", "volume"],
    resetvolume: ["volumereset", "camvolumereset", "micvolumereset", "resetvolumes", "resetmic", "resetmics"],
    unmutecam: ["unmute", "unmutemic"],
    unmuteallcams: ["unmuteall", "unmutecamsall", "unmutecamall", "unmuteallmic"],
    mutecam: ["mute", "mutemic"],
    muteallcams: ["muteall", "mutecamsall", "mutecamall", "muteallmic"],
    mutemusic: ["musicoff", "musicmute"],
    unmutemusic: ["musicon", "musicunmute"],
    mutemusiclocal: ["mutemusicl", "musicoffl"],
    unmutemusiclocal: ["unmutemusicl", "musicunmutel"],
    musicvolume: ["setmusicvolume", "changemusicvolume"],
    musicnext: ["nextmusic", "nextsong", "musicforward"],
    musicprev: ["prevmusic", "prevsong", "previousmusic", "previoussong", "lastsong", "musicback"],
    removecam: ["removecams", "remove", "hidecam", "hide"],
    addcam: ["addcams", "add", "showcam", "show"],
    swapcam: ["movecam", "swapcams", "movecams", "swap"],
    setalveusscene: ["setscene", "changescene", "changealveusscene"],
    setcloudscene: ["changecloudscene"],
    apsignal: ["apinfo", "liveu", "liveusignal", "liveuinfo", "liveustatus", "signal", "wifi"],
    apreconnect: ["apreset", "liveureset", "liveureconnect", "resetliveu", "reconnectliveu"],
    ptzgetfocus: ["getfocus"],
}

//-----------------------------------------------------------
//convert all usernames to lowercase
for (const permission of userPermissions.commandPriority) {
    userPermissions[permission].forEach(user => {
        if (typeof user === "symbol") return;
        user = user.toLowerCase().trim();
    });
}
//convert all usernames to lowercase
userBlacklist.forEach(user => {
    user = user.toLowerCase().trim();
});

//base : [aliases]
const commandAliases = combineAliasCommands();
//base : camera
const commandCameras = getBaseToSource(axisCameras);
//base : mic
const commandMics = getBaseToMic(audioSources);
//base : [groups]
const camGroups = getBaseToSourceList(camGrouping);
//base : [groups]
const accessGroups = getBaseToSourceList(accessGrouping);

//create database
const commandDB = createDB();



function createDB() {
    const commandPermissions = {};
    const baseCommands = {};
    //combine all permission level commands
    for (const permission of userPermissions.commandPriority) {
        let scenes = commandPermissionsScenes[permission] || [];
        let customCam = commandPermissionsCustomCam[permission] || [];
        let camera = commandPermissionsCamera[permission] || [];
        let extra = commandPermissionsExtra[permission] || [];
        let unifi = commandPermissionsUnifi[permission] || [];
        let mic = commandPermissionsMic[permission] || [];
        commandPermissions[permission] = [].concat(scenes, customCam, camera, extra, unifi,mic);

        //create a map of every base command
        for (const base of commandPermissions[permission]) {
            baseCommands[base] = {
                permissionLevel: permission,
                users: userPermissions[permission],
                aliases: commandAliases[base],
                camera: commandCameras[base],
                audio: {name:commandMics[base], ...audioSources[commandMics[base]]},
                camGroups: camGroups[base],
                accessGroups: accessGroups[base],
                customSource: customCamSources[base],
                obsScene: obsSources[base],
                obsCloudScene: obsCloudSources[base]
            };
        }
        
        // //add aliases
        // let newAliases = [];
        // for (const base of commandPermissions[permission]){
        //     let aliasArray = commandAliases[base];
        //     newAliases = newAliases.concat[aliasArray];
        // }
        // commandPermissions[permission] = commandPermissions[permission].concat(newAliases);
        // //remove duplicates
        // commandPermissions[permission].filter( (item, index) =>
        //     commandPermissions[permission].indexOf(item) == index
        // )
    }

    return baseCommands;
}

function combineAliasCommands() {
    const commandAlias = { ...commandControlAlias, ...commandSceneAlias };

    for (const parentCommand in commandAlias) {
        commandAlias[parentCommand].push(parentCommand);
    }
    return commandAlias;
}

function getBaseToSource(map) {
    let invertedMap = {};
    for (const source in map) {
        for (const base of map[source]) {
            invertedMap[base] = source;
        }
    }
    return invertedMap;
}

function getBaseToSourceList(map) {
    let invertedMap = {};
    for (const source in map) {
        for (const base of map[source]) {
            invertedMap[base] = invertedMap[base] || [];
            invertedMap[base].push(source);
        }
    }
    return invertedMap;
}

function getBaseToMic(map) {
    let invertedMap = {};
    for (const source in map) {
        let basenames = map[source]?.scenes || [];
        for (const base of basenames) {
            invertedMap[base] = source;
        }
    }
    return invertedMap;
}


//aliases : base
const commandToBase = invertMap(commandAlias);

//combine all permission maps together
//create Full Command Array
const commandList = getCommandList(commandPermissions, commandAlias);

//base+aliases : source
obsSources = addAliasesMap(obsSources);
//base+aliases : source
obsCloudSources = addAliasesMap(obsCloudSources);
//base : [aliases]
multiCommands = addArrayAliases(multiCommands);
//base : [aliases]
onewayCommands = addArrayAliases(onewayCommands);

//create list of all aliases:basecommand

//aliases : base
const multiCustomCamScenesConverted = invertMap(multiCustomCamScenes);

//aliases : base
const customCommandAlias = setupCustomCamAlias(commandSceneAlias);
const customSceneCommands = getCommandList(commandPermissionsCustomCam, commandSceneAlias);





function getCommandList(commandObj, aliasObj) {
    //add Alias commands to user permissions
    for (const parentCommand in aliasObj) {
        //check Alias names
        for (const permission in commandObj) {
            //find matching permission location
            if (commandObj[permission].includes(parentCommand)) {
                //add all alias's 
                for (const alias of aliasObj[parentCommand]) {
                    commandObj[permission].push(alias);
                }
            }
        }
    }
    //get full list of all possible commands
    let list = getListOfCommands(commandObj);
    return list
}



function getListOfCommands(commandObj) {
    const list = [];
    //get full list of all possible commands
    for (const permission in commandObj) {
        for (const command of commandObj[permission]) {
            let c = command || ""
            c = c.toLowerCase();
            if (c != "" && !list.includes(c.toLowerCase())) {
                list.push(c.toLowerCase());
            }
        }
    }
    return list;
}

function addAliasesMap(sceneMap) {
    //add alias commands to obsSources
    for (const parentCommand in commandAlias) {
        //get scene for parent command
        const scene = sceneMap[parentCommand];
        //scene command, not extra
        if (scene != null) {
            //add each alias
            for (const alias of commandAlias[parentCommand]) {
                sceneMap[alias] = scene;
            }
        }
    }
    return sceneMap;
}

function addArrayAliases(commandList) {
    for (const baseCommand in commandList) {
        for (const mainCommand of commandList[baseCommand]) {
            //get every command from Multicommand
            const aliasList = commandAlias[mainCommand];
            if (aliasList != null) {
                //check if alias commands for the maincommand
                for (let i = 0; i < aliasList.length; i++) {
                    const alias = aliasList[i];
                    //add all to multicommand list
                    if (!commandList[baseCommand].includes(alias)) {
                        commandList[baseCommand].push(alias);
                    }
                }
            }
        }
    }
    return commandList;
}

function invertMap(aliasList) {
    const convertedList = {};
    for (const baseCommand in aliasList) {
        for (const aliasCommand of aliasList[baseCommand]) {
            convertedList[aliasCommand] = baseCommand;
        }
    }
    return convertedList;
}

function setupCustomCamAlias(aliasList) {
    const convertedList = {};
    for (const baseCommand in aliasList) {

        let newBaseCommand = baseCommand.toLowerCase();
        newBaseCommand = newBaseCommand.replaceAll(/e?s(\s|\W|$|multi(?:cam)?|cam|outdoor|indoor|inside|wideangle|corner|den)/g, "$1");
        newBaseCommand = newBaseCommand.replaceAll(/(?:full)?cams?/g, "");
        // newBaseCommand = newBaseCommand.replaceAll(" ", "");

        let convertedBaseCommand = customCamSources[baseCommand] || baseCommand;

        let newConvertedBaseCommand = convertedBaseCommand.toLowerCase();
        newConvertedBaseCommand = newConvertedBaseCommand.replaceAll(/e?s(\s|\W|$|multi(?:cam)?|cam|outdoor|indoor|inside|wideangle|corner|den)/g, "$1");
        newConvertedBaseCommand = newConvertedBaseCommand.replaceAll(/(?:full)?cams?/g, "");


        convertedList[newBaseCommand] = newConvertedBaseCommand;

        for (const aliasCommand of aliasList[baseCommand]) {
            let newAliasCommand = aliasCommand.toLowerCase();
            newAliasCommand = newAliasCommand.replaceAll(/e?s(\s|\W|$|multi(?:cam)?|cam|outdoor|indoor|inside|wideangle|corner|den)/g, "$1");
            newAliasCommand = newAliasCommand.replaceAll(/(?:full)?cams?/g, "");
            newAliasCommand = newAliasCommand.replaceAll(" ", "");
            if (!isNaN(parseInt(newAliasCommand))) {
                newAliasCommand = newAliasCommand + "cam";
            }
            convertedList[newAliasCommand] = newConvertedBaseCommand;
        }
    }
    return convertedList;
}

const scenePositions = {
    "1box": {
        1: { //fullscreen
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 1080,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1920
        }
    },
    "2box": {
        1: { //middle left
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 0,
            positionY: 270,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        2: { //middle right
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 960,
            positionY: 270,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        }
    },
    "2boxbig": {
        1: { //big
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 720,
            positionX: 640,
            positionY: 180,
            rotation: 0,
            scaleX: 0.66666,
            scaleY: 0.66666,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1280
        },
        2: { //middle left
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 360,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "2boxtl": {
        1: { //fullscreen
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 1080,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1920
        },
        2: { //topleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "2boxtr": {
        1: { //fullscreen
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 1080,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1920
        },
        2: { //topright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 1280,
            positionY: 0,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "2boxbl": {
        1: { //fullscreen
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 1080,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1920
        },
        2: { //topright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "2boxbr": {
        1: { //fullscreen
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 1080,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1920
        },
        2: { //bottomright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 1280,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "3box": {
        1: { //topcenter
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 480,
            positionY: 0,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        2: { //bottomleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 0,
            positionY: 540,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        3: { //bottomright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 960,
            positionY: 540,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        }
    },
    "3boxbig": {
        1: { //big
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 720,
            positionX: 640,
            positionY: 180,
            rotation: 0,
            scaleX: 0.66666,
            scaleY: 0.66666,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1280
        },
        2: { //topleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 180,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        3: { //bottomleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 540,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "4box": {
        1: { //topleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        2: { //topright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 960,
            positionY: 0,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        3: { //bottomleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 0,
            positionY: 540,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        },
        4: { //bottomright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 540,
            positionX: 960,
            positionY: 540,
            rotation: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 960
        }
    },
    "4boxbig": {
        1: { //big
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 720,
            positionX: 640,
            positionY: 180,
            rotation: 0,
            scaleX: 0.66666,
            scaleY: 0.66666,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1280
        },
        2: { //topleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        3: { //middleleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 360,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        4: { //bottomleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
    "6boxbig": {
        1: { //big top right
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 720,
            positionX: 640,
            positionY: 0,
            rotation: 0,
            scaleX: 0.66666,
            scaleY: 0.66666,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 1280
        },
        2: { //topleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        3: { //middleleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 360,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        4: { //bottomleft
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 0,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        5: { //bottomcenter
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 640,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        },
        6: { //bottomright
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
            cropTop: 0,
            height: 360,
            positionX: 1280,
            positionY: 720,
            rotation: 0,
            scaleX: 0.3333333,
            scaleY: 0.3333333,
            sourceHeight: 1080,
            sourceWidth: 1920,
            width: 640
        }
    },
}

module.exports = {
    commandPrefix,
    ptzPrefix,
    userRanks,
    userPermissions,
    commandPermissions,
    commandAlias,
    obsSources,
    obsCloudSources,
    commandList,
    customSceneCommands,
    notifyScenes,
    multiScenes,
    multiCommands,
    axisCameras,
    onewayCommands,
    onewayNotifications,
    audioSources,
    scenePositions,
    globalMusicSource,
    commandAliasConverted,
    multiCustomCamScenes,
    multiCustomCamScenesConverted,
    twitchChannelList,
    pauseGameChange,
    pauseNotify,
    pauseTwitchMarker,
    announceChatSceneChange,
    alveusTwitchID,
    customCamSources,
    customCommandAlias,
    micGroups,
    userBlacklist,
    axisCameraCommandMapping,
    pauseCloudSceneChange,
    notifyHours
};
