"use strict";

var async = require("async"),
    diff  = require("diff2"),
    chalk = require("chalk");

module.exports = function(env) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/setup-aws"),
        require("./steps/read-config"),
        require("./steps/get-zones"),
        require("./steps/get-records"),
        function awsToObject(data, done) {
            data.local  = data.config;
            data.remote = require("../transformers/aws-to-config")(data.aws);
            
            done(null, data);
        },
        
        function compare(data, done) {
            var changes = diff.calculateDifferences(data.remote, data.local),
                removed = [];
            
            changes.forEach(function(change) {
                // Only care about deletes
                if(change.type !== "deleted") {
                    return;
                }
                
                // Only care about deletes of full records
                if(change.path[change.path.length - 2].key !== "records") {
                    return;
                }
                
                removed.push(change.path[change.path.length - 1].key);
            });
            
            if(!removed.length) {
                return done();
            }
            
            console.log("Found %d stale records in Route53\n", removed.length);
            
            removed.forEach(function(dns) {
                console.log(chalk.bgRed.bold(dns));
            });
            
            done();
        }
    ], function(err) {
        if(err) {
            throw new Error(err);
        }
    });
};
