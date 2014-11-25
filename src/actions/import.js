"use strict";

var aws = require("aws-sdk"),
    async = require("async");

module.exports = function(env) {
    if(!env.secret || !env.key) {
        throw new Error("No AWS Key/Secret defined");
    }

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
                logger          : console,
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

                            zone.records = records;

                            cb(null, zone);
                        }
                    );
                },
                function(err, zones) {
                    if(err) {
                        return done(err);
                    }

                    data.zones = zones;

                    done(null, data);
                }
            );
        }
    ], function(err, data) {
        console.log(err); //TODO: REMOVE DEBUGGING
        console.log(JSON.stringify(data.zones, null, 4)); //TODO: REMOVE DEBUGGING
    });
};
