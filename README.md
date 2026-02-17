# setup-jena

GitHub Action to setup Apache Jena

## Usage

```yml
runs-on: ubuntu-latest
steps:
  - uses: actions/checkout@v6
  - uses: actions/setup-java@v5
    with:
      distribution: temurin
      java-version: 21
  - uses: foooomio/setup-jena@v4
    with:
      # The version of Apache Jena to be installed
      # Examples: 5.x, 5.6.0, latest
      # Default: latest
      jena-version: latest
  - run: sparql --version
```

## License

MIT License
