//const config                = require('./config/index.config.js');
const Cortex                = require('ion-cortex');
const ManagersLoader        = require('./loaders/ManagersLoader.js');


// const cache = require('./cache/cache.dbh')({
//     prefix: config.dotEnv.CACHE_PREFIX ,
//     url: config.dotEnv.CACHE_REDIS
// });

// const cortex = new Cortex({
//     prefix: config.dotEnv.CORTEX_PREFIX,
//     url: config.dotEnv.CORTEX_REDIS,
//     type: config.dotEnv.CORTEX_TYPE,
//     state: ()=>{
//         return {} 
//     },
//     activeDelay: "50ms",
//     idlDelay: "200ms",
// });


require('dotenv').config()
const os                               = require('os');
const pjson                            = require('./package.json');
const utils                            = require('./libs/utils');
const SERVICE_NAME                     = (process.env.SERVICE_NAME)? utils.slugify(process.env.SERVICE_NAME):pjson.name;
const USER_PORT                        = process.env.USER_PORT || 8080;
const ADMIN_PORT                       = process.env.ADMIN_PORT || 5222;
const ADMIN_URL                        = process.env.ADMIN_URL || `http://localhost:${ADMIN_PORT}`;
const ENV                              = process.env.ENV || "development";
const REDIS_URI                        = process.env.REDIS_URI || "redis://127.0.0.1:6379";

const CORTEX_REDIS                     = process.env.CORTEX_REDIS || REDIS_URI;
const CORTEX_PREFIX                    = process.env.CORTEX_PREFIX || 'none';
const CORTEX_TYPE                      = process.env.CORTEX_TYPE || SERVICE_NAME;
const OYSTER_REDIS                     = process.env.OYSTER_REDIS || REDIS_URI;
const OYSTER_PREFIX                    = process.env.OYSTER_PREFIX || 'none';

const CACHE_REDIS                      = process.env.CACHE_REDIS || REDIS_URI;
const CACHE_PREFIX                     = process.env.CACHE_PREFIX || `${SERVICE_NAME}:ch`;

const MONGO_URI                        = process.env.MONGO_URI || `mongodb://localhost:27017/${SERVICE_NAME}`;
const config                           = require(`./config/envs/${ENV}.js`);
const LONG_TOKEN_SECRET                = process.env.LONG_TOKEN_SECRET || null;
const SHORT_TOKEN_SECRET               = process.env.SHORT_TOKEN_SECRET || null;
const NACL_SECRET                      = process.env.NACL_SECRET || null;

if(!LONG_TOKEN_SECRET || !SHORT_TOKEN_SECRET || !NACL_SECRET) {
    throw Error('missing .env variables check index.config');
}

config.dotEnv = {
    SERVICE_NAME,
    ENV,
    CORTEX_REDIS,
    CORTEX_PREFIX,
    CORTEX_TYPE,
    OYSTER_REDIS,
    OYSTER_PREFIX,
    CACHE_REDIS,
    CACHE_PREFIX,
    MONGO_URI,
    USER_PORT,
    ADMIN_PORT,
    ADMIN_URL,
    LONG_TOKEN_SECRET,
    SHORT_TOKEN_SECRET,
};


const mongoDB = config.dotEnv.MONGO_URI? require('./connect/mongo')({
    uri: config.dotEnv.MONGO_URI
}):null;

const managersLoader = new ManagersLoader({config});
const managers = managersLoader.load();

managers.userServer.run();
