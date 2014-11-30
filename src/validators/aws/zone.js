"use strict";

var joi    = require("joi"),
    record = require("./record");

// All keys are optional by default
module.exports = {
    HostedZoneId : joi.string().regex(/\/hostedzone\/.+/),
    ChangeBatch : {
        Comment : joi.string(),
        Changes : joi.array().includes({
            Action : joi.string().valid([ "CREATE", "DELETE", "UPSERT" ]),
            ResourceRecordSet : record
        })
    }
};
