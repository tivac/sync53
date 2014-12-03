"use strict";

module.exports = function compareConfigs(data, done) {
    data.local  = data.config;
    data.remote = require("../../transformers/aws-to-config")(data.aws);
    
    done(null, data);
};
