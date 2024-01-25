# setup-jena

GitHub Action to setup Apache Jena

## Usage

```yml
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-java@v4
    with:
      distribution: temurin
      java-version: 17 # Jena4 requires Java 11+
  - uses: foooomio/setup-jena@v3
  - run: sparql --version
```

## Inputs

- `jena-version`: Optional. The version of Apache Jena to be installed. Example: `4.1.0`. Defaults to `latest`.

## License

MIT License
