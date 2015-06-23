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

function assign(src, srcPath, tgt, tgtPath, fn) {
    // jshint maxparams:5
    var val = obj.get(src, srcPath);

    if(!val) {
        return;
    }
    
    if(typeof fn === "function") {
        val = fn(val);
    }

    obj.set(tgt, tgtPath, val);
}

function preferredTTL(zone, ttls) {
    var best;
    
    Object.keys(ttls).forEach(function(ttl) {
        if(ttls[ttl] > (ttls[best] || 0)) {
            best = ttl;
        }
    });
   
    if(typeof best === "undefined") {
        return zone;
    }
    
    zone.ttl = best;
    
    Object.keys(zone.records).forEach(function(dns) {
        if(Array.isArray(zone.records[dns])) {
            return zone.records[dns] = zone.records[dns].map(function(record) {
                if(record.ttl && record.ttl === best) {
                    delete record.ttl;
                }
                
                return record;
            });
        }
        
        if(zone.records[dns].ttl && zone.records[dns].ttl === best) {
            delete zone.records[dns].ttl;
        }
    });
    
    return zone;
}

module.exports = function(aws) {
    var config = {
            zones : {}
        };
    
    aws.forEach(function(awsZone) {
        var zone = {
                records : {}
            },
            ttls = {};

        assign(awsZone, "Config.PrivateZone", zone, "private");

        awsZone.Records.forEach(function(awsRecord) {
            var name   = fqdn.remove(awsRecord.Name),
                record = {},
                resources;
            
            // Resources
            if(awsRecord.ResourceRecords.length) {
                resources = awsRecord.ResourceRecords.map(function(rec) {
                    return rec.Value;
                });

                // Can be string or array, depending on length
                record[awsRecord.Type] = resources.length === 1 ?
                    resources[0] :
                    resources;
            }
            
            // No resources, so set the "type" field
            if(!(awsRecord.Type in record)) {
                record.type = awsRecord.Type;
            }
            
            // TTL
            if(awsRecord.TTL) {
                record.ttl = moment.duration(awsRecord.TTL, "seconds").humanize();
                
                if(!ttls[record.ttl]) {
                    ttls[record.ttl] = 0;
                }
                
                ttls[record.ttl]++;
            }
            
            // Sets
            assign(awsRecord, "SetIdentifier", record, "id");

            // Weight
            assign(awsRecord, "Weight", record, "weight");
            
            // Latency
            assign(awsRecord, "Region", record, "region");

            // Alias
            if(awsRecord.AliasTarget) {
                if(obj.get(awsRecord, "AliasTarget.EvaluateTargetHealth")) {
                    assign(awsRecord, "AliasTarget.DNSName", record, "alias.dns", fqdn.remove);
                    assign(awsRecord, "AliasTarget.EvaluateTargetHealth", record, "alias.health");
                } else {
                    record.alias = fqdn.remove(awsRecord.AliasTarget.DNSName);
                }
            }

            // GeoLoc
            assign(awsRecord, "GeoLocation.ContinentCode", record, "location.continent");
            assign(awsRecord, "GeoLocation.CountryCode", record, "location.country");
            assign(awsRecord, "GeoLocation.SubdivisionCode", record, "location.area");
            
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
        
        zone = preferredTTL(zone, ttls);
        
        config.zones[fqdn.remove(awsZone.Name)] = zone;
    });

    return config;
};
