"use strict";

var joi = require("joi"),
    lib = require("../_lib");

// All keys are optional by default
module.exports = joi.object().keys({
    type    : joi.string().valid([ "SOA", "A", "TXT", "NS", "CNAME", "MX", "PTR", "SRV", "SPF", "AAAA" ]).required(),
    id      : lib.str,
    ttl     : lib.ttl,
    records : joi.array().includes(lib.str).allowSingle(),
    region  : lib.region,
    alias   : joi.object().keys({
        id     : lib.str,
        dns    : lib.str,
        health : joi.boolean()
    })
});
