"use strict";

var moment = require("moment"),
    object = require("object-path"),
    
    fqdn   = require("../fqdn"),
    types  = require("../types"),
    
    cloudFrontId = "Z2FDTNDATAQYW2";

function each(obj, fn) {
    var key;
    
    for(key in obj) {
        fn(obj[key], key);
    }
}

function setIfDefined(tgt, path, value) {
    if(typeof value !== "undefined") {
        object.set(tgt, path, value);
    }
}

// Turn TTL like "5 minutes"/"2 days"/"3 years" into seconds for AWS
function parseTTL(str) {
    var ttl = str.split(/(\d+) (\w+)/);
        
    return moment.duration(parseInt(ttl[1], 10), ttl[2]).asSeconds();
}

// Find AWS ID for this zone, we don't put it in the config
function findZone(zones, name) {
    var item;
    
    name = fqdn.add(name);
    
    zones.some(function(details) {
        if(name.indexOf(details.Name) > -1) {
            item = details;
        }
        
        return item;
    });
    
    return item;
}

// Find record type, either from .type or from a list of possible types
function findType(record) {
    var result;
    
    types.some(function(type) {
        if(type in record) {
            result = type;
        }
        
        return result;
    });
    
    return result;
}

module.exports = function(config, zones) {
    var changes = [];
    
    each(config.zones, function(zone, dns) {
        var aws = findZone(zones, dns).Id.replace("/hostedzone/", ""),
            params = {
                HostedZoneId : aws,
                ChangeBatch  : {
                    Comment : "sync53-generated change for '" + dns + "' on " + moment().toISOString(),
                    Changes : []
                }
            },
            ttl = parseTTL(zone.ttl || "5 minutes");
            
        each(zone.records, function(records, domain) {
            if(!Array.isArray(records)) {
                records = [ records ];
            }
            
            records.forEach(function(src) {
                var record = {},
                    change = {
                        Action            : "UPSERT",
                        ResourceRecordSet : record
                    },
                    alias;
                
                record.Name = domain;
                record.Type = findType(src);
                
                alias = src[record.Type].alias;
                
                // TTL only set for non-alias records, even if the zone has one
                if(!alias) {
                    record.TTL = src.ttl ? parseTTL(src.ttl) : ttl;
                }
                
                // Any sort of routing requires this
                setIfDefined(record, "SetIdentifier", src.id);
                
                // Latency-based routing
                setIfDefined(record, "Region", src.region);
                
                // Weight-based routing
                setIfDefined(record, "Weight", src.weight);
                
                // Failover-based routing
                setIfDefined(record, "Failover", src.failover);
                
                // GeoLocation-based routing
                if(src.location) {
                    record.GeoLocation = {};

                    setIfDefined(record, "GeoLocation.ContinentCode", src.location.continent);
                    setIfDefined(record, "GeoLocation.CountryCode", src.location.country);
                    setIfDefined(record, "GeoLocation.SubdivisionCode", src.location.area);
                }
                
                // Alias (exits early, since it has no resource records to iterate)
                if(alias) {
                    alias = typeof alias === "string" ? { dns : alias } : alias;
                    
                    record.AliasTarget = {
                        DNSName : alias.dns,
                        
                        EvaluateTargetHealth : !!alias.health,
                        
                        // This is gross, but cloudfront uses a hardcoded HostedZoneId
                        HostedZoneId : /cloudfront\.net/.test(alias.dns) ?
                            cloudFrontId :
                            aws
                    };
                    
                    return params.ChangeBatch.Changes.push(change);
                }
                
                // Resource records
                if(!Array.isArray(src[record.Type])) {
                    src[record.Type] = [ src[record.Type] ];
                }
                
                record.ResourceRecords = src[record.Type].map(function(value) {
                    return { Value : value };
                });
                
                params.ChangeBatch.Changes.push(change);
            });
        });
        
        changes.push(params);
    });

    return changes;
};
