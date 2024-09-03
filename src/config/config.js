//---------- Config -----------------------------------------------
const devPrefix = process.env.NODE_ENV == 'development' ? `$` : '!';
const commandPrefix = devPrefix;

const twitchChannelList = ["spacevoyage", "alveussanctuary", "alveusgg"];

const alveusTwitchID = 636587384;
const pauseNotify = true;
const pauseGameChange = true;
const pauseTwitchMarker = true;
const pauseCloudSceneChange = false;
const announceChatSceneChange = false;
//UTC TIME
const notifyHours = {start:14,end:23};
const restrictedHours = {start:14,end:23};
const globalMusicSource = "Music Playlist Global";

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
                        "lindsay_alveus", "strickknine","tarantulizer","spiderdaynightlive","srutiloops","evantomology","amanda2815"],
    commandMods: [userRanks.mods],
    commandOperator: ["96allskills", "stolenarmy_", "berlac", "dansza", "loganrx_", "merger3", "nitelitedf", 
                    "purplemartinconservation","wazix11","lazygoosepxls","alxiszzz","shutupleonard","taizun","lumberaxe1","glennvde",
                    "wolfone_", "dohregard", "lakel1","darkrow_","minipurrl","gnomechildboi","danman149","hunnybeehelen"],
    commandVips: [userRanks.vips, "tfries_", "sivvii_", "ghandii_", "axialmars",
        "jazz_peru", "stealfydoge", "xano218", "experimentalcyborg", "klav___", "monkarooo","nixxform","madcharliekelly",
        "josh_raiden", "jateu", "storesE6", "rebecca_h9", "matthewde", "user_11_11", "huniebeexd","kurtyykins",
        "breacherman", "bryceisrightjr","sumaxu","mariemellie","ewok_626","quokka64",
        "casualruffian","likethecheesebri","viphippo","bagel_deficient","otsargh","just_some_donkus","fiveacross",
        "itszalndrin","nicoleeverleigh","fishymeep","ponchobee"],
    commandUsers: [userRanks.subs]
}

let userBlacklist = ["RestreamBot"];

//OBS Scene Commands
const commandPermissionsScenes = {
    commandAdmins: ["testadminscene"],
    commandSuperUsers: ["testsuperscene", "backpackcam", "localbackpackcam", "serverpccam", "localpccam", "servernuthousecam", "phonecam"],
    commandMods: ["testmodscene", "alveusserver", "brbscreen", "georgiecambackup", "noodlecambackup", "hankcambackup", "hankcam2backup", "roachcambackup", "isopodcambackup",
        "noodlegeorgiecambackup", "georgienoodlecambackup", "3cambackup", "4cambackup", "ellaintro", "kaylaintro", "connorintro","intro","poboxintro","aqintro","accintro","accbrb","accending",
        "noodlehidecambackup", "georgiewatercambackup", "parrotcambackup", "pasturecambackup", "crowcambackup", "crowcam2backup", "crowcam3backup",
        "foxcambackup", "foxcam2backup", "foxcam3backup", "foxcam4backup",
        "4camoutdoorbackup", "marmosetcambackup", "marmosetcam2backup", "marmosetcam3backup"],
    commandOperator: [],
    commandVips: [],
    commandUsers: []
}

let timeRestrictedCommands = ["parrotcam", "pasturecam", "crowcam", "crowcam2", "crowcam3","crowcam4", "foxcam", "foxcam2", "foxcam3", "foxcam4", "4camoutdoor",
    "marmosetcam", "marmosetcam2", "marmosetcam3",
    "parrotcambackup", "pasturecambackup", "crowcambackup", "crowcam2backup", "crowcam3backup",
    "foxcambackup", "foxcam2backup", "foxcam3backup", "foxcam4backup", "4camoutdoorbackup",
    "marmosetcambackup", "marmosetcam2backup", "marmosetcam3backup"];


