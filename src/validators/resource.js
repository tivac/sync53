"use strict";

var joi = require("joi"),
    
    lib = require("./_lib");

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
                region : lib.region,
                dns    : joi.string().hostname(),
                health : joi.boolean()
            })
            .xor("dns", "region")
        ]
    })
]; 
