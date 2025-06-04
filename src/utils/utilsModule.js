// Utils Module
// Updated: 6/10/23

//const utilsModule = require(__dirname + "/utilsModule.js");
// const utils = new utilsModule(`[OBSConnect]`);

// import * as utils from "./utils.mjs";
//const utils = require(__dirname + "/utils.js");

const fs = require("fs");

class UtilsModule {
    log_prefix = "";
    debug_mode = true;
    property = "value";

    constructor(prefix,debugMode) {
        if (prefix !== null){
            this.log_prefix = prefix;
		}
        if (debugMode){
            this.debug_mode = true;
        } else if (debugMode === false){
            this.debug_mode = false;
        }
    }

    getPrefix() {
        return this.log_prefix;
    }
    setPrefix(prefix) {
        this.log_prefix = prefix;
    }
    getDebug() {
        return this.debug_mode;
    }
    setDebug(boolean) {
        if (boolean === true) {
            this.debug_mode = true;
        } else {
            this.debug_mode = false;
        }
    }
    log() {
        if (this.debug_mode) {
            // 1. Convert args to a normal array
            var args = Array.prototype.slice.call(arguments);
            // 2. Prepend log prefix log string
            if (this.log_prefix != "") {
                args.unshift(this.log_prefix);
            }

            // 3. Pass along arguments to console.log
            console.log.apply(console, args);
        }
    }

     logError() {
        if (this.debug_mode) {
            // 1. Convert args to a normal array
            var args = Array.prototype.slice.call(arguments);
            // 2. Prepend log prefix log string
            if (this.log_prefix != "") {
                args.unshift(this.log_prefix);
            }

            // 3. Pass along arguments to console.log
            console.error.apply(console, args);
        }
    }

     getNowCST(){
        let now = new Date();
        return now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    }
     getRandomKey(obj) {
        var keys = Object.keys(obj);
        return keys[Math.floor(Math.random() * keys.length)];
    }
     randomIntFromInterval(min, max) {
        // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
     isNumber(n) {
        return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
    }
    sortBy(array, p) {
        return array.slice(0).sort(function (a, b) {
            return a[p] < b[p] ? 1 : a[p] > b[p] ? -1 : 0;
        });
    }
    // Array.prototype.sortBy = function (p) {
    //     return this.slice(0).sort(function (a, b) {
    //         return a[p] < b[p] ? 1 : a[p] > b[p] ? -1 : 0;
    //     });
    // };
    secondsToTime(given_seconds) {
        const dateObj = new Date(given_seconds * 1000);
        const hours = dateObj.getUTCHours();
        const minutes = dateObj.getUTCMinutes();
        const seconds = dateObj.getSeconds();

        const timeString =
            hours.toString().padStart(2, "0") +
            ":" +
            minutes.toString().padStart(2, "0") +
            ":" +
            seconds.toString().padStart(2, "0");
        return timeString;
    }

    getSecondsAgoDate(secs) {
        var second = 1000;
        var minute = 1000 * 60;
        var hour = 1000 * 60 * 60;
        var day = 1000 * 60 * 60 * 24;
        var week = 1000 * 60 * 60 * 24 * 7;
        var year = 1000 * 60 * 60 * 24 * 365;
        //1month = 2629746, 1week = 604800, 1 day = 86400, 1 hour = 3600
        let enddate = new Date();
        enddate = new Date(enddate.getTime() - secs * 1000);
        return enddate;
    }

    reviver(key, value) {
        const dateFormat =
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        if (typeof value === "string" && dateFormat.test(value)) {
            return new Date(value);
        }
        return value;
    }

    formatNumber(num, decimals) {
        decimals = decimals || 0;
        let number = num;
        if (num == null || isNaN(num) || num == "") {
            number = 0;
        }
        let fix = Number(Number(num).toFixed(decimals));
        return "$" + fix.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    //get random weighted item, options {weight,item}
    weighted_random(options) {
        var i;

        var weights = [];

        for (i = 0; i < options.length; i++)
            weights[i] = options[i].weight + (weights[i - 1] || 0);

        var random = Math.random() * weights[weights.length - 1];

        for (i = 0; i < weights.length; i++) if (weights[i] > random) break;

        return options[i].item;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    getFormattedTime(timeZone) {
        timeZone = timeZone || "America/Chicago";
        let date = new Date().toLocaleString("en-US", {
            timeZone: timeZone,
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        let dateString = date.match(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+):(\d+)/);
        let m = dateString[1];
        let d = dateString[2];
        let y = dateString[3];
        let h = dateString[4];
        let min = dateString[5];
        let s = dateString[6];
        //date = date.replace(/\s/g, "").replace(/\//g, "-").replace(",", "T").replace(/:/g, "");
        let formatted = y + "-" + m + "-" + d + "T" + h + "_" + min + "_" + s;
        return formatted;
    }

    formatTimestampToSeconds(timeStamp) {
        var timeInSeconds = 0;
        let match = timeStamp.match(/^\W*[0-9]*(hours|hour|hr|h)?\W*[0-9]*(minutes|minute|min|m)?\W*[0-9]*(seconds|second|sec|s)?/g)
        if (match?.toString() == timeStamp) {
            timeStamp.replace(/hours|hour|hr|h/ig, "h");
            timeStamp.replace(/minutes|minute|min|m/ig, "m");
            timeStamp.replace(/seconds|second|sec|s/ig, "s");
            timeStamp.replace(/([0-9]+)[h|m|s]/ig, function (match, value) {
                console.log("replace match", match, value);
                if (match.indexOf("h") > -1) {
                    timeInSeconds += value * 60 * 60;
                } else if (match.indexOf("m") > -1) {
                    timeInSeconds += value * 60;
                } else if (match.indexOf("s") > -1) {
                    timeInSeconds += value * 1;
                }
            });
        }
        return timeInSeconds;
    }

    loadFile(filePath, defaults){
        try{
            const jsonString = fs.readFileSync(filePath);
            let file = JSON.parse(jsonString);
            for (let d in defaults){
                file[d] = file[d] ?? defaults[d];
            }
            this.log(`Loading file ${filePath}: `,file);
            return file;
        } catch (e){
            if (e.code === 'ENOENT') {
                //no file
                return {};
            } else {
                throw `Error loading database: ${e}`;
            }
        }
    }

    throttle(fn, delay) {
        let isThr = false;
    
        return function (...args) {
            if (!isThr) {
                fn.apply(this, args);
                isThr = true;
    
                setTimeout(() => {
                    isThr = false;
                }, delay);
            }
        };
    }

    //---------------------- File management---------------------------

    setShutdown() {
        let self = this;
        //-------- SHUTDOWN-------------------------------------------------
        process.stdin.resume(); //so the program will not close instantly

        function exitHandler(options, exitCode) {
            self.log("Closing Program", exitCode);
            if (exitCode || exitCode === 0) self.log(exitCode);
            if (options.exit) process.exit();
        }
        //do something when app is closing
        process.on("exit", exitHandler.bind(null, { exit: true }));

        //catches ctrl+c event
        process.on("SIGINT", exitHandler.bind(null, { exit: true }));
        process.on("SIGQUIT", exitHandler.bind(null, { exit: true  }));
        process.on("SIGTERM", exitHandler.bind(null, { exit: true  }));
        // catches "kill pid" (for example: nodemon restart)
        process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
        process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

        //catches uncaught exceptions
        //process.on('uncaughtException', exitHandler.bind(null, { exit: false }));
    }

}

module.exports = UtilsModule;
