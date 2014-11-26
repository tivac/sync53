"use strict";

var joi = require("joi");

exports.str = joi.string().min(1);
exports.ttl = joi.string().regex(/\d+ \w+/i);

exports.type = joi.string().valid([
    "SOA",
    "A",
    "TXT",
    "NS",
    "CNAME",
    "MX",
    "PTR",
    "SRV",
    "SPF",
    "AAAA"
]).required();

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
