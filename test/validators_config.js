"use strict";

var assert   = require("assert"),

    joi      = require("joi"),

    schema = require("../src/validators/config.js");

function valid(input) {
    var result = joi.validate(input, schema);
    
    if(result.error) {
        throw new Error(result.error);
    }
}

function invalid(input) {
    var result = joi.validate(input, schema);
    
    if(!result.error) {
        throw new Error("Should have failed");
    }
}

describe("validators", function() {
    describe.only("config", function() {
        it("should support empty zones", function() {
            valid({
                zones : {
                    "fooga.com" : {}
                }  
            });
            
            valid({
                zones : {
                    "fooga.com" : {},
                    "booga.com" : {}
                }
            });
        });
        
        it.skip("should require that zones be a valid domain", function() {
            valid({
                zones : {
                    "fooga" : {}
                }
            });
        });
        
        it("should only allow specific zone keys", function() {
            invalid({
                zones : {
                    "fooga.com" : {
                        wooga : true
                    }
                }
            });
            
            invalid({
                zones : {
                    "fooga.com" : {
                        ttl   : "5 minutes",
                        wooga : true
                    }
                }
            });
        });
        
        it("should let records be a string or an object", function() {
            valid({
                zones : {
                    "fooga.com" : {
                        records : {
                            "wooga.fooga.com" : "fooga",
                            "tooga.fooga.com" : {
                                A : "wooga"
                            }
                        }
                    }
                } 
            });
        });
        
        it("should support records being an array", function() {
            valid({
                zones : {
                    "fooga.com" : {
                        records : {
                            "tooga.fooga.com" : {
                                A : [
                                    "wooga",
                                    "booga"
                                ]
                            }
                        }
                    }
                } 
            });
        });
        
        it("should fail records that aren't an IP or hostname", function() {
            invalid({
                zones : {
                    "fooga.com" : {
                        records : {
                            "tooga.fooga.com" : 100
                        }
                    }
                } 
            });
            
            invalid({
                zones : {
                    "fooga.com" : {
                        records : {
                            "tooga.fooga.com" : "fooga//wooga.com"
                        }
                    }
                } 
            });
        });
        
        it("should allow aliases w/o a type", function() {
            valid({
                zones : {
                    "fooga.com" : {
                        records : {
                            "tooga.fooga.com" : {
                                alias : "fooga.wooga.com"
                            }
                        }
                    }
                } 
            });
        })
    });
});
