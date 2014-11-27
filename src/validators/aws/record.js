"use strict";

var joi = require("joi"),
    lib = require("../_lib");

// All keys are optional by default
module.exports = joi.object({
    Name : lib.str,
    Type : lib.type,
    TTL  : joi.number().integer(),
    Weight: joi.number().integer(),
    AliasTarget : {
        DNSName: lib.str.required(),
        EvaluateTargetHealth: joi.boolean().required(),
        HostedZoneId: lib.str.required()
    },
    Failover: joi.string().valid([ "PRIMARY", "SECONDARY" ]),
    GeoLocation: {
        ContinentCode: lib.continent,
        CountryCode: lib.str,
        SubdivisionCode: lib.str
    },
    HealthCheckId: lib.str,
    Region: lib.region,
    ResourceRecords: joi.array().includes({
        Value : lib.str.required()
    }),
    SetIdentifier: lib.str
});
