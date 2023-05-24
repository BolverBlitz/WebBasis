const loglevel = Number(process.env.LOG_LEVEL) || 3; // Default Info
const Levels = ['error', 'warning', 'info', 'debug', 'system'];

function getTimestamp() {
    const pad = (n, s = 2) => (`${new Array(s).fill(0)}${n}`).slice(-s);
    const d = new Date();

    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${pad(d.getFullYear(), 4)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * @param {string} level Loglevel of the to log text
 * @param {string} text Text to log
 */
const logger = function (level, text) {
    if(process.env.LOG_LEVEL === '0') return;
    const levelnumber = Levels.indexOf(level.toLowerCase()) + 1

    if (levelnumber <= loglevel && levelnumber === 1) {
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[31m[E]\x1b[0m`, text)
    }

    if (levelnumber <= loglevel && levelnumber === 2) {
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[33m[W]\x1b[0m`, text)
    }

    if (levelnumber <= loglevel && levelnumber === 3) {
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[32m[I]\x1b[0m`, text)
    }

    if (levelnumber <= loglevel && levelnumber === 4) {
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[90m[D]\x1b[0m`, text)
    }

    if (levelnumber === 5) {
        console.log(`[${process.env.application || "Application"}] [${getTimestamp()}] \x1b[36m[S]\x1b[0m`, text)
    }
}

/**
 * logs an error to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logError = (text) => logger('error', text);

/**
 * logs a warning to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logWarning = (text) => logger('warning', text);

/**
 * logs a info to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logInfo = (text) => logger('info', text);

/**
 * logs a debug to the console and to the database or filesystem
 * @param {String} text 
 * @returns 
 */
const logDebug = (text) => logger('debug', text);

/**
 * logs an system message to the console and to the database or filesystem
 * @param {String} text Text to log
 */
const logSystem = (text) => logger('system', text);

const log = {
    error: logError,
    warning: logWarning,
    info: logInfo,
    debug: logDebug,
    system: logSystem,
}

logger('system', `Logger initialized at level ${Levels[loglevel - 1]}`);

module.exports = {
    logger,
    log
};