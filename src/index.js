"use strict";

exports.import = require("./commands/import");
exports.check  = require("./commands/check");
exports.diff   = require("./commands/diff");
exports.commit = require("./commands/commit");

exports.validators = {
    aws    : require("./validators/aws"),
    config : require("./validators/config"),
};

exports.transformers = {
    awsToConfig : require("./transformers/aws-to-config"),
    configToAws : require("./transformers/config-to-aws")
};
