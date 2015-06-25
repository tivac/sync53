"use strict";

var assert = require("assert"),
    fqdn   = require("../src/fqdn.js");
    
describe("lib", function() {
    describe("FQDN", function() {
        describe(".add()", function() {
            it("should add a trailing period", function() {
                var out = fqdn.add("tivac.com");
                
                assert.equal(out, "tivac.com.");
            });
        });
        
        describe(".remove()", function() {
            it("should remove a trailing period", function() {
                assert.equal(fqdn.remove("tivac.com."), "tivac.com");
            });
        });
    });
});
