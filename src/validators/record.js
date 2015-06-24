"use strict";

var joi   = require("joi"),

    lib   = require("./_lib"),
    types = require("../types");

// All keys are optional by default
module.exports = joi.object().keys({
        type : lib.type.optional(),
        
        // Alias record
        alias : [
            joi.object({
                dns    : lib.str,
                health : joi.boolean()
            }),
            joi.string().hostname()
        ],
        
        ttl : lib.ttl,
        
        // ID for multiple records using some form of prioritization (weighted, latency, geo, failover)
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
    // Every record must have either have some resource types defined or be an alias
    .xor(types.concat("alias"))
    // Region/Location/Weight routing require that an ID be set
    .with("region", "id")
    .with("location", "id")
    .with("weight", "id")
    // TTL must *not* be set if the record is an alias
    .without("alias", "ttl")
    // Check to ensure that resource-type keys are correct
    .pattern(
        new RegExp(types.join("|")),
        require("./resource")
    );
