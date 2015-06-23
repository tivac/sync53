"use strict";

var joi   = require("joi"),
    lib   = require("./_lib"),
    types = require("../types.js"),
    
    resources = joi.array().items(
        joi.string().ip(),
        joi.string().hostname()
    ).single(),
    
    record;

// All keys are optional by default
record = joi.object().keys({
    type      : lib.type.optional(),
    resources : resources,
    
    // Alias record
    alias : [
        joi.object({
            dns    : lib.str,
            health : joi.boolean()
        }),
        lib.str
    ],
    
    ttl : lib.ttl,
    
    // ID for multiple records using some form of prioritization (weighted, latency, geo, failover)
    id : lib.str,
    
    // Latency routing
    region  : lib.region,
    
    // Weight routing
    weight : joi.number().integer(),
    
    // Geolocation routing
    location : joi.object({
        continent : lib.continent,
        country : lib.str,
        area : lib.str
    })
    // Country/Area must *not* be set if continent is
    .without("continent", [ "country", "area" ])
});

record = record
    // Every record must have either a resources or alias
    .xor(types.concat("resources", "alias"))
    // Region/Location/Weight routing require that an ID be set
    .with("region", "id")
    .with("location", "id")
    .with("weight", "id")
    // TTL must *not* be set if the record is an alias
    .without("alias", "ttl");

// Add support for type as key for resources
record = record.pattern(
    new RegExp(types.join("|")),
    resources
);

// Also accepts a bare resources object
module.exports = [
    resources,
    record
];
