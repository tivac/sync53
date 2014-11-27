"use strict";

var joi = require("joi"),
    lib = require("../_lib");

// All keys are optional by default
module.exports = joi.object({
    Name : lib.str,
    Type : lib.type,
    TTL  : joi.number().integer(),
    HealthCheckId : lib.str,
    ResourceRecords : joi.array().includes({
        Value : lib.str.required()
    }),
    
    // Alias
    AliasTarget : joi.object().keys({
        DNSName : lib.str.required(),
        EvaluateTargetHealth : joi.boolean().required(),
        HostedZoneId : lib.str.required()
    }),

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
    GeoLocation : joi.object().keys({
        ContinentCode : lib.continent,
        
        // Can't specify a country when continent is defined
        CountryCode : lib.str
            .when("ContinentCode", { is : joi.exist(), then : joi.forbidden() }),
        
        // Can't specify an area when country isn't defined
        SubdivisionCode : lib.str
            .when("CountryCode",   { is : joi.exist(), otherwise : joi.forbidden() })
    }),

    // Latency-based routing
    Region : lib.region
});