let timeRestrictedScenes = ["parrot", "fox", "foxcorner", "foxmulti", "pasture", "crow", "crowmulti", "crowmulti2","crowoutdoor", "marmoset", "marmosetindoor", "marmosetmulti"];
let throttledCommands = [];

const throttleCommandLength = 30000;

//Customcam scene names
const commandPermissionsCustomCam = {
    commandAdmins: [],
    commandSuperUsers: ["nuthousecam", "localpccam", "backpackcam", "phonecam"],
    commandMods: ["wolfcam","wolfcam2","wolfcam3","wolfcam4","wolfcam5","wolfcam6","wolfcam7","wolfcam8","wolfcam9","wolfcam10","parrotcam", "pasturecam",
         "crowcam", "crowcam2", "crowcam3", "crowcam4", "foxcam", "foxcam2", "foxcam3", "foxcam4", "4camoutdoor", "marmosetcam", "marmosetcam2", "marmosetcam3",
        "nightcams", "nightcamsbig","chickencam"],
    commandOperator: ["constructioncam"],
    commandVips: ["georgiecam", "noodlecam", "puppycam", "hankcam", "hankcam2", "hankcam3", "hankmulti", "roachcam", "isopodcam",
        "noodlehidecam", "georgiewatercam", "georgiemulticam", "indoorcams", "indoorcamsbig", "chincam", "ratcam","ratcam2","ratcam3","ratcam4","orangeisopodcam"],
    commandUsers: []
}


//customcam lowercase, no spaces, no s/es
const multiCustomCamScenes = {
    wolf: ["wolf", "wolfcorner","wolfindoor","wolfden","wolfden2","wolfmulti","wolfmulti2","wolfmulti3","wolfmulti4","wolfmulti5"],
    fox: ["fox", "foxcorner", "foxmulti", "foxden", "foxmulti2", "foxmulti3"],
    crow: ["crow", "crowmulti", "crowoutdoor","crowmulti2"],
    marmoset: ["marmoset", "marmosetindoor", "marmosetmulti", "marmosetmulti"],
    // rat: ["rat","rat2","rat3","ratmulti"]
}

//One Direction, If on OBS Scene, allow subscenes commands
//scene names are lowercase, no spaces, no s/es
let onewayCommands = {
    "4camoutdoor": ["foxcam", "foxcam2", "foxcam3", "foxcam4", "pasturecam"]
}

//Chat Command Swapping
//key names are same as multiscenes
//links command to obs scene names
let multiCommands = {
    crow: ["crowcam", "crowcam2", "crowcam3","crowcam4"],
    fox: ["foxcam", "foxcam2", "foxcam3", "foxcam4"],
    wolf: ["wolfcam", "wolfcam2","wolfcam3","wolfcam4","wolfcam5","wolfcam6","wolfcam7","wolfcam8","wolfcam9","wolfcam10"],
    marmoset: ["marmosetcam", "marmosetcam2", "marmosetcam3"],
    // rat: ["ratcam","ratcam2","ratcam3","ratcam4","ratcamall"]
}

//Notification Swapping
//Scene Names in OBS
//lowercase, no spaces, no s/es
const multiScenes = {
    crow: ["crow", "crowoutdoor", "crowmulti2cam"],
    crowoutdoor: ["crowmulticam"],
    wolf: ["wolf", "wolfcorner","wolfindoor","wolfden","wolfden2","wolfmulti","wolfmulti2","wolfmulti3","wolfmulti4"],
    wolfcorner: ["wolfmulti5"],
    fox: ["fox", "foxden", "foxmulticam", "foxcorner"],
    marmoset: ["marmoset", "marmosetindoor", "marmosetmulti"],
    // rat: ["ratcam","ratcam2","ratcam3","ratcam4"]
}

const onewayNotifications = {
    "4camoutdoor": ["foxes", "fox den", "fox multicam", "fox corner", "pasture"]
}

