"use strict";

var joi  = require("joi"),
    zone = require("./zone");

module.exports = function(data, done) {
    var schema = joi.object().keys({
            zones : joi.object().pattern(/.+/, zone)
        });

    joi.validate(data, schema, done);
};
