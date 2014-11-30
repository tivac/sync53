"use strict";

module.exports = function setupEnvFactory(env) {
    return function setupEnv(data, done) {
        if(typeof data === "function") {
            done = data;
            data = {};
        }
        
        data.env = env;
        
        done(null, data);
    };
};
