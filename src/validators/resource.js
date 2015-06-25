"use strict";

var joi = require("joi");

module.exports = [
    joi.string().ip(),
    joi.string().hostname(),
    joi.string(),
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
