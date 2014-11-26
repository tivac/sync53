"use strict";

var fs    = require("fs"),
    
    aws   = require("aws-sdk"),
    async = require("async"),

    validateAWS    = require("../validators/aws/"),
    validateConfig = require("../validators/config/"),
    transform = require("../transformers/aws-to-config");

function stripTrailingSpace(name) {
    return name.replace(/\.$/, "");
}

module.exports = function(env) {
    if(!env.secret || !env.key) {
        throw new Error("No AWS Key/Secret defined");
    }

    env.zones = env.zones.map(stripTrailingSpace);

    async.waterfall([
        function setupAWS(done) {
            var data = {},
                http = {};

            if(env.proxy) {
                http.proxy = env.proxy;
            }

            data.r53 = new aws.Route53({
                accessKeyId     : env.key,
                secretAccessKey : env.secret,
                sslEnabled      : true,
                logger          : env.verbose ? console : null,
                httpOptions     : http
            });

            done(null, data);
        },

        function getZones(data, done) {
            var completed = false,
                zones     = [],
                marker;

            async.until(
                function() {
                    return completed;
                },
                function listHostedZones(cb) {
                    data.r53.listHostedZones({
                        MaxItems : "5",
                        Marker   : marker
                    }, function(err, data) {
                        if(err) {
                            return cb(err);
                        }

                        zones = zones.concat(data.HostedZones);

                        marker    = data.NextMarker;
                        completed = !data.IsTruncated;

                        cb();
                    });
                },
                function(err) {
                    if(err) {
                        return done(err);
                    }

                    if(env.zones.length) {
                        zones = zones.filter(function(zone) {
                            var name = stripTrailingSpace(zone.Name);

                            return env.zones.some(function(test) {
                                return test === name;
                            });
                        });
                    }

                    data.zones = zones;

                    done(null, data);
                }
            );
            
        },

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
        transform
    ], function(err, zones) {
        if(err) {
            throw new Error(err);
        }
        
        if(env.output) {
            fs.writeFileSync(env.output, JSON.stringify(zones, null, 4), "utf8");
        } else {
            console.log(JSON.stringify(zones, null, 4));
        }
    });
};
