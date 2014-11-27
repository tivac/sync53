"use strict";

var fs    = require("fs"),
    path  = require("path"),
    
    async = require("async"),

    fqdn           = require("../fqdn"),
    validateAWS    = require("../validators/aws/"),
    validateConfig = require("../validators/config/"),
    transform      = require("../transformers/aws-to-config");

module.exports = function(env) {
    // Ensure that we compare against FQDN versions we get from R53
    env.zones = env.zones.map(fqdn.add);

    async.waterfall([
        function setup(done) {
            var data = {
                    env : env
                };
            
            done(null, data);
        },
        
        require("./steps/setup-aws"),
        require("./steps/get-zones"),

        function getZoneRecords(data, done) {
            async.map(
                data.zones,
                function requestRecords(zone, cb) {
                    var completed = false,
                        records   = [],
                        record;

                    async.until(
                        function() {
                            return completed;
                        },
                        function listResourceRecordSets(cb) {
                            data.r53.listResourceRecordSets({
                                HostedZoneId    : zone.Id,
                                MaxItems        : "50",
                                StartRecordName : record
                            }, function(err, data) {
                                if(err) {
                                    return cb(err);
                                }

                                records = records.concat(data.ResourceRecordSets);
                                
                                completed = !data.IsTruncated;
                                record    = data.NextRecordName;

                                cb();
                            });
                        },
                        function(err) {
                            if(err) {
                                return cb(err);
                            }

                            zone.Records = records;

                            cb(null, zone);
                        }
                    );
                },
                function(err, zones) {
                    if(err) {
                        return done(err);
                    }

                    done(null, zones);
                }
            );
        },

        validateAWS,
        transform,
        validateConfig,
    ], function(err, zones) {
        if(err) {
            throw new Error(err);
        }
        
        if(env.output) {
            fs.writeFileSync(
                path.resolve(process.cwd(), env.output),
                JSON.stringify(zones, null, 4),
                "utf8"
            );
        } else {
            console.log(JSON.stringify(zones, null, 4));
        }
    });
};
