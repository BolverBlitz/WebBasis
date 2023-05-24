const { LimiterMiddleware } = require('@lib/cache')
const { TooManyRequests } = require('@lib/errors')

/**
 * Middleware to limit requests on routes
 * @param {Number} cost 
 * @returns 
 */
const limiter = (cost = 1) => {
    return async (req, res) => {
        try {
            let key;
            if (!req.authorization) {
                if (process.env.CloudFlare_Proxy === 'true' || process.env.CloudFlare_Proxy == true) {
                    key = req.headers['cf-connecting-ip'] || req.ip //This only works with cloudflare proxy
                } else {
                    key = req.headers['x-forwarded-for'] || req.ip //This only works without cloudflare
                }
            } else {
                key = req.authorization;
            }

            const rateLimit = await LimiterMiddleware(key, cost);

            if(rateLimit.result) throw new TooManyRequests('Too Many Requests', rateLimit.retryIn)

        } catch (error) {
            return error; // This will trigger global error handler as we are returning an Error
        }
    };
};

module.exports = {
    limiter
};