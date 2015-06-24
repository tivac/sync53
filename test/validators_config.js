"use strict";

var joi      = require("joi"),

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
                                        type  : "A",
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
                                        type  : "A",
                                        alias : {
                                            dns    : "thing.example.com",
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
                                        type  : "A",
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
                                    "thing.example.com" : {
                                        type   : "A",
                                        id     : "DFW",
                                        region : "us-west-1",
                                        alias  : "thing-a.example.com"
                                    }
                                }
                            }
                        }
                    });
                });

                it("should require an id for latency based routing", function() {
                    invalid({
                        zones : {
                            "example.com" : {
                                records : {
                                    "thing.example.com" : {
                                        type   : "A",
                                        region : "us-west-1",
                                        alias  : "thing-a.example.com"
                                    }
                                }
                            }
                        }
                    });
                });
                
                describe("gelocation routing", function() {
                    it("should support geolocation routing", function() {
                        valid({
                            zones : {
                                "example.com" : {
                                    records : {
                                        "geoloc.example.com" : {
                                            A  : "127.0.0.9",
                                            id : "europe",
                                            
                                            location : {
                                                continent : "EU"
                                            }
                                        },
                                        "geoloc2.example.com" : {
                                            A  : "127.0.0.10",
                                            id : "thailand",
                                            
                                            location : {
                                                country : "TH"
                                            }
                                        },
                                        "geoloc3.example.com" : {
                                            A  : "127.0.0.8",
                                            id : "washington",
                                            
                                            location : {
                                                country : "US",
                                                area    : "WA"
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });

                    it("shouldn't allow country/area with continent", function() {
                        invalid({
                            zones : {
                                "example.com" : {
                                    records : {
                                        "geoloc.example.com" : {
                                            A  : "127.0.0.9",
                                            id : "europe",
                                            
                                            location : {
                                                continent : "EU",
                                                country   : "FR"
                                            }
                                        }
                                    }
                                }
                            }
                        });
                        
                        invalid({
                            zones : {
                                "example.com" : {
                                    records : {
                                        "geoloc.example.com" : {
                                            A  : "127.0.0.9",
                                            id : "europe",
                                            
                                            location : {
                                                continent : "NA",
                                                area      : "WA"
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
                });

                it("should support weighted routing", function() {
                    valid({
                        zones : {
                            "example.com" : {
                                records : {
                                    "weighted.example.com" : {
                                        A      : "127.0.0.5",
                                        id     : "weight1",
                                        weight : 1
                                    }
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
            });
        });
    });
});
