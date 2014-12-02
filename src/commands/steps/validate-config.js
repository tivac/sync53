"use strict";

var joi = require("joi"),
    schema = require("../../validators/config");

module.exports = function(data, done) {
    joi.validate(data.config, schema, function(err) {
        if(err) {
            return done(err);
        }
        
        done(null, data);
    });
};
