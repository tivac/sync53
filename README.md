sync53
======

Update Route53 the right way, with a text config file that you can version.

## Usage

```
  Usage: sync53 [options] [command]

  Commands:

    import [options] [zones...]  Import DNS information from Route53
    export <file> [zones...]     Write the config stored in file to Route53

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

## TODO

1. Add a `check` command to validate a local config file
2. Add a `cleanup` command to tell you which R53 records you should delete.
    - It will **not** automatically delete records (as a precaution).
3. Add a `--preview` option to preview changes that would be written in an `export` operation
