"use strict";

var joi  = require("joi"),
    zone = require("./zone");

module.exports = joi.object().keys({
    zones : joi.object().pattern(/.+/, zone)
});