//Scene Names in OBS
const notifyScenes = ["Parrots", "Parrots Muted Mic", "Crows", "Crows Outdoor", "Crows Muted Mic",
    "Crows Multicam", "Nuthouse", "4 Cam Crows", "3 Cam Crows", "Pasture", "Foxes",
    "Marmoset", "Marmoset Indoor", "Marmoset Multi",
    "Fox Den", "Fox Corner", "Fox Multicam", "Fox Muted Mic", "4 Cam Outdoor"];


//Audio source in OBS
//lowercase, no spaces, no s/es, cleanName()
const sceneAudioSource = {
    "music": globalMusicSource,
    "pasture": "Pasture Camera",
    "fox": "fox mic",
    "foxden": "fox mic",
    "foxcorner": "fox mic",
    "foxmulticam": "fox mic",
    "parrot": "Parrot Camera",
    "crow": "crow mic",
    "crowoutdoor": "crow mic",
    "crowindoor": "crow mic",
    "crowmulticam": "crow mic",
    "crowmulti2cam": "crow mic",
    "marm": "marmoset mic",
    "marmoset": "marmoset mic",
    "marmosetindoor": "marmoset mic",
    "marmosetoutdoor": "marmoset mic",
    "marmosetmulti": "marmoset mic",
    "nuthouse": "nuthouse local",
    "nut": "nuthouse local",
    "phone": "alveus rtmp mobile",
    "backpack": "maya rtmp 1",
    "pc": "local rtmp desktop",
    "wolf": "wolf mic",
    "wolfcorner": "wolf mic",
    "wolfindoor": "wolf camera indoor",
    "wolfden": "wolf den2 camera",
    "wolfden2": "wolf den2 camera",
    "wolfmulti": "wolf mic",
    "wolfmulti2": "wolf mic",
    "wolfmulti3": "wolf mic",
    "wolfmulti4": "wolf mic",
    "wolfmulti5": "wolf mic",
    "chatchat": "chat chats audio",
    "phonemic": "alveus rtmp mobile mic",
    "chicken": "Chicken Camera"
}
//used for unmute/mute all. match above phrasing
const micGroups = {
    livecams: {
        pasture: { name: sceneAudioSource.pasture, volume: -2.4 }, parrot: { name: sceneAudioSource.parrot, volume: -7.9 },
        crow: { name: sceneAudioSource.crow, volume: -7.6 }, marmoset: { name: sceneAudioSource.marm, volume: -7.6 },
        wolf: { name: sceneAudioSource.wolf, volume: -7.9 }, wolfden: { name: sceneAudioSource.wolfden2, volume: -7.9 },
        wolfindoor: { name: sceneAudioSource.wolfindoor, volume: -7.9 }
    },
    restrictedcams: {
        fox: { name: sceneAudioSource.fox, volume: -2.4 }
    },
    admincams: {
        phone: { name: sceneAudioSource.phone, volume: 0 },
        backpack: { name: sceneAudioSource.backpack, volume: 0 }, pc: { name: sceneAudioSource.pc, volume: 0 },
        nuthouse: { name: sceneAudioSource.nut, volume: 0 },
        chatchat: { name: sceneAudioSource.chatchat, volume: 0 },
        phonemic: { name: sceneAudioSource.phonemic, volume: 0 }
    }
}




//ADD IP INFO IN ENV
//Scene Names in OBS
//lowercase, no spaces, no s/es
const axisCameras = ["pasture", "parrot","wolf","wolfindoor","wolfcorner","wolfden2","wolfden","georgie", "georgiewater", "noodle", "roach", "crow", "crowoutdoor", "fox", "foxden",
    "foxcorner", "hank", "hankcorner", "marmoset", "marmosetindoor", "chin", "puppy", "marty", "bb","construction","chicken"];

