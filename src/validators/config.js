"use strict";

var joi = require("joi"),
    lib = require("./_lib");

module.exports = joi.object().keys({
    zones : joi.object().pattern(/.+/, joi.object({
        ttl     : lib.ttl,
        private : joi.boolean(),
        records : joi.object().pattern(
            /.+/,
            joi.array().single().items(require("./record"))
        )
    }))
});
