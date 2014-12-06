"use strict";

var async = require("async"),
    diff  = require("diff"),
    chalk = require("chalk");

module.exports = function(env, callback) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/setup-aws"),
        require("./steps/read-config"),
        require("./steps/get-zones"),
        require("./steps/get-records"),
        require("./steps/compare-prep"),
        
        function compare(data, done) {
            var changes = diff.diffJson(data.remote, data.local),
                changed = 0;
            
            // Only show text diff if it would mean anything
            if(changes.length > 1) {
                changes.forEach(function(change) {
                    if(change.added || change.removed) {
                        process.stderr.write(chalk["bg" + (change.added ? "Green" : "Red")].bold.white(change.value));
                        changed++;
                    } else {
                        process.stderr.write(chalk.dim(change.value));
                    }
                });

                console.log("\n");
            }
            
            process.stderr.write(changed + " diff(s) found");
            
            done();
        }
    ], callback);
};
