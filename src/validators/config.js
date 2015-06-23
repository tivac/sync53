"use strict";

var joi   = require("joi"),
    lib   = require("./_lib"),
    
    record = require("./_record");

module.exports = joi.object().keys({
    zones : joi.object().pattern(/.+/, joi.object({
        ttl     : lib.ttl,
        private : joi.boolean(),
        records : joi.object().pattern(
            /.+/,
            joi.array().items(record).single()
        )
    }))
});
