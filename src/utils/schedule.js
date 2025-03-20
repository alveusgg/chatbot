/**
 * Run a function at a specific Date
 *  
 * @param {Date} date Date to run at
 * @param {Function} callback Function to run
 */
const runAtDate = (date, callback) => {
    setTimeout(callback,  date - new Date());
};


/**
 * Run a function at a specific UTC time
 *  
 * @param {number} hour UTC hour
 * @param {number} minute UTC minute
 * @param {Function} callback Function to run
 * @param {boolean} [loop] Whether to run the function every day at the specified time
 */
const runAtTime = (hour, minute, callback, loop = true) => {
    // Determine our initial next run time
    const next = new Date();
    next.setUTCHours(hour);
    next.setUTCMinutes(minute);
    next.setUTCSeconds(0);
    if (next < new Date()) next.setDate(next.getDate() + 1);

    // Invoke the callback and increment the next run time each day
    const callbackLoop = () => {
        callback();

        if (loop) {
            next.setDate(next.getDate() + 1);
            runAtDate(next, callbackLoop);
        }
    };
    runAtDate(next, callbackLoop);
};

module.exports = runAtTime;
