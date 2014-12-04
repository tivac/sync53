"use strict";

var joi = require("joi"),
    lib = require("./_lib"),
    record;

record = joi.object({
    Name : lib.str,
    Type : lib.type,
        
    HealthCheckId : lib.str,
    ResourceRecords : joi.array().includes({
        Value : lib.str.required()
    }),
    
    // Alias
    AliasTarget : {
        DNSName : lib.str.required(),
        EvaluateTargetHealth : joi.boolean().required(),
        HostedZoneId : lib.str.required()
    },
    
    // TTL cannot be set for Alias records
    TTL : joi.number().integer()
        .when("AliasTarget", { is : joi.exist(), then : joi.forbidden() }),

    // Required for any routing strategies
    SetIdentifier : lib.str
        .when("Region",      { is : joi.exist(), then : lib.str.required() })
        .when("GeoLocation", { is : joi.exist(), then : lib.str.required() })
        .when("Weight",      { is : joi.exist(), then : lib.str.required() })
        .when("Failover",    { is : joi.exist(), then : lib.str.required() }),

    // Weight-based routing
    Weight : joi.number().integer(),
    
    // Failover-based routing
    Failover : joi.string().valid([ "PRIMARY", "SECONDARY" ]),
    
    // Geolocation routing
    GeoLocation : {
        ContinentCode : lib.continent,
        
        // Can't specify a country when continent is defined
        CountryCode : lib.str
            .when("ContinentCode", { is : joi.exist(), then : joi.forbidden() }),
        
        // Can't specify an area when country isn't defined
        SubdivisionCode : lib.str
            .when("CountryCode",   { is : joi.exist(), otherwise : joi.forbidden() })
    },

    // Latency-based routing
    Region : lib.region
});

module.exports = joi.array().includes(joi.object({
    HostedZoneId : joi.string().regex(/\/hostedzone\/.+/),
    ChangeBatch : {
        Comment : joi.string(),
        Changes : joi.array().includes({
            Action : joi.string().valid([ "CREATE", "DELETE", "UPSERT" ]),
            ResourceRecordSet : record
        })
    }
}));
