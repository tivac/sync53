"use strict";

var joi = require("joi"),
    lib = require("../_lib");

// All keys are optional by default
module.exports = joi.object().keys({
    type    : lib.type,
    records : [
        joi.array().includes(lib.str),
        lib.str
    ],
    
    // Alias record
    alias : joi.alternatives().try(
        joi.object().keys({
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
    location : joi.object().keys({
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
