"use strict";

var moment = require("moment"),
    
    fqdn   = require("../fqdn");

function each(obj, fn) {
    var key;

    for(key in obj) {
        fn(obj[key], key);
    }
}

// Turn TTL like "5 minutes"/"2 days"/"3 years" into seconds for AWS
function parseTTL(str) {
    var ttl = str.split(/(\d+) (\w+)/);
        
    return moment.duration(parseInt(ttl[1], 10), ttl[2]).asSeconds();
}

function findZone(zones, name) {
    var item;
    
    name = fqdn.add(name);
    
    zones.some(function(details) {
        if(name.indexOf(details.Name) > -1) {
            item = details;
        }
        
        return item;
    });
    
    if(!item) {
        throw new Error("Unknown item: " + name);
    }
    
    return item;
}

module.exports = function(config, zones) {
    var changes = [];
    
    each(config.zones, function(zone, dns) {
        var aws = findZone(zones, dns),
            params = {
                HostedZoneId : aws.Id,
                ChangeBatch : {
                    Comment : "sync53-generated change on " + moment().toISOString(),
                    Changes : []
                }
            },
            ttl = parseTTL(zone.ttl || "5 minutes");
            
        each(zone.records, function(records, domain) {
            if(!Array.isArray(records)) {
                records = [ records ];
            }
            
            records.forEach(function(config) {
                var record = {},
                    change = {
                        Action : "UPSERT",
                        ResourceRecordSet : record
                    };
                
                record.Name = domain;
                record.Type = config.type;
                
                // TTL only set for non-alias records, even if the zone has one
                if(!config.alias) {
                    record.TTL = config.ttl ? parseTTL(config.ttl) : ttl;
                }
                
                // Any sort of routing requires this
                record.SetIdentifier = config.id;
                
                // Latency-based routing
                record.Region = config.region;
                
                // Weight-based routing
                record.Weight = config.weight;
                
                // Failover-based routing
                record.Failover = config.failover;
                
                // GeoLocation-based routing
                if(config.location) {
                    record.GeoLocation = {
                        ContinentCode : config.location.continent,
                        CountryCode : config.location.country,
                        SubdivisionCode : config.location.area
                    };
                }
                
                // Alias (exits early, since it has no resource records to iterate)
                if(config.alias) {
                    record.AliasTarget = {
                        DNSName : config.alias.dns,
                        HostedZoneId : findZone(zones, config.alias.dns).Id.replace("/hostedzone/", ""),
                        EvaluateTargetHealth : !!config.alias.health
                    };
                    
                    return params.ChangeBatch.Changes.push(change);
                }
                
                // Resource records (not required, Aliases don't have 'em)
                if(!Array.isArray(config.records)) {
                    config.records = [ config.records ];
                }
                
                record.ResourceRecords = config.records.map(function(value) {
                    return { Value : value };
                });
                
                params.ChangeBatch.Changes.push(change);
            });
        });
        
        changes.push(params);
    });

    return changes;
};
