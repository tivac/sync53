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
    describe("config", function() {
        describe("verbose", function() {
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
                        "fooga/wooga" : {}
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
            
            it("should support object records", function() {
                valid({
                    zones : {
                        "fooga.com" : {
                            records : {
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
                                "tooga.fooga.com" : {
                                    A : 100
                                }
                            }
                        }
                    } 
                });
                
                invalid({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "tooga.fooga.com" : {
                                    A : "fooga//wooga.com"
                                }
                            }
                        }
                    } 
                });
            });
            
            describe("alias records", function() {
                it("should support alias records", function() {
                    valid({
                        zones : {
                            "fooga.com" : {
                                records : {
                                    "tooga.fooga.com" : {
                                        type : "A",
                                        alias : "fooga.com"
                                    }
                                }
                            }
                        } 
                    });
                });
                
                it("should support alias records with a health check", function() {
                    valid({
                        zones : {
                            "fooga.com" : {
                                records : {
                                    "tooga.fooga.com" : {
                                        type : "A",
                                        alias : {
                                            dns : "thing.example.com",
                                            health : true
                                        }
                                    }
                                }
                            }
                        } 
                    });
                });
                
                it("should support alias records to cloudfront", function() {
                    valid({
                        zones : {
                            "fooga.com" : {
                                records : {
                                    "tooga.fooga.com" : {
                                        type : "A",
                                        alias : "123456asdfasd.cloudfront.net"
                                    }
                                }
                            }
                        } 
                    });
                });
            });
            
            describe("routing", function() {
                it("should support latency based routing", function() {
                    valid({
                        zones : {
                            "example.com" : {
                                records : {
                                    "thing.example.com" : [
                                        {
                                            type : "A",
                                            id : "DFW",
                                            region : "us-west-1",
                                            alias : "thing-a.example.com"
                                        },
                                        {
                                            type : "A",
                                            id : "FRA",
                                            region : "eu-west-1",
                                            alias : "thing-b.example.com"
                                        }
                                    ]
                                }
                            }
                        }
                    });
                });

                it("")

                it("should support geolocation based routing", function() {
                    valid({
                        zones : {
                            "example.com" : {
                                records : {
                                    "geoloc.example.com": [
                                        {
                                            A : "127.0.0.9",
                                            id: "europe",
                                            location : {
                                                continent : "EU"
                                            }
                                        },
                                        {
                                            A : "127.0.0.10",
                                            id : "thailand",
                                            location : {
                                                country : "TH"
                                            }
                                        },
                                        {
                                            A : "127.0.0.8",
                                            id : "washington",
                                            location : {
                                                country : "US",
                                                area : "WA"
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    });
                });

                it("should support weighted routing", function() {
                    valid({
                        zones : {
                            "example.com" : {
                                records : {
                                    "weighted.example.com": [
                                        {
                                            A : "127.0.0.5",
                                            id: "weight1",
                                            weight : 1
                                        },
                                        {
                                            A : "127.0.0.6",
                                            id: "weight10",
                                            weight : 10
                                        },
                                        {
                                            A : "127.0.0.7",
                                            id: "weight100",
                                            weight : 100
                                        }
                                    ]
                                }
                            }
                        }
                    });
                });
            });
        });
        
        describe("terse", function() {
            it("should support string records", function() {
                valid({
                    zones : {
                        "fooga.com" : {
                            records : {
                                "wooga.fooga.com" : "fooga"
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
});
