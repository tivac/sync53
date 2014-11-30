"use strict";

var joi  = require("joi"),
    zone = require("./zone");

module.exports = function(data, done) {
    var schema = joi.array().includes(zone);

    joi.validate(data.aws, schema, function(err) {
        if(err) {
            return done(err);
        }
        
        done(null, data);
    });
};
