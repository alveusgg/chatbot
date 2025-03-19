/**
 * Run a function at a specific UTC time
 *  
 * @param {number} hour UTC hour
 * @param {number} minute UTC minute
 * @param {Function} callback Function to run
 * @param {boolean} loop Whether to run the function every day at the specified time
 */
const runAtTime = (hour, minute, callback, loop = true) => {
    // Determine our next run time
    const next = new Date();
    next.setUTCHours(hour);
    next.setUTCMinutes(minute);
    if (next < new Date()) next.setDate(next.getDate() + 1);

    // Determine our delay
    const delay = next - new Date();
    setTimeout(() => {
        callback();

        // Schedule the next run
        if (loop) runAtTime(hour, minute, callback);
    }, delay);
}

module.exports = runAtTime;
