//---------- Config -----------------------------------------------
const devPrefix = process.env.NODE_ENV == 'development' ? `$` : '!';
const commandPrefix = devPrefix;

const twitchChannelList = process.env.TWITCH_CHANNELS ?
    process.env.TWITCH_CHANNELS.split(",").map((channel) => channel.trim()) :
    ["spacevoyage", "alveussanctuary", "alveusgg"];

const alveusTwitchID = process.env.ALVEUS_TWITCH_ID ?
    Number.parseInt(process.env.ALVEUS_TWITCH_ID) :
    636587384;

const pauseNotify = true;
const pauseGameChange = true;
const pauseTwitchMarker = true;
const pauseCloudSceneChange = false;
const announceChatSceneChange = false;
//UTC TIME
const notifyHours = {start:14,end:23};
const restrictedHours = {start:14,end:23};
const globalMusicSource = "Music Playlist Global";
const throttleCommandLength = 700;
const throttlePTZCommandLength = 1500;
const throttleSwapCommandLength = 2000;

const userRanks = {
    mods: Symbol("mods"),
    vips: Symbol("vips"),
    subs: Symbol("subs"),
    all: Symbol("all")
}

let userPermissions = {
    commandPriority: ["commandAdmins", "commandSuperUsers", "commandMods", "commandOperator", "commandVips", "commandUsers"],
    commandAdmins: ["spacevoyage", "maya", "theconnorobrien", "alveussanctuary"],
    commandSuperUsers: ["ellaandalex", "dionysus1911", "dannydv", "maxzillajr", "illjx", "kayla_alveus", "alex_b_patrick", 
                        "lindsay_alveus", "strickknine","tarantulizer","spiderdaynightlive","srutiloops","evantomology","amandaexpress",
                        "coltonactually","tamarinsandjulie"],
    commandMods: [userRanks.mods],
    commandOperator: [],
    commandVips: [userRanks.vips],
    commandUsers: [userRanks.subs]
}

let userBlacklist = ["RestreamBot"];

