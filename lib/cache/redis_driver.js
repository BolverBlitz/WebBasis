const { webtoken, user } = require('@lib/postgres');
const { formatSQLPermissions } = require('@lib/permission');
const Redis = require("ioredis");

const redis = new Redis({
    port: process.env.Redis_Port || 6379,
    host: process.env.Redis_Host || "127.0.0.1",
    username: process.env.Redis_User || "default",
    password: process.env.Redis_Password || "default",
    db: process.env.Redis_DB || 0,
});

redis.on("error", (err) => {
    process.log.error(err);
    process.exit(2);
});

/**
 * Get memory usage of the cache
 * @returns {Number}
 */
const getMemoryUsage = () => {
    return new Promise(async (resolve, reject) => {
        let memoryArray = await redis.memory("STATS");
        resolve(memoryArray[3]);
    })
}

/**
 * Delete all keys from the cache
 * @returns {String}
 */
const WipeCache = () => {
    return new Promise(async (resolve, reject) => {
        const stream = redis.scanStream({
            match: '*'
        });
        stream.on('data', function (keys) {
            // `keys` is an array of strings representing key names
            if (keys.length) {
                const pipeline = redis.pipeline();
                keys.forEach(function (key) {
                    pipeline.del(key);
                });
                pipeline.exec();
            }
        });
        stream.on('end', function () {
            resolve('Cleaned');
        });
    })
}

/**
 * Clean all key that are older than the given time
 * @param {Number} time
 * @returns {String}
 */
const ClearCache = (time) => {
    return new Promise(async (resolve, reject) => {
        const stream = redis.scanStream({
            match: '*'
        });
        stream.on('data', function (keys) {
            // `keys` is an array of strings representing key names
            if (keys.length) {
                keys.forEach(async function (key) {
                    const keydata = JSON.parse(await redis.get(key))
                    if("t" in keydata) {
                        if(keydata.t < time) {
                            redis.del(key);
                        }
                    }

                    if("time" in keydata) {
                        if(keydata.time < time) {
                            redis.del(key);
                        }
                    }
                });
            }
        });
        stream.on('end', function () {
            resolve('Cleaned');
        });
    })
}

/**
 * Add a Webtoken to the Cache
 * @param {String} webtoken 
 * @param {String} username 
 * @param {String} language 
 * @param {Array} permissions 
 * @param {String} browser 
 * @param {Object} time 
 */
const addWebtoken = (webtoken, username, language, permissions, browser, time) => {
    return new Promise(async (resolve, reject) => {
        await redis.set(`WT_${webtoken}`, JSON.stringify({
            username,
            language,
            permissions,
            browser,
            time
        }), "EX", process.env.WebTokenDurationH * 60 * 60);
        resolve();
    })
}

/**
 * @typedef {Object} WebtokenCacheResult
 * @property {String} username
 * @property {String} token
 * @property {String} ip
 * @property {String} browser
 * @property {Object} time
 */

/**
 * If the webtoken is missing from the cache, we have to check the persistant DB
 * @param {String} webtoken 
 * @returns {WebtokenCacheResult|Undefined}
 */
const getWebtokenSave = (token) => {
    return new Promise(async (resolve, reject) => {
        if (!token) return reject("No token provided");
        const inCache = await redis.exists(`WT_${token}`)
        if (inCache) {
            process.log.debug(`Webtoken Cach Hit on ${token}`)
            resolve(JSON.parse(await redis.get(`WT_${token}`)));
        } else {
            process.log.debug(`Webtoken Cach Miss on ${token}`)
            const dbResult = await webtoken.get(token)
            // To prevent the same cache miss, we add it to the cache
            if (dbResult.length === 1) {
                const PermissionsResponse = await user.permission.get(dbResult[0].username)
                const Formated_Permissions = formatSQLPermissions(PermissionsResponse.rows); // Format the permissions to a array
                addWebtoken(token, dbResult[0].username, dbResult[0].language, Formated_Permissions, dbResult[0].ip, dbResult[0].browser, dbResult[0].time)
                resolve({ ...dbResult[0], permissions: Formated_Permissions })
            } else {
                resolve(dbResult[0])
            }
        }
    })
}

