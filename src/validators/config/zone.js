"use strict";

var joi    = require("joi"),
    record = require("./record"),
    lib    = require("../_lib");

// All keys are optional by default
module.exports = joi.object().keys({
    ttl     : lib.ttl,
    private : joi.boolean(),
    records : joi.object().pattern(/.+/, [
        joi.array().includes(record),
        record
    ])
});
