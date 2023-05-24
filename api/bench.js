const Joi = require('joi');
const HyperExpress = require('hyper-express');
const { verifyRequest } = require('@middleware/verifyRequest');
const { plublicStaticCache, privateStaticCache } = require('@middleware/cacheRequest');
const { limiter } = require('@middleware/limiter');
const { timetable } = require('@lib/postgres');
const router = new HyperExpress.Router();

/* Plugin info*/
const PluginName = 'Benchmark'; //This plugins name
const PluginRequirements = []; //Put your Requirements and version here <Name, not file name>|Version
const PluginVersion = '0.0.1'; //This plugins version

const getTimetableSchema = Joi.object().keys({
    week: Joi.number().integer().min(1).max(2).required(),
});

router.get('/limcache', limiter(), plublicStaticCache(1000), async (req, res) => {
    try {
        res.status(200);
        res.send(`OK`)
    } catch (error) {
        throw error;
    }
});

router.get('/lim', limiter(), async (req, res) => {
    try {
        res.status(200);
        res.send(`OK`)
    } catch (error) {
        throw error;
    }
});

router.get('/cache', plublicStaticCache(1000), async (req, res) => {
    try {
        res.status(200);
        res.send(`OK`)
    } catch (error) {
        throw error;
    }
});

router.get('/', async (req, res) => {
    res.status(200);
    res.send(`OK`)
});

module.exports = {
    router: router,
    PluginName: PluginName,
    PluginRequirements: PluginRequirements,
    PluginVersion: PluginVersion,
};