/**
 * Removes a Webtoken from the Cache
 * @param {String} token 
 */
const delWebtoken = (token) => {
    redis.del(`WT_${token}`);
}

/**
 * Add a PSR record to the cache
 * @param {Number} routeID 
 * @param {String} type 
 * @param {String} data 
 * @param {Number} statusCode 
 * @param {Number} maxtime
 */
const addPublicStaticResponse = (routeID, type, data, statusCode, maxtime) => {
    redis.set(`PSR_${routeID}`, JSON.stringify({ type, data, time: new Date().getTime(), statusCode }), "EX", Math.ceil(maxtime / 1000));
}

/**
 * Get a PSR record from the cache but only returns it if it is not older than maxtime
 * @param {Number} routeID 
 * @param {Number} maxtime 
 * @returns {Object|Boolean}
 */
const getPublicStaticResponseSave = (routeID, maxtime) => {
    return new Promise(async (resolve, reject) => {
        if (!routeID) return reject("No routeID provided");
        if (!maxtime) return reject("No maxtime provided");
        if (await redis.exists(`PSR_${routeID}`)) {
            // Unlike in the loval driver, we do not need to check the time here, because the redis deletes the key itself
            const storedItem = JSON.parse(await redis.get(`PSR_${routeID}`));
            resolve(storedItem);
        } else {
            resolve(false);
        }
    });
}

/**
 * Add a pSR record to the cache
 * @param {Number} routeID 
 * @param {String} webtoken 
 * @param {String} type 
 * @param {String} data 
 * @param {Number} statusCode 
 * @param {Number} maxtime
 */
const addPrivateStaticResponse = (routeID, webtoken, type, data, statusCode, maxtime) => {
    redis.set(`pSR_${routeID}_${webtoken}`, JSON.stringify({ type, data, time: new Date().getTime(), statusCode }), "EX", Math.ceil(maxtime / 1000));
}

/**
 * Get a pSR record from the cache but only returns it if it is not older than maxtime
 * @param {Number} routeID 
 * @param {String} webtoken 
 * @param {Number} maxtime 
 * @returns {Object|Boolean}
 */
const getPrivateStaticResponseSave = (routeID, webtoken, maxtime) => {
    return new Promise(async (resolve, reject) => {
        if (!routeID) return reject("No routeID provided");
        if (!maxtime) return reject("No maxtime provided");
        if (await redis.exists(`pSR_${routeID}_${webtoken}`)) {
            // Unlike in the loval driver, we do not need to check the time here, because the redis deletes the key itself
            const storedItem = JSON.parse(await redis.get(`pSR_${routeID}_${webtoken}`));
            resolve(storedItem);
        } else {
            resolve(false);
        }
    });
}

/**
 * Increase the IPs request count, or add a new entry if it does not exist
 * Returns true if the IP is blocked
 * @param {String} ip 
 * @param {Number} cost 
 */
const IPLimit = (ip, cost = 1) => {
    return new Promise(async (resolve, reject) => {
        if (typeof cost !== 'number') throw new Error('Cost must be a number');
        if (cost < 0) throw new Error('Cost must be a positive number');
        // Check if the IP is in the cache
        if (!await redis.exists(`IPL_${ip}`)) {
            await redis.set(`IPL_${ip}`, JSON.stringify({ r: 0 + cost, t: new Date().getTime() }));
            resolve({result: false});
        } else {
            // IP is in the cache, increase the request count
            const current = JSON.parse(await redis.get(`IPL_${ip}`));
            if (current.r + cost < Number(process.env.DecreasePerMin)) {
                const reduced = ((new Date().getTime() - current.t) / (1000 * 60)) * Number(process.env.DecreasePerMin);
                // Reduce requests by the time passed but make sure its not below 0 and add the cost
                const newCount = Math.max(0, current.r - reduced) + cost;
                await redis.set(`IPL_${ip}`, JSON.stringify({ r: newCount, t: new Date().getTime() }));
                resolve({result: false});
            } else {
                const reduced = ((new Date().getTime() - current.t) / (1000 * 60)) * Number(process.env.DecreasePerMin);
                // Reduce requests by the time passed but make sure its not below 0 and add the cost
                const newCount = Math.max(0, current.r - reduced);
                await redis.set(`IPL_${ip}`, JSON.stringify({ r: newCount, t: new Date().getTime() }));
                // Calculate the time when the next request is possible
                const time = (((newCount - (Number(process.env.DecreasePerMin) - 1)) / Number(process.env.DecreasePerMin) * 60) * 1000).toFixed(0);
                resolve({ result: true, retryIn: time });
            }
        }
    });
}

