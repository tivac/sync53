"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    async = require("async"),
    strip = require("strip-json-comments");

module.exports = function(env) {
    var file = path.resolve(process.cwd(), env.file),
        config;

    if(!fs.existsSync(file)) {
        throw new Error("Invalid config file path: " + file);
    }

    config = fs.readFileSync(file, "utf8");
    config = JSON.parse(strip(config));

    async.waterfall([
        function setup(done) {
            var data = {
                    env    : env,
                    config : config
                };
            
            done(null, data);
        },
        
        require("../validators/config/"),
        
        require("./steps/setup-aws"),
        require("./steps/get-zones"),

        require("../transformers/config-to-aws"),
        
        // Ensure that aliases come last, in case they depend on records earlier in the batch
        function aliasesLast(data, done) {
            data.aws.forEach(function(changes) {
                var aliases = [];
                
                changes.ChangeBatch.Changes = changes.ChangeBatch.Changes.filter(function(change) {
                    if("AliasTarget" in change.ResourceRecordSet) {
                        aliases.push(change);
                        
                        return false;
                    }
                    
                    return true;
                });
                
                changes.ChangeBatch.Changes = changes.ChangeBatch.Changes.concat(aliases);
            });
            
            done(null, data);
        },
        
        require("../validators/aws/"),
        
        function changeResourceRecordSets(data, done) {
            async.each(
                data.aws,
                function(change, cb) {
                    console.log(JSON.stringify(change, null, 4));
                    data.r53.changeResourceRecordSets(change, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        
                        console.log(data);
                        
                        cb();
                    });
                },
                done
            );
        }
    ], function(err, result) {
        if(err) {
            throw new Error(err);
        }

        console.log(result); //TODO: REMOVE DEBUGGING
    });
};