//Axis Camera Mapping to Command. Converting base to source name
const axisCameraCommandMapping = {
    "pasture":"pasture",
    "parrot":"parrot", 
    "wolf":"wolf", 
    "wolfcam2":"wolfcorner", 
    "wolfcam3":"wolfden2", 
    "wolfcam4":"wolfden", 
    "wolfcam5":"wolfindoor", 
    "wolfcam6":"wolf",
    "wolfcam7":"wolf",
    "wolfcam8":"wolfcorner",
    "wolfcam9":"wolf",
    "wolfcam10":"wolfcorner",
    "georgie":"georgie", 
    "georgiewater":"georgiewater", 
    "noodle":"noodle", 
    "roach":"roach", 
    "crow":"crow", 
    "crowcam2":"crowoutdoor", 
    "crowcam3":"crowmulti", 
    "crowcam4":"crowmulti2", 
    "fox":"fox", 
    "foxcam4":"foxden",
    "foxcam3":"foxcorner", 
    "hank":"hank", 
    "hankcam2":"hankcorner", 
    "marmoset":"marmoset", 
    "marmosetcam2":"marmosetindoor", 
    "chin":"chin", 
    "puppy":"puppy", 
    "isopod":"marty", 
    "orangeisopod":"bb",
    "construction":"construction",
    "chickencam":"chicken"
    // "ratcam":"rat"
}

//Camera Commands
const ptzPrefix = "ptz";
const commandPermissionsCamera = {
    commandAdmins: ["testadmincamera"],
    commandSuperUsers: ["testsupercamera", "ptzcontrol", "ptzoverride", "ptzclear"],
    commandMods: ["testmodcamera", "ptztracking", "ptzirlight", "ptzwake"],
    commandOperator: ["ptzhomeold","ptzseta","ptzgetinfo","ptzset", "ptzpan", "ptztilt", "ptzmove", "ptzir", "ptzdry",
                     "ptzfov", "ptzstop", "ptzsave", "ptzremove", "ptzrename", "ptzcenter", "ptzareazoom", "ptzclick", "ptzdraw",
                     "ptzspeed", "ptzgetspeed", "ptzspin", "ptzcfocus"],
    commandVips: ["ptzhome", "ptzpreset", "ptzzoom","ptzzoomr", "ptzload", "ptzlist", "ptzroam", "ptzroaminfo", "ptzfocus", "ptzgetfocus", "ptzfocusr", "ptzautofocus", "ptzgetcam"],
    commandUsers: []
}
//timeRestrictedCommands = timeRestrictedCommands.concat(["ptzclear"]);
//throttledCommands = throttledCommands.concat([]);

//Extra Commands
const commandPermissionsExtra = {
    commandAdmins: ["testadminextra"],
    commandSuperUsers: ["testsuperextra", "resetcloudsource", "resetcloudsourcef", "setalveusscene", "setcloudscene", "changeserver", "setmute", "camclear"],
    commandMods: ["testmodextra", "resetsource","resetsourcef","camload", "camlist", "camsave", "camrename", "campresetremove", "customcams", "customcamsbig", "customcamstl", "customcamstr", "customcamsbl", "customcamsbr",
        "unmutecam", "unmuteallcams", "nightcams", "nightcamsbig", "indoorcams", "addcam"],
    commandOperator: [],
    commandVips: ["getvolume", "setvolume", "resetvolume", "removecam", "swapcam", "scenecams", "mutecam", "muteallcams", "musicvolume", "musicnext", "musicprev", "mutemusic", "unmutemusic", "mutemusiclocal", "unmutemusiclocal", "resetbackpack", "resetpc", "resetlivecam", "resetbackpackf", "resetpcf", "resetlivecamf", "resetcam", "resetextra","resetphone", "resetphonef"],
    commandUsers: []
}
timeRestrictedCommands = timeRestrictedCommands.concat(["unmutecam", "unmuteallcams"]);
throttledCommands = throttledCommands.concat(["swapcam", "mutemusic", "unmutemusic", "mutemusiclocal", "unmutemusiclocal", "resetbackpack", "resetpc", "resetlivecam", "resetbackpackf", "resetpcf", "resetlivecamf", "resetcam", "resetphone", "resetphonef","resetextra"]);

