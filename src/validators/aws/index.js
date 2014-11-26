"use strict";

var joi  = require("joi"),
    zone = require("./zone");

// All keys are optional by default
module.exports = joi.array().includes(zone);