/**
 * Returns true if the IP is blocked
 * @param {String} ip 
 * @returns 
 */
const IPCheck = (ip) => {
    return new Promise(async (resolve, reject) => {
        if (!await redis.exists(`IPL_${ip}`)) {
            resolve({result: false});
        } else {
            const current = JSON.parse(await redis.get(`IPL_${ip}`));
            const reduced = ((new Date().getTime() - current.t) / (1000 * 60)) * Number(process.env.DecreasePerMin);
            const newCount = Math.max(0, current.r - reduced);
            await redis.set(`IPL_${ip}`, JSON.stringify({ r: newCount, t: new Date().getTime() }));
            if (newCount < Number(process.env.DecreasePerMin) - 1) {
                resolve({result: false});
            } else {
                // Calculate the time when the next request is possible
                const time = (((newCount - (Number(process.env.DecreasePerMin) - 1)) / Number(process.env.DecreasePerMin) * 60) * 1000).toFixed(0);
                resolve({ result: true, retryIn: time });
            }
        }
    });
}

/**
 * Increase the limiters request count, or add a new entry if it does not exist
 * Returns true if the limiter is saturated
 * @param {String} key 
 * @param {Number} cost 
 */
const LimiterMiddleware = (key, cost = 1) => {
    return new Promise(async (resolve, reject) => {
        if (typeof cost !== 'number') throw new Error('Cost must be a number');
        if (cost < 0) throw new Error('Cost must be a positive number');
        // Check if the key is in the cache
        if (!await redis.exists(`LIM_${key}`)) {
            await redis.set(`LIM_${key}`, JSON.stringify({ r: 0 + cost, t: new Date().getTime() }));
            resolve({result: false});
        } else {
            // key is in the cache, increase the request count
            const current = JSON.parse(await redis.get(`LIM_${key}`));
            const reduced = ((new Date().getTime() - current.t) / (1000 * 60)) * Number(process.env.DecreasePerMin);
            if ((current.r - reduced) + cost < Number(process.env.DecreasePerMin)) {
                // Reduce requests by the time passed but make sure its not below 0 and add the cost
                const newCount = Math.max(0, current.r - reduced) + cost;
                await redis.set(`LIM_${key}`, JSON.stringify({ r: newCount, t: new Date().getTime() }));
                resolve({result: false});
            } else {
                // Reduce requests by the time passed but make sure its not below 0 and add the cost
                const newCount = Math.max(0, current.r - reduced);
                await redis.set(`LIM_${key}`, JSON.stringify({ r: newCount, t: new Date().getTime() }));
                // Calculate the time when the next request is possible
                const time = (((newCount - (Number(process.env.DecreasePerMin) - 1)) / Number(process.env.DecreasePerMin) * 60) * 1000).toFixed(0);
                resolve({ result: true, retryIn: time });
            }
        }
    });
}

module.exports = {
    ClearCache: ClearCache,
    WipeCache: WipeCache,
    getMemoryUsage: getMemoryUsage,
    addWebtoken: addWebtoken,
    getWebtokenSave: getWebtokenSave,
    delWebtoken: delWebtoken,
    addPublicStaticResponse: addPublicStaticResponse,
    getPublicStaticResponseSave: getPublicStaticResponseSave,
    addPrivateStaticResponse: addPrivateStaticResponse,
    getPrivateStaticResponseSave: getPrivateStaticResponseSave,
    IPLimit: IPLimit,
    IPCheck: IPCheck,
    LimiterMiddleware: LimiterMiddleware
}