//Unifi
const commandPermissionsUnifi = {
    commandAdmins: [],
    commandSuperUsers: ["apclientinfo", "apclientreconnect"],
    commandMods: ["apsignal", "apreconnect"],
    commandOperator: [],
    commandVips: [],
    commandUsers: []
}

//CCam Argument for Command Mapping. Converting base to source name
const customCamCommandMapping = {
    "hankcam2": "hankcorner",
    "hankcam3": "hankmulti",
    "noodlehidecam": "noodlehide",
    "georgiewatercam": "georgiewater",
    "georgiemulticam": "georgiemulti",
    "crowcam": "crow",
    "crowcam2": "crowoutdoor",
    "crowcam3": "crowmulti",
    "crowcam4": "crowmulti2",
    "foxcam": "fox",
    "foxcam2": "foxmulti",
    "foxcam3": "foxcorner",
    "foxcam4": "foxden",
    "marmosetcam": "marmoset",
    "marmosetcam2": "marmosetindoor",
    "marmosetcam3": "marmosetmulti",
    "3cam": "georgie noodle isopod",
    "4cam": "georgie noodle isopod roach",
    "4camoutdoor": "pasture parrot marmoset fox",
    "nightcams": "wolf pasture parrot fox crow marmoset",
    "nightcamsbig": "wolf pasture parrot fox crow marmoset",
    "indoorcams": "georgie hank puppy chin isopod roach",
    "indoorcamsbig": "georgie hank puppy chin isopod roach",
    "chincam": "chin",
    "ratcam": "rat",
    "ratcam2": "rat2",
    "ratcam3": "rat3",
    "ratcam4": "ratmulti",
    "ratcamall": "rat rat2 rat3",
    "localpccam": "pc",
    "serverpccam": "pc",
    "orangeisopodcam": "orangeisopod",
    "roachcam":"roaches",
    "constructioncam":"construction",
    "wolfcam2":"wolfcorner", 
    "wolfcam3":"wolfden", 
    "wolfcam4":"wolfden2", 
    "wolfcam5":"wolfindoor", 
    "wolfcam6":"wolfmulti", 
    "wolfcam7":"wolfmulti2", 
    "wolfcam8":"wolfmulti3", 
    "wolfcam9":"wolfmulti4", 
    "wolfcam10":"wolfmulti5", 
}

