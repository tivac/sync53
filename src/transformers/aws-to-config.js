"use strict";

var moment = require("moment"),
    obj    = require("object-path"),

    fqdn   = require("../fqdn");

// Ensure that moment creates easily-parseable times
moment.locale("en", {
    relativeTime : {
        future : "%s",
        past   : "%s",
        s      : "1 second",
        ss     : "%d seconds",
        m      : "1 minute",
        mm     : "%d minutes",
        h      : "1 hour",
        hh     : "%d hours",
        d      : "1 day",
        dd     : "%d days",
        M      : "1 month",
        MM     : "%d months",
        y      : "1 year",
        yy     : "%d years"
    }
});

/*jshint maxparams:4 */
function assign(src, srcPath, tgt, tgtPath) {
    var val = obj.get(src, srcPath);

    if(!val) {
        return;
    }

    obj.set(tgt, tgtPath, val);
}

module.exports = function(data, done) {
    var config = {
            zones : {}
        };
    
    data.aws.forEach(function(awsZone) {
        var zone = {
                records : {}
            };

        assign(awsZone, "Config.PrivateZone", zone, "private");

        awsZone.Records.forEach(function(awsRecord) {
            var name   = fqdn.remove(awsRecord.Name),
                record = {
                    type : awsRecord.Type
                };
            
            // TTL
            if(awsRecord.TTL) {
                record.ttl = moment.duration(awsRecord.TTL, "seconds").humanize();
            }
            
            // Sets
            assign(awsRecord, "SetIdentifier", record, "id");

            // Weight
            assign(awsRecord, "Weight", record, "weight");
            
            // Latency
            assign(awsRecord, "Region", record, "region");

            // Alias
            assign(awsRecord, "AliasTarget.DNSName", record, "alias.dns");
            assign(awsRecord, "AliasTarget.EvaluateTargetHealth", record, "alias.health");

            // GeoLoc
            assign(awsRecord, "GeoLocation.ContinentCode", record, "location.continent");
            assign(awsRecord, "GeoLocation.CountryCode", record, "location.country");
            assign(awsRecord, "GeoLocation.SubdivisionCode", record, "location.area");

            if(awsRecord.ResourceRecords.length) {
                record.records = awsRecord.ResourceRecords.map(function(rec) {
                    return rec.Value;
                });

                // Can be string or array, depending on length
                if(record.records.length === 1) {
                    record.records = record.records[0];
                }
            }

            // Adding another onto array
            if(Array.isArray(zone.records[name])) {
                return zone.records[name].push(record);
            }

            // Convert single to array
            if(zone.records[name]) {
                return zone.records[name] = [
                    zone.records[name],
                    record
                ];
            }

            // Simple assignment
            zone.records[name] = record;
        });

        config.zones[fqdn.remove(awsZone.Name)] = zone;
    });

    data.config = config;

    done(null, data);
};