//OBS Scene Commands
const commandPermissionsScenes = {
    commandAdmins: ["testadminscene"],
    commandSuperUsers: ["testsuperscene", "backpackcam", "localbackpackcam", "serverpccam", "localpccam", "servernuthousecam", "phonecam", "monitorcam"],
    commandMods: ["testmodscene", "alveusserver", "brbscreen", "georgiecambackup", "noodlecambackup", "hankcambackup", "hankcam2backup", "roachcambackup", "isopodcambackup",
        "noodlegeorgiecambackup", "georgienoodlecambackup", "3cambackup", "4cambackup", "ellaintro", "kaylaintro", "lukasintro","connorintro","intro","poboxintro","aqintro",
        "accintro","accbrb","accending","ccintro","ccbrb","ccending","abcintro","sntintro","sntbrb","sntending","nickintro","nickbrb","nickending",
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
let unthrottledCommands = [];



//Customcam scene names
const commandPermissionsCustomCam = {
    commandAdmins: [],
    commandSuperUsers: ["nuthousecam", "localpccam", "backpackcam", "monitorcam","phonecam","phone2cam","phone3cam"],
    commandMods: ["wolfcam","wolfcam2","wolfcam3","wolfcam4","wolfcam5","wolfcam6","wolfcam7","wolfcam8","wolfcam9","wolfcam10","parrotcam", "pasturecam",
         "crowcam", "crowcam2", "crowcam3", "crowcam4", "foxcam", "foxcam2", "foxcam3", "foxcam4", "4camoutdoor", "marmosetcam", "marmosetcam3",
        "nightcams", "nightcamsbig","chickencam","chickencam3","gardencam","constructioncam"],
    commandOperator: ["georgiecam", "noodlecam","patchycam","toastcam","pushpopcam","pushpopcam2","pushpopcam3", "puppycam", "hankcam", "hankcam2",
         "hankcam3", "hankmulti", "roachcam", "isopodcam", "noodlehidecam", "georgiecam2", "georgiecam3", "indoorcams", "indoorcamsbig", "chincam", "chincam2", 
         "chincam3", "chincam4","orangeisopodcam","chickencam2", "marmosetcam2"],
    commandVips: [],
    commandUsers: []
}
    
//One Direction, If on OBS Scene, allow subscenes commands
//scene names are lowercase, no spaces, no s/es
let onewayCommands = {
    "4camoutdoor": ["foxcam", "foxcam2", "foxcam3", "foxcam4", "pasturecam"]
}

//Chat Command Swapping
//allows swapping between matching bases
let multiCommands = {
    georgie: ["georgiecam","georgiecam2","georgiecam3"],
    chin: ["chincam","chincam2","chincam3","chincam4","chincamall"],
    crow: ["crowcam", "crowcam2", "crowcam3","crowcam4"],
    fox: ["foxcam", "foxcam2", "foxcam3", "foxcam4", "foxcam5", "foxcam6"],
    chicken: ["chickencam","chickencam2","chickencam3"],
    pushpop: ["pushpopcam","pushpopcam2","pushpopcam3"],
    wolf: ["wolfcam", "wolfcam2","wolfcam3","wolfcam4","wolfcam5","wolfcam6","wolfcam7","wolfcam8","wolfcam9","wolfcam10","wolfcam11"],
    marmoset: ["marmosetcam", "marmosetcam2", "marmosetcam3"]
}

//Notification Swapping
//Scene Names in OBS
//lowercase, no spaces, no s/es
//what is the parent cam of multiscene
const multiScenes = {
    georgie: ["georgiemulti"],
    chin3: ["chinmulti"],
    hank: ["hankmulti"],
    crow: ["crowmulti"],
    crowindoor: ["crowmulti2"],
    chicken: ["chickenmulti"],
    wolf: ["wolfmulti","wolfmulti2","wolfmulti3"],
    wolfcorner: ["wolfmulti4", "wolfmulti5"],
    fox: ["foxmulti","foxmulti2"],
    foxcorner: ["foxmulti3"],
    marmoset: ["marmosetmulti"]
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
    "pushpop": "Pushpop Cam",
    "pushpopindoor": "Pushpop Cam",
    "pushpopcrunch": "Pushpop Crunch Cam",
    "nuthouse": "nuthouse local",
    "nut": "nuthouse local",
    "phone": "space rtmp phone",
    "phone2": "space rtmp phone2",
    "phone3": "space rtmp phone3",
    "backpack": "maya rtmp 1",
    "backpack2": "space rtmp backpack2",
    "backpack3": "space rtmp backpack3",
    "pc": "local rtmp desktop",
    "pc2": "local rtmp desktop2",
    "wolf": "wolf mic",
    "wolfcorner": "wolf mic",
    "wolfswitch": "wolf mic",
    "wolfindoor": "wolf indoor camera",
    "wolfden": "wolf den2 camera",
    "wolfden2": "wolf den2 camera",
    "wolfmulti": "wolf mic",
    "wolfmulti2": "wolf mic",
    "wolfmulti3": "wolf mic",
    "wolfmulti4": "wolf mic",
    "wolfmulti5": "wolf mic",
    "chatchat": "chat chats audio",
    "phonemic": "mobile mic",
    "chicken": "Chicken Camera",
    "chickenindoor": "Chicken Indoor Camera",
    "chickenmulti": "Chicken Camera",
    "georgie": "georgie cam",
    "georgiewater": "georgie cam",
    "georgiemulti": "georgie cam",
    "monitor": "ndi webcam"
}
//used for unmute/mute all. match above phrasing
const micGroups = {
    livecams: {
        pasture: { name: sceneAudioSource.pasture, volume: -2.4 }, parrot: { name: sceneAudioSource.parrot, volume: -7.9 },
        crow: { name: sceneAudioSource.crow, volume: -7.6 }, marmoset: { name: sceneAudioSource.marm, volume: -7.6 },
        wolf: { name: sceneAudioSource.wolf, volume: -7.9 }, wolfden: { name: sceneAudioSource.wolfden2, volume: -7.9 },
        wolfindoor: { name: sceneAudioSource.wolfindoor, volume: -7.9 }, pushpop: { name: sceneAudioSource.pushpop, volume: -3.9 },
        pushpopcrunch: { name: sceneAudioSource.pushpopcrunch, volume: -2.9 }, georgie: { name: sceneAudioSource.georgie, volume: -3.9 },
        chicken: { name: sceneAudioSource.chicken, volume: -3.9 }, chickenindoor: { name: sceneAudioSource.chicken, volume: -3.9 },
        chickenmulti: { name: sceneAudioSource.chickenmulti, volume: -3.9 }
    },
    restrictedcams: {
        fox: { name: sceneAudioSource.fox, volume: -2.4 }, 
        garden: { name: sceneAudioSource.garden, volume: -2.4 }, 
        phone: { name: sceneAudioSource.phone, volume: -10 }
    },
    admincams: {
        phone: { name: sceneAudioSource.phone, volume: 0 },
        phone2: { name: sceneAudioSource.phone2, volume: 0 },
        phone3: { name: sceneAudioSource.phone3, volume: 0 },
        backpack: { name: sceneAudioSource.backpack, volume: 0 }, 
        backpack2: { name: sceneAudioSource.backpack2, volume: 0 }, 
        backpack3: { name: sceneAudioSource.backpack3, volume: 0 }, 
        pc: { name: sceneAudioSource.pc, volume: 0 },
        pc2: { name: sceneAudioSource.pc2, volume: 0 },
        nuthouse: { name: sceneAudioSource.nut, volume: 0 },
        chatchat: { name: sceneAudioSource.chatchat, volume: 0 },
        phonemic: { name: sceneAudioSource.phonemic, volume: 0 }
    }
}

//ADD IP INFO IN ENV
//Scene Names in OBS
//lowercase, no spaces, no s/es
const axisCameras = ["pasture", "parrot","wolf","wolfindoor","wolfcorner","wolfswitch","wolfden2","wolfden","georgie", "georgiewater", 
    "noodle","patchy", "toast","roach", "crow", "crowindoor", "fox", "foxden", "foxcorner", "hank", "hankcorner", "marmoset", 
    "marmosetindoor", "chin", "pushpop","pushpopindoor","pushpopcrunch","marty", "bb","construction",
    "chicken", "chickenindoor", "garden","speaker"];

//Axis Camera Mapping to Command. Converting base to source name
//cleanName()
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
    "wolfcam11":"wolfswitch",
    "georgie":"georgie", 
    "georgiecam2":"georgiewater", 
    "georgiecam3":"georgie", 
    "noodle":"noodle", 
    "patchy":"patchy", 
    "toast":"toast", 
    "roach":"roach", 
    "crow":"crow", 
    "crowcam2":"crowindoor", 
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
    "pushpop":"pushpop", 
    "pushpopcam2":"pushpopindoor", 
    "pushpopcam3":"pushpopcrunch", 
    "isopod":"marty", 
    "orangeisopod":"bb", 
    "construction":"construction", 
    "chickencam":"chicken", 
    "chickencam2":"chickenindoor", 
    "chickencam3":"chicken", 
    "garden":"garden", 
    "speaker":"speaker", 
    "monitor":"monitor"
}

//Camera Commands
const ptzPrefix = "ptz";
const commandPermissionsCamera = {
    commandAdmins: ["testadmincamera"],
    commandSuperUsers: ["testsupercamera", "ptzcontrol", "ptzoverride", "ptzclear"],
    commandMods: ["testmodcamera", "ptztracking", "ptzirlight", "ptzwake"],
    commandOperator: ["ptzhomeold","ptzseta","ptzset", "ptzpan", "ptztilt", "ptzmove", "ptzir", "ptzdry",
                     "ptzfov", "ptzstop", "ptzsave", "ptzremove", "ptzrename", "ptzcenter", "ptzclick", "ptzdraw",
                     "ptzspeed", "ptzgetspeed", "ptzspin", "ptzcfocus","ptzplayaudio","ptzstopaudio","ptzfetchimg","apigetperms"],
    commandVips: [],
    commandUsers: ["ptzhome", "ptzpreset","ptzgetinfo","ptzgetcam", "ptzzoom","ptzzooma", "ptzload", "ptzlist", "ptzroam", "ptzroaminfo", "ptzfocusa", "ptzgetfocus", "ptzfocus", "ptzautofocus"]
}
//timeRestrictedCommands = timeRestrictedCommands.concat(["ptzclear"]);
unthrottledCommands = unthrottledCommands.concat(["apigetperms"]);

//Extra Commands
const commandPermissionsExtra = {
    commandAdmins: ["testadminextra"],
    commandSuperUsers: ["testsuperextra", "resetcloudsource", "resetcloudsourcef", "setalveusscene", "setcloudscene", "changeserver", "setmute", "camclear"],
    commandMods: ["testmodextra", "resetsource","resetsourcef","camload", "camlist", "camsave", "camrename", "campresetremove", "customcams", "customcamsbig", "customcamstl", "customcamstr", "customcamsbl", "customcamsbr",
        "unmutecam", "unmuteallcams", "nightcams", "nightcamsbig", "indoorcams", "addcam", "runfeeder","blockuser","unblockuser","listblocked"],
    commandOperator: ["showchat","hidechat","raidvideo","stopraidvideo","showrounds","hiderounds", "disablesubs","enablesubs",
                 "resetvolume", "removecam", "mutecam", "muteallcams", "musicvolume", "musicnext", "musicprev", 
                "mutemusic", "unmutemusic", "mutemusiclocal", "unmutemusiclocal", "resetbackpack", "resetbackpack2", "resetbackpack3", "resetpc", "resetlivecam", 
                "resetbackpackf", "resetpcf", "resetlivecamf", "resetextra","resetphone","resetphone2","resetphone3", "resetphonef","crunchvideo"], //"checkmark","clearcheckmarks"
    commandVips: [],
    commandUsers: ["feederstatus", "swapcam", "resetcam","getvolume", "setvolume", "scenecams","axislist"]
}
timeRestrictedCommands = timeRestrictedCommands.concat(["unmutecam", "unmuteallcams"]);
unthrottledCommands = unthrottledCommands.concat(["runfeeder"]);

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
//not clean, includes "cam" at end
const customCamCommandMapping = {
    "hankcam2": "hankcorner",
    "hankcam3": "hankmulti",
    "noodlehidecam": "noodlehide",
    "georgiecam": "georgie",
    "georgiecam2": "georgiewater",
    "georgiecam3": "georgiemulti",
    "crowcam": "crow",
    "crowcam2": "crowindoor",
    "crowcam3": "crowmulti",
    "crowcam4": "crowmulti2",
    "foxcam": "fox",
    "foxcam2": "foxmulti",
    "foxcam3": "foxcorner",
    "foxcam4": "foxden",
    "foxcam5": "foxmulti2",
    "foxcam6": "foxmulti3",
    "marmosetcam": "marmoset",
    "marmosetcam2": "marmosetindoor",
    "marmosetcam3": "marmosetmulti",
    "3cam": "georgie noodle toast",
    "4cam": "georgie noodle patchy toast",
    "4camoutdoor": "pasture parrot marmoset fox",
    "nightcams": "wolf pasture parrot fox crow marmoset",
    "nightcamsbig": "wolf pasture parrot fox crow marmoset",
    "indoorcams": "georgie noodle toast chin patchy roach",
    "indoorcamsbig": "georgie noodle toast chin patchy roach",
    "chincam": "chin",
    "chincam2": "chin2",
    "chincam3": "chin3",
    "chincam4": "chinmulti",
    "chincamall": "chin chin2 chin3",
    "localpccam": "pc",
    "serverpccam": "pc",
    "orangeisopodcam": "orangeisopod",
    "roachcam":"roaches",
    "constructioncam":"construction",
    "wolfcam":"wolf", 
    "wolfcam2":"wolfcorner", 
    "wolfcam3":"wolfden", 
    "wolfcam4":"wolfden2", 
    "wolfcam5":"wolfindoor", 
    "wolfcam6":"wolfmulti", 
    "wolfcam7":"wolfmulti2", 
    "wolfcam8":"wolfmulti3", 
    "wolfcam9":"wolfmulti4", 
    "wolfcam10":"wolfmulti5",
    "wolfcam11":"wolfswitch",
    "pushpopcam":"pushpop",
    "pushpopcam2":"pushpopindoor",
    "pushpopcam3":"pushpopcrunch",
    "gardencam":"garden",
    "chickencam":"chicken",
    "chickencam2":"chickenindoor",
    "chickencam3":"chickenmulti"
}

//CCam Argument for Command Mapping. Converting base to source name
const roundsCommandMapping = {
    "parrot": "checkmarkParrot",
    "fox": "checkmarkFoxes",
    "winnie": "checkmarkWinnie",
    "donkey": "checkmarkDonkeys",
    "stompy": "checkmarkStompy",
    "marmoset": "checkmarkMarmosets",
    "wolf": "checkmarkWolfdogs",
    "crow": "checkmarkCrows",
    "bug": "checkmarkBugs"
}

const commandSceneAlias = {
    localpccam: ["desktopcam","pclocalcam","pccamlocal","alveuspccam"],
    serverpccam: ["pccam","pcservercam", "remotepccam","serverpccam"],
    phonecam: ["alveusphonecam", "winniecam", "goatcam"],
    phone2cam: ["alveusphone2cam", "tractorcam"],
    phone3cam: ["alveusphone3cam"],
    puppycam: ["scorpioncam"],
    roachcam: ["roachescam","barbaracam"],
    hankcam: ["mrmctraincam ", "choochoocam", "hankthetankchoochoomrmctraincam"],
    hankcam2: ["mrmctraincam2 ", "choochoocam2", "hankthetankchoochoomrmctraincam3", "hanknightcam", "hankcornercam"],
    hankcam3: ["mrmctraincam3 ", "choochoocam3", "hankthetankchoochoomrmctraincam3", "hankmulticam"],
    isopodcam: ["isopodscam", "martycam", "martyisopodcam"],
    orangeisopodcam: ["bbcam", "bbisopodcam", "sisopodcam", "isopodorangecam", "oisopodcam", "spanishisopodcam", "isopod2cam", "isopodcam2"],
    georgiecam: ["georgcam"],
    georgiecam2: ["georgiewatercam","gerogiefishcam","fishcam","chendlercam","georgieunderwatercam"],
    georgiecam3: ["georigemulticam"],
    nuthousecambackup: ["nutcam"],
    servernuthousecam: ["servernutcam", "remotenutcam", "remotenuthousecam"],
    crowcam: ["crowoutdoorscam", "crowoutdoorcam","crowoutcam","crowocam"],
    crowcam2: ["crowindoorcam","crowincam","crowinsidecam","crowicam"],
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
    chincam: ["chinchillacam", "chinscam","chin1cam","chintcam", "snorkcam", "moomincam", "fluffycam"],
    chincam2: ["chinmiddlecam", "chin2cam","chinmcam"],
    chincam3: ["chinbottomcam", "chin3cam","chinbcam"],
    chincam4: ["chinmulticam", "chin4cam"],
    chincamall: ["chinallcam", "chinstackcam"],
    connorpc: ["connordesktop"],
    constructioncam: ["timelapsecam"],
    connorintro: ["penis"],
    accintro: ["acintro"],
    accbrb: ["acbrb"],
    accending: ["acending","accend","acend"],
    abcintro: ["abcintro","bookclubintro","bookintro"],
    ccintro: ["cintro","ccintro2","cintro2","evanintro","allisonintro"],
    ccbrb: ["cbrb"],
    ccending: ["cending","ccend","cend"],
    sntintro: ["showintro","tellintro","showntellintro","showandtellintro"],
    sntbrb: ["showbrb","tellbrb","showntellbrb","showandtellbrb"],
    sntending: ["showending","tellending","showntellending","showandtellending","sntend"],
    nickending: ["nickend"],
    chatchat: ["bugmic","chatchatmic"],
    phonemic: ["phoneaudio","phonemic","mobilemic"],
    wolfcam: ["wolvescam","akelacam","awacam","wolfocam","wolfoutcam","wolfoutdoorcam","wolfoutsidecam","wolfcamout","wolfcamoutdoor"],
    wolfcam2: ["wolvescornercam","wolfcornercam","wolfsidecam","wolfdeckcam","wolf2cam","wolfccam"],
    wolfcam3: ["wolvesdencam","wolfdencam","wolfponddencam","wolfdcam"],
    wolfcam4: ["wolvesden2cam","wolfden2cam","wolfdeckdencam","wolfd2cam"],
    wolfcam5: ["wolvesindoorcam","wolfindoorcam","wolfinsidecam","wolfincam","wolficam","wolfcamindoor","wolfcamin","wolfcaminside"],
    wolfcam6: ["wolvesmulticam","wolfmulticam","wolfoutmulticam","wolfwolfcornermulticam"],
    wolfcam7: ["wolfindoormulticam","wolfinmulticam","wolfinsidemulticam","wolfwolfinmulticam","wolfwolfincam"],
    wolfcam8: ["wolfdenmulticam","wolfwolfdenmulticam","wolfwolfdencam"],
    wolfcam9: ["wolfden2multicam","wolfwolfden2multicam","wolfwolfden2cam"],
    wolfcam10: ["wolfcornermulticam","wolfcornerwolfincam","wolfcornerwolfinmulticam","wolfcwolfincam","wolfcwolficam"],
    wolfcam11: ["wolfswitchcam"],
    pushpopcam: ["pushpopcam","pushcam","popcam","poppycam"],
    pushpopcam2: ["pushpopindoorptzcam","pushinptz","pushpopindoorcam","pushindoorcam","pushpopinsidecam","pushpopincam","poppyincam","pushincam","popincam","popinsidecam","poppyinsidecam","poppyindoorcam"],
    pushpopcam3: ["pushpopcrunchcam","pushcrunchcam","popcrunchcam","poppycrunchcam","crunchcam","pushccam","popccam"],
    gardencam: ["pollinatorcam","plantcam"],
    winniecam: ["cow","moo","winn"],
    donkeycam: ["serrano","jalapeno","donk"],
    stompycam: ["emucam","stomp","stompers"],
    bugcam: ["insect","reptile","critter","cave","crittercave"],
    chickencam: ["chickenscam","chickenoutdoorcam","chickenoutsidecam"],
    chickencam2: ["chickenindoorcam","chickeninsidecam","chickenincam"],
    chickencam3: ["chickenmulticam"],
    monitorcam: ["monitorcam","atomoscam","ndicam"]
}

const commandControlAlias = {
    ptzfocus: ["ptzsetfocusr"],
    ptzfocusa: ["ptzsetfocusa"],
    ptzdry: ["ptzshake", "ptzhecrazy"],
    "resetlivecam": ["resetlivecams", "restartlivecam", "restartlivecams"],
    "resetlivecamf": ["resetlivecamsf", "restartlivecamf", "restartlivecamsf"],
    "resetbackpack": ["resetbackpackcam", "restartbackpack", "restartbackpackcam"],
    "resetbackpack2": ["resetbackpack2cam", "restartbackpack2", "restartbackpack2cam"],
    "resetbackpack3": ["resetbackpack3cam", "restartbackpack3", "restartbackpack3cam"],
    "resetbackpackf": ["resetbackpackcamf", "restartbackpackf", "restartbackpackcamf"],
    "resetextra": ["resetextracam"],
    "resetphone": ["resetphonecam"],
    "resetphone2": ["resetphone2cam"],
    "resetphone3": ["resetphone3cam"],
    "resetphonef": ["resetphonecamf"],
    "resetphonef": ["resetphonecamf"],
    "raidvideo": ["welcomevideo","raidv","raidvid","welcomevid","startwelcome"],
    "stopraidvideo": ["stopwelcomevideo","stopraidv","stopraidvid","stopwelcomevid","stopwelcome"],
    "crunchvideo": ["crunchvid","pushintro","pushvid","crunchintro"],
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
    ptzplayaudio: ["playclip","playaudio"],
    ptzstopaudio: ["stopclip","stopaudio"],
    showrounds: ["enableround","roundson","startround","startrounds"],
    hiderounds: ["disableround","roundsoff","stopround","stoprounds"],
    // checkmark: ["finished","markdone","mark","check"],
    // clearcheckmarks: ["clearmark","clearcheck","clearcheckmark","clearcheck"],
    feederstatus: ["feed","feedstatus","feedinfo","tankinfo","tanklevel","feederinfo"],
    runfeeder: ["runfeed","feedwinnie"],
    blockuser: ["blacklist","removeuser"],
    unblockuser: ["whitelist","adduser"],
    listblocked: ["listblock","listbanned","blockedlist","blocklist"],
    enablesubs: ["startsubs","unlockcontrols"],
    disablesubs: ["stopsubs","lockcontrols"],
    axislist: ["axiscamlist"]
}

let commandScenes = {
    backpackcam: "Backpack Server", //Cloud server
    serverpccam: "Alveus PC Server",//"Alveus PC Server", //Cloud server
    monitorcam: "Alveus Monitor", //Cloud server
    phonecam: "Phone Server", //Cloud server
    // phone2cam: "Phone2 Server", //Cloud server
    servernuthousecam: "fullcam nuthouse",
    brbscreen: "BRB", //Cloud server
    ellaintro: "EllaIntro",
    kaylaintro: "KaylaIntro",
    lukasintro: "LukasIntro",
    connorintro: "ConnorIntro",
    poboxintro: "POBoxIntro",
    aqintro: "AQIntro",
    accintro: "ACCIntro",
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    abcintro: "ABCIntro",
    ccintro: "CCIntro",
    ccbrb: "CCBRB",
    ccending: "CCEnding",
    sntintro: "SNTIntro",
    sntbrb: "SNTBRB",
    sntending: "SNTEnding",
    nickintro: "NickIntro",
    nickbrb: "NickBRB",
    nickending: "NickEnding",
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
    "4camoutdoorbackup": "4 Cam Outdoor"
}

let commandScenesCloud = {
    backpackcam: "Maya LiveU",
    serverpccam: "Alveus PC",
    monitorcam: "Alveus Server",
    phonecam: "Phone",
    // phone2cam: "Phone2",
    brbscreen: "BRB",
    servernuthousecam: "Alveus Nuthouse",
    ellaintro: "EllaIntro",
    kaylaintro: "KaylaIntro",
    lukasintro: "LukasIntro",
    connorintro: "ConnorIntro",
    poboxintro: "POBoxIntro",
    aqintro: "AQIntro",
    accintro: "ACCIntro",
    accbrb: "ACCBRB",
    accending: "ACCEnding",
    abcintro: "ABCIntro",
    ccintro: "CCIntro",
    ccbrb: "CCBRB",
    ccending: "CCEnding",
    sntintro: "SNTIntro",
    sntbrb: "SNTBRB",
    sntending: "SNTEnding",
    nickintro: "NickIntro",
    nickbrb: "NickBRB",
    nickending: "NickEnding",
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
onewayCommands = setupCommandAliasMap(onewayCommands);
timeRestrictedCommands = setupCommandAliasArray(timeRestrictedCommands);
unthrottledCommands = setupCommandAliasArray(unthrottledCommands);

const commandAliasConverted = setupCommandAliasConversion(commandAlias);
const multiCustomCamScenesConverted = setupMultiCustomCamConversion(multiCommands);
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


function setupMultiCustomCamConversion(aliasList) {
    const convertedList = {};
    for (const baseCommand in aliasList) {
        for (const aliasCommand of aliasList[baseCommand]) {
            convertedList[aliasCommand] = baseCommand;
            let convertedAliasCommand = customCamCommandMapping[aliasCommand];
            if (convertedAliasCommand != null){
                convertedList[convertedAliasCommand] = baseCommand;
            }
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
    axisCameras,
    onewayCommands,
    onewayNotifications,
    sceneAudioSource,
    scenePositions,
    globalMusicSource,
    timeRestrictedScenes,
    commandAliasConverted,
    multiCustomCamScenesConverted,
    unthrottledCommands,
    throttleCommandLength,
    throttlePTZCommandLength,
    throttleSwapCommandLength,
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
    restrictedHours,
    roundsCommandMapping
};