const commandSceneAlias = {
    localpccam: ["desktopcam","pclocalcam","pccamlocal","alveuspccam"],
    serverpccam: ["pccam","pcservercam", "remotepccam","serverpccam"],
    phonecam: ["alveusphonecam", "winniecam", "goatcam"],
    puppycam: ["scorpioncam"],
    roachcam: ["roachescam","barbaracam"],
    hankcam: ["mrmctraincam ", "choochoocam", "hankthetankchoochoomrmctraincam"],
    hankcam2: ["mrmctraincam2 ", "choochoocam2", "hankthetankchoochoomrmctraincam3", "hanknightcam", "hankcornercam"],
    hankcam3: ["mrmctraincam3 ", "choochoocam3", "hankthetankchoochoomrmctraincam3", "hankmulticam"],
    isopodcam: ["isopodscam", "martycam", "martyisopodcam"],
    orangeisopodcam: ["bbcam", "bbisopodcam", "sisopodcam", "isopodorangecam", "oisopodcam", "spanishisopodcam", "isopod2cam", "isopodcam2"],
    georgiecam: ["georgcam"],
    georgiewatercam: ["georgieunderwatercam"],
    nuthousecambackup: ["nutcam"],
    servernuthousecam: ["servernutcam", "remotenutcam", "remotenuthousecam"],
    crowcam: ["crowcamindoor", "crowindoorcam","crowincam","crowinsidecam"],
    crowcam2: ["crowcamoutdoor", "crowcamoutdoors", "crowoutdoorcam","crowoutcam"],
    crowcam3: ["crowcammulti", "crowmulticam","crowoutcrowinmulticam","crowoutcrowincam","crowoutcrowcam","crowcrowincam"],
    crowcam4: ["crowcammulti2", "crowmulti2cam","crowincrowoutmulticam","crowincrowoutcam","crowcrowoutcam","crowincrowcam"],
    foxcam: ["foxcam", "foxescam"],
    foxcam2: ["foxmulticam", "foxcammulti","foxfoxcornercam","foxfoxcornermulticam"],
    foxcam3: ["foxwideangle", "foxcornercam"],
    foxcam4: ["foxdencam", "foxcamden"],
    marmosetcam: ["marmosetoutdoorcam", "marmosetscam", "marmcam", "marmscam", "marmsoutdoorcam", "marmsoutcam", "marmoutdoorcam", "marmoutcam"],
    marmosetcam2: ["marmosetindoorcam", "marmosetsindoorcam", "marmsindoorcam", "marminsidecam","marmsincam", "marmindoorcam", "marmincam"],
    marmosetcam3: ["marmosetmulticam", "marmosetsmulticam", "marmsmulticam", "marmmulticam","marmoutmarmincam","marmmarmincam",
                    "marmoutmarmcam","marmoutmarminmulticam","marmosetoutmarmosetinmulticam"],
    "4camoutdoor": ["4camoutdoors", "multioutdoor"],
    nightcams: ["nightcam", "outdoorcams", "outdoorcam", "outsidecam", "outsidecams", "livecams", "livecam"],
    nightcamsbig: ["nightcambig", "outdoorcamsbig", "outdoorcambig", "outsidecambig", "outsidecamsbig", "nightcamb", "nightcams2", "ncb"],
    indoorcams: ["4cams", "indoorcam", "insidecams", "insidecam"],
    indoorcamsbig: ["indoorcambig", "insidecamsbig", "insidecambig"],
    chincam: ["chinchillacam", "chinscam", "chincam", "snorkcam", "moomincam", "fluffycam"],
    ratcam: ["ratcam1","rattopcam", "rat1cam","nillacam","chipscam","chipcam","rattcam"],
    ratcam2: ["ratmiddlecam", "rat2cam","ratmcam"],
    ratcam3: ["ratbottomcam", "rat3cam","ratbcam"],
    ratcam4: ["ratmulticam", "rat4cam"],
    ratcamall: ["ratallcam", "ratstackcam"],
    connorpc: ["connordesktop"],
    constructioncam: ["timelapsecam"],
    connorintro: ["penis"],
    accintro: ["acintro"],
    accbrb: ["acbrb"],
    accending: ["acending","accend","acend"],
    chatchat: ["bugmic","chatchatmic"],
    phonemic: ["phoneaudio","phonemic","mobilemic"],
    wolfcam: ["wolvescam","timbercam","awacam","wolfocam","wolfoutcam","wolfoutdoorcam","wolfoutsidecam","wolfcamout","wolfcamoutdoor"],
    wolfcam2: ["wolvescornercam","wolfcornercam","wolfsidecam","wolfdeckcam","wolf2cam"],
    wolfcam3: ["wolvesdencam","wolfdencam","wolfponddencam"],
    wolfcam4: ["wolvesden2cam","wolfden2cam","wolfdeckdencam"],
    wolfcam5: ["wolvesindoorcam","wolfindoorcam","wolfinsidecam","wolfincam","wolficam","wolfcamindoor","wolfcamin","wolfcaminside"],
    wolfcam6: ["wolvesmulticam","wolfmulticam","wolfoutmulticam","wolfwolfcornermulticam"],
    wolfcam7: ["wolfindoormulticam","wolfinmulticam","wolfinsidemulticam","wolfwolfinmulticam","wolfwolfincam"],
    wolfcam8: ["wolfdenmulticam","wolfwolfdenmulticam","wolfwolfdencam"],
    wolfcam9: ["wolfden2multicam","wolfwolfden2multicam","wolfwolfden2cam"],
    wolfcam10: ["wolfcornermulticam","wolfcornerwolfincam","wolfcornerwolfinmulticam","wolfcwolfincam","wolfcwolficam"],
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
    getvolume: ["volumeinfo", "volumeget","getvolumes","volume"],
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

let commandScenes = {
    backpackcam: "Backpack Server", //Cloud server
    serverpccam: "Alveus PC Server",//"Alveus PC Server", //Cloud server
    phonecam: "Phone Server", //Cloud server
    servernuthousecam: "fullcam nuthouse",
    brbscreen: "BRB", //Cloud server
    ellaintro: "Ella Intro",
    kaylaintro: "Kayla Intro",
    connorintro: "Connor Intro",
    poboxintro: "POBox Intro",
    aqintro: "AQIntro",
    accintro: "ACCIntro",
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    intro: "INTRO",
    localbackpackcam: "Backpack",
    localpccam: "Alveus PC",
    nuthousecambackup: "fullcam nuthouse",
    parrotcambackup: "fullcam parrot",
    pasturecambackup: "fullcam pasture",
    georgiecambackup: "fullcam georgie",
    noodlecambackup: "fullcam noodle",
    hankcambackup: "fullcam hank",
    hankcam2backup: "fullcam hankcorner",
    roachcambackup: "fullcam roach",
    isopodcambackup: "fullcam orangeisopod",
    noodlegeorgiecambackup: "Noodle /Georgie",
    georgienoodlecambackup: "Georgie / Noodle",
    "3cambackup": "3 Cam",
    "4cambackup": "4 Cam",
    noodlehidecambackup: "Noodle Hide",
    georgiewatercambackup: "fullcam georgiewater",
    crowcambackup: "fullcam crow",
    crowcam2backup: "fullcam crowoutdoor",
    crowcam3backup: "fullcam crowmulti",
    marmosetcambackup: "fullcam marmoset",
    marmosetcam2backup: "fullcam marmosetindoor",
    marmosetcam3backup: "fullcam marmosetmulti",
    foxcambackup: "fullcam fox",
    foxcam2backup: "fullcam foxcorner",
    foxcam3backup: "fullcam foxmulti",
    foxcam4backup: "fullcam foxmulti2",
    "4camoutdoorbackup": "4 Cam Outdoor",
}

let commandScenesCloud = {
    backpackcam: "Maya LiveU",
    serverpccam: "Alveus PC",
    phonecam: "Phone",
    brbscreen: "BRB",
    servernuthousecam: "Alveus Nuthouse",
    ellaintro: "Ella Intro",
    kaylaintro: "Kayla Intro",
    connorintro: "Connor Intro",
    poboxintro: "POBox Intro",
    aqintro: "AQIntro",
    accintro: "ACCIntro",
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    intro: "Intro",
    localbackpackcam: "Alveus Server",
    localpccam: "Alveus Server",
    parrotcambackup: "Alveus Server",
    pasturecambackup: "Alveus Server",
    nuthousecambackup: "Alveus Server",
    georgiecambackup: "Alveus Server",
    noodlecambackup: "Alveus Server",
    hankcambackup: "Alveus Server",
    hankcam2backup: "Alveus Server",
    roachcambackup: "Alveus Server",
    isopodcambackup: "Alveus Server",
    noodlegeorgiecambackup: "Alveus Server",
    georgienoodlecambackup: "Alveus Server",
    "3cambackup": "Alveus Server",
    "4cambackup": "Alveus Server",
    noodlehidecambackup: "Alveus Server",
    georgiewatercambackup: "Alveus Server",
    alveusserver: "Alveus Server",
    crowcambackup: "Alveus Server",
    crowcam2backup: "Alveus Server",
    crowcam3backup: "Alveus Server",
    marmosetcambackup: "Alveus Server",
    marmosetcam2backup: "Alveus Server",
    marmosetcam3backup: "Alveus Server",
    foxcambackup: "Alveus Server",
    foxcam2backup: "Alveus Server",
    foxcam3backup: "Alveus Server",
    foxcam4backup: "Alveus Server",
    "4camoutdoorbackup": "Alveus Server"
}



//-----------------------------------------------------------

const commandAlias = { ...commandControlAlias, ...commandSceneAlias };

//create Permission List
const commandPermissions = getCommandPermissions();
//create Command List
const commandList = getCommandList(commandPermissions, commandAlias);
commandScenes = setupCommandScenes(commandScenes);
commandScenesCloud = setupCommandScenes(commandScenesCloud);
multiCommands = setupCommandAliasMap(multiCommands);
onewayCommands = setupCommandAliasMap(onewayCommands);
timeRestrictedCommands = setupCommandAliasArray(timeRestrictedCommands);
throttledCommands = setupCommandAliasArray(throttledCommands);

const commandAliasConverted = setupCommandAliasConversion(commandAlias);
const multiCustomCamScenesConverted = setupCommandAliasConversion(multiCustomCamScenes);
const customCommandAlias = setupCustomCamAlias(commandSceneAlias);
const customSceneCommands = getCommandList(commandPermissionsCustomCam, commandSceneAlias);

userBlacklist.forEach(user => {
    user = user.toLowerCase().trim();
});

for (const permission of userPermissions.commandPriority) {
    userPermissions[permission].forEach(user => {
        if (typeof user === "symbol") return;
        user = user.toLowerCase().trim();
    });
}

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

function getCommandPermissions() {
    const commandPermissions = {};
    //get full list of all possible commands
    for (const permission of userPermissions.commandPriority) {
        let scenes = commandPermissionsScenes[permission] || [];
        let customCam = commandPermissionsCustomCam[permission] || [];
        let camera = commandPermissionsCamera[permission] || [];
        let extra = commandPermissionsExtra[permission] || [];
        let unifi = commandPermissionsUnifi[permission] || [];
        commandPermissions[permission] = [].concat(scenes, customCam, camera, extra, unifi);
    }
    return commandPermissions;
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

function setupCommandScenes(sceneMap) {
    //add alias commands to commandScenes
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

function setupCommandAliasMap(commandList) {
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

function setupCommandAliasArray(commandList) {
    for (let i = 0; i < commandList.length; i++) {
        //get every command from Multicommand
        const mainCommand = commandList[i];
        const aliasList = commandAlias[mainCommand];
        if (aliasList != null) {
            //check if alias commands for the maincommand
            for (let j = 0; j < aliasList.length; j++) {
                const alias = aliasList[j];
                //add all to multicommand list
                if (!commandList.includes(alias)) {
                    commandList.push(alias);
                }
            }
        }
    }
    return commandList;
}

function setupCommandAliasConversion(aliasList) {
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

        let convertedBaseCommand = customCamCommandMapping[baseCommand] || baseCommand;

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
    commandScenes,
    commandScenesCloud,
    commandList,
    timeRestrictedCommands,
    customSceneCommands,
    notifyScenes,
    multiScenes,
    multiCommands,
    axisCameras,
    onewayCommands,
    onewayNotifications,
    sceneAudioSource,
    scenePositions,
    globalMusicSource,
    timeRestrictedScenes,
    commandAliasConverted,
    multiCustomCamScenes,
    multiCustomCamScenesConverted,
    throttledCommands,
    throttleCommandLength,
    twitchChannelList,
    pauseGameChange,
    pauseNotify,
    pauseTwitchMarker,
    announceChatSceneChange,
    alveusTwitchID,
    customCamCommandMapping,
    customCommandAlias,
    micGroups,
    userBlacklist,
    axisCameraCommandMapping,
    pauseCloudSceneChange,
    notifyHours,
    restrictedHours
};
