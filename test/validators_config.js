"use strict";

var ok = require("./_validate")(require("../src/validators/config.js"));

describe("validators", function() {
    describe("config", function() {
        it("should support empty zones", function() {
            ok.valid({
                zones : {
                    "fooga.com" : {}
                }  
            });
            
            ok.valid({
                zones : {
                    "fooga.com" : {},
                    "booga.com" : {}
                }
            });
        });
        
        it.skip("should require that zones be a valid domain", function() {
            ok.valid({
                zones : {
                    "fooga/wooga" : {}
                }
            });
        }); 
        
        it("should only allow specific zone keys", function() {
            ok.invalid({
                zones : {
                    "fooga.com" : {
                        wooga : true
                    }
                }
            });
            
            ok.invalid({
                zones : {
                    "fooga.com" : {
                        ttl   : "5 minutes",
                        wooga : true
                    }
                }
            });
        });
        
        
    });
});
