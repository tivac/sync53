"use strict";

var async = require("async");

module.exports = function(env, done) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/read-config"),
        require("../validators/config/")
    ], function(err, result) {
        if(err) {
            return done(new Error(err));
        }
        
        done(null, result.config);
    });
};
