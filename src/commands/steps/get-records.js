"use strict";

var async = require("async");

module.exports = function getZoneRecords(data, done) {
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
            
            data.aws = zones;

            done(null, data);
        }
    );
};
