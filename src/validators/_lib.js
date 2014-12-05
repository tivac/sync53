"use strict";

var joi = require("joi"),
    types = require("../types.js");

exports.str = joi.string().min(1);
exports.ttl = joi.string().regex(/\d+ \w+/i);

exports.type = joi.string().valid(types).required();

exports.region = joi.string().valid([
    "us-east-1",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-central-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "sa-east-1",
    "cn-north-1"
]);

exports.continent = joi.string().valid([
    "AF",
    "AN",
    "AS",
    "EU",
    "OC",
    "NA",
    "SA"
]);
