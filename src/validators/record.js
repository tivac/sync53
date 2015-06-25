"use strict";

var joi   = require("joi"),

    lib   = require("./_lib"),
    types = require("../types");

// All keys are optional by default
module.exports = joi.object().keys({
        ttl : lib.ttl,
        
        // ID for multiple records using some form of prioritization
        // (weighted, latency, geo, failover)
        id : lib.str,
        
        // Latency routing
        region : lib.region,
        
        // Weight routing
        weight : joi.number().integer(),
        
        // Geolocation routing
        location : joi.object({
                continent : lib.continent,
                country   : lib.str,
                area      : lib.str
            })
            // Country/Area must *not* be set if continent is
            .without("continent", [ "country", "area" ])
    })
    // Every record must have either have a resource type
    .xor(types)
    // Region/Location/Weight routing require that an ID be set
    .with("region", "id")
    .with("location", "id")
    .with("weight", "id")
    // Check to ensure that resource-type keys are correct
    .pattern(
        new RegExp(types.join("|")),
        require("./resource")
    );
