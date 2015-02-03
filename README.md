[sync53](http://sync53.com/)
======
[![Dependency Status](https://img.shields.io/david/tivac/sync53.svg)](https://david-dm.org/tivac/sync53)
[![DevDependency Status](https://img.shields.io/david/dev/tivac/sync53.svg)](https://david-dm.org/tivac/sync53#info=devDependencies)
[![NPM Version](https://img.shields.io/npm/v/sync53.svg)](https://www.npmjs.com/package/sync53)
[![NPM License](https://img.shields.io/npm/l/sync53.svg)](https://www.npmjs.com/package/sync53)
[![NPM Downloads](https://img.shields.io/npm/dm/sync53.svg)](https://www.npmjs.com/package/sync53)
---
Update Route53 the right way, with a text config file that you can version. Use your existing revision control & user permissions, then let the tool convert your human-understandable config into all the right AWS jargon.

## Install

```
npm install -g sync53
```

## Usage

```
  Usage: sync53 [options] [command]

  Commands:

    import [options] [<zones>...]  Import DNS information from Route53
    check <config>                 Validate <config>
    diff <config> [<zones>...]     Diff Route53 against <config>
    commit <config> [zones...]     Commit <config> to Route53
    clean <config> [<zones>...]    List stale records in Route53

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -v, --verbose          Verbose output
    --silent               Silent output (only errors)
    --proxy <proxy>        URL to proxy requests through
    -k, --key <key>        AWS Access Key
    -s, --secret <secret>  AWS Secret

```

If you define the `AWS_ACCESS_KEY_ID` &
`AWS_SECRET_ACCESS_KEY` in your environment you won't need to constantly specify them on the CLI.

`zones...` is available to optionally filter the zones being imported/exported, it does exact matching for now.

## Config Format

Running `sync53 import -o <file>` will give you a local JSON (with comment support) config file.

```js
{
    "zones" : {
        "example.com" : {
            // Records below that don't specify a `ttl` property will inherit this one
            "ttl" : "5 minutes",
            "records" : {
                // Simplest possible record, single resources IP
                "example.com" : {
                    "A" : "127.0.0.1"
                },
                
                // Records with multiple entries use an array
                "multiple.example.com" : {
                    "A" : [
                        "127.0.0.2",
                        "127.0.0.3",
                        "127.0.0.4"
                    ],
                    "ttl" : "10 days"
                },
                
                // Simple aliases to records in the same zone use a bare `alias` property
                // Since aliases can't be differentiated from a resource an
                // explicit type field is required
                "alias.example.com" : {
                    "type" : "A",
                    "alias" : "example.com"
                },
                
                // Multiple records for a single DNS entry are coalesced into an array
                "latency.example.com" : [{
                    ...
                }, {
                    ...
                }]
            }
        },
        
        "otherdomain.com" : { ... },
        "anotherone.net"  : { ... }
    }
}
```

(Other examples of available config options are available in the [examples folder](https://github.com/tivac/sync53/blob/master/examples/))

Changes made to this local config can then be written back to Route53 using `sync53 commit`.

## TODO

Tracked in the [issues](https://github.com/tivac/sync53/labels/TODO)

## License
```
The MIT License (MIT)

Copyright (c) 2014 Patrick Cavit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
