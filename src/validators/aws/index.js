"use strict";

var joi  = require("joi"),
    zone = require("./zone");

module.exports = joi.array().includes(zone);
