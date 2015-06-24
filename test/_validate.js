"use strict";

var joi = require("joi");

function valid(schema, input) {
    var result = joi.validate(input, schema);
    
    if(result.error) {
        throw new Error(result.error);
    }
}

function invalid(schema, input) {
    var result = joi.validate(input, schema);
    
    if(!result.error) {
        throw new Error("Should have failed");
    }
}

module.exports = function(schema) {
    return {
        valid   : valid.bind(null, schema),
        invalid : invalid.bind(null, schema),
    };
};
