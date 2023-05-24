const { getWebtokenSave } = require("@lib/cache");
const bcrypt = require('bcrypt');

/**
 * Will check if a Token is valid
 * @param {String} Token Token 
 * @param {String} browser Browser
 * @param {String} ip ip
 * @returns {Promise}
 */
const checkWebToken = function (Token, browser, ip) {
    return new Promise(async (resolve, reject) => {
        try {
            const webtokenRespone = await getWebtokenSave(Token)
            if (!webtokenRespone) resolve({ State: false, DidExist: false })
            const DBTime = new Date(webtokenRespone.time).getTime() + parseInt(process.env.WebTokenDurationH, 10) * 60 * 60 * 1000
            //Check if Token isn´t too old
            if (DBTime < new Date().getTime()) resolve({ State: false, DidExist: true })
            //Check if Browser is the same
            if (browser !== webtokenRespone.browser) resolve({ State: false, DidExist: true })
            //Check if IP is the same
            let ipCompare;
            if (process.env.HashIPSalts != 0) {
                ipCompare = await bcrypt.compare(ip, webtokenRespone.ip)
            } else {
                ipCompare = ip === webtokenRespone.ip
            }
            if (!ipCompare) resolve({ State: false, DidExist: true })
            resolve({ State: true, Data: webtokenRespone })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    checkWebToken
};