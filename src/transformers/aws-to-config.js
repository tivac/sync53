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
            zone.records[dns] = zone.records[dns].map(function(record) {
                if(record.ttl && record.ttl === best) {
                    delete record.ttl;
                }
                
                return record;
            });
            
            return;
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
                type   = awsRecord.Type,
                record = {},
                resources;
            
            // Resources
            if(awsRecord.ResourceRecords.length) {
                resources = awsRecord.ResourceRecords.map(function(rec) {
                    return rec.Value;
                });

                // Can be string or array, depending on length
                record[type] = resources.length === 1 ?
                    resources[0] :
                    resources;
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
                // if there's no health check and it's not an S3 alias we can do this simply
                if(!obj.get(awsRecord, "AliasTarget.EvaluateTargetHealth") &&
                    obj.get(awsRecord, "AliasTarget.DNSName").indexOf("s3-website") !== 0) {
                        assign(awsRecord, "AliasTarget.DNSName", record, type + ".alias", fqdn.remove);
                } else {
                    // S3 websites have a region property
                    if(obj.get(awsRecord, "AliasTarget.DNSName").indexOf("s3-website") === 0) {
                        assign(awsRecord, "AliasTarget.DNSName", record, type + ".alias.region", function(dns) {
                            return /^s3-website-(.+)\.amazonaws\.com\.$/.exec(dns)[1];
                        });
                    } else {
                        // Otherwise just use a dns field
                        assign(awsRecord, "AliasTarget.DNSName", record, type + ".alias.dns", fqdn.remove);
                    }
                    
                    // Set HealthCheck boolean
                    assign(awsRecord, "AliasTarget.EvaluateTargetHealth", record, type + ".alias.health");
                }
            }

            // GeoLoc
            assign(awsRecord, "GeoLocation.ContinentCode", record, "location.continent");
            assign(awsRecord, "GeoLocation.CountryCode", record, "location.country");
            assign(awsRecord, "GeoLocation.SubdivisionCode", record, "location.area");
            
            // Adding another onto array
            if(Array.isArray(zone.records[name])) {
                zone.records[name].push(record);
                
                return;
            }

            // Convert single to array
            if(zone.records[name]) {
                zone.records[name] = [
                    zone.records[name],
                    record
                ];
                
                return;
            }

            // Simple assignment
            zone.records[name] = record;
        });
        
        zone = preferredTTL(zone, ttls);
        
        config.zones[fqdn.remove(awsZone.Name)] = zone;
    });

    return config;
};
