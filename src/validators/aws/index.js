"use strict";

var joi  = require("joi"),
    zone = require("./zone");

// All keys are optional by default
module.exports = function(data, done) {
    var schema = joi.array().includes(zone);

    joi.validate(data, schema, done);
};
