"use strict";

var async = require("async");

module.exports = function(env, callback) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/read-config")
    ], function(err, result) {
        if(err) {
            return callback(err);
        }
        
        callback(null, result.config);
    });
};
