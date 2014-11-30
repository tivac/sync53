"use strict";

var async = require("async"),
    diff  = require("diff"),
    chalk = require("chalk");

module.exports = function(env) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/setup-aws"),
        require("./steps/read-config"),
        require("../validators/config/"),
        require("./steps/get-zones"),
        require("./steps/get-records"),
        function awsToObject(data, done) {
            var conf = {
                    aws : data.aws
                };
            
            require("../transformers/aws-to-config")(conf, function(err, conf) {
                if(err) {
                    return done(err);
                }
                
                data.remote = conf.config;
                data.local  = data.config;
                
                done(null, data);
            });
        },
        
        function compare(data, done) {
            var changes = diff.diffJson(data.remote, data.local),
                changed = 0;
            
            changes.forEach(function(change) {
                if(change.added || change.removed) {
                    process.stderr.write(chalk["bg" + (change.added ? "Green" : "Red")].bold.white(change.value));
                    changed++;
                } else {
                    process.stderr.write(chalk.dim(change.value));
                }
            });
            
            console.log("\n\n%d diff(s) found", changed);
            
            done();
        }
    ], function(err) {
        if(err) {
            throw new Error(err);
        }
    });
};