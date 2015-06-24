"use strict";

var joi = require("joi");

module.exports = joi.array().single().items(
    joi.string().ip(),
    joi.string().hostname(),
    joi.string()
); 
