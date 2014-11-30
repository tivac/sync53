"use strict";

var async = require("async");

module.exports = function(env, done) {
    async.waterfall([
        function setup(done) {
            var data = {
                    env : env
                };
            
            done(null, data);
        },
        
        require("./steps/read-config"),
        
        require("../validators/config/")
    ], function(err, result) {
        if(err) {
            return done(new Error(err));
        }
        
        done(null, result.config);
    });
};
