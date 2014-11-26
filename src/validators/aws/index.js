"use strict";

var joi    = require("joi"),
    record = require("./record"),
    lib    = require("./_lib");

// All keys are optional by default
module.exports = joi.object().keys({
    Id : joi.string().regex(/\/hostedzone\/.+/),
    Name : lib.str,
    CallerReference : lib.str,
    Config : joi.object().keys({
        Comment : joi.string(),
        PrivateZone : joi.boolean()
    }),
    Records : joi.array().includes(record)
});
