"use strict";

var async = require("async");

module.exports = function commitToAws(env) {
    async.waterfall([
        require("./steps/setup-env")(env),
        require("./steps/read-config"),
        require("../validators/config/"),
        require("./steps/setup-aws"),
        require("./steps/get-zones"),
        function convertConfig(data, done) {
            var changes = require("../transformers/config-to-aws")(data.config, data.zones);
            
            data.changes = changes;
            
            done(null, data);
        },
        
        // Ensure that aliases come last, in case they depend on records earlier in the batch
        function aliasesLast(data, done) {
            data.changes.forEach(function(changes) {
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
                data.changes,
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