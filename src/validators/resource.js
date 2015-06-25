"use strict";

var joi = require("joi");

module.exports = [
    // Records can be an array, or not
    joi.array().single().items(
        joi.string().ip(),
        joi.string().hostname(),
        joi.string()
    ),
    
    // Alias records are an object
    joi.object().keys({
        alias : [
            joi.string().hostname(),
            joi.object().keys({
                dns    : joi.string().hostname(),
                health : joi.boolean()
            })
            .requiredKeys("dns")
        ]
    })
]; 
