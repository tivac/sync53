"use strict";

var joi  = require("joi"),
    lib    = require("./_lib"),
    
    resources = joi.array().includes(lib.str).single(),
    record;

// All keys are optional by default
record = joi.object().keys({
    type      : lib.type.optional(),
    resources : resources,
    
    // Alias record
    alias : joi.alternatives().try(
        joi.object({
            id     : lib.str,
            dns    : lib.str,
            health : joi.boolean()
        }),
        lib.str
    ),
    
    // TTL cannot be set for Alias records
    ttl : lib.ttl
        .when("alias", { is : joi.exist(), then : joi.forbidden() }),
    
    // ID for multiple records using some form of prioritization (weighted, latency, geo, failover)
    id : lib.str
        .when("region",   { is : joi.exist(), then : lib.str.required() })
        .when("location", { is : joi.exist(), then : lib.str.required() })
        .when("weight",   { is : joi.exist(), then : lib.str.required() }),
    
    // Latency routing
    region  : lib.region,
    
    // Weight routing
    weight : joi.number().integer(),
    
    // Geolocation routing
    location : joi.object({
        continent : lib.continent,
        
        // Can't specify a country when continent is defined
        country : lib.str
            .when("continent", { is : joi.exist(), then : joi.forbidden() }),
        
        // Can't specify an area when country isn't defined
        area : lib.str
            .when("country",   { is : joi.exist(), otherwise : joi.forbidden() })
    })

    // TODO: support failover routing
});

// Add support for type as key for resources
record = record.pattern(
    /SOA|A|TXT|NS|CNAME|MX|PTR|SRV|SPF|AAAA/,
    resources
);

module.exports = joi.object().keys({
    zones : joi.object().pattern(/.+/, joi.object({
        ttl     : lib.ttl,
        private : joi.boolean(),
        records : joi.object().pattern(/.+/, joi.array().includes(record).single())
    }))
});
