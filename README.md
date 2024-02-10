# Install Released Tool

[![Latest version](https://img.shields.io/npm/v/install-release-action) ![Dependency status](https://img.shields.io/librariesio/release/npm/install-release-action)](https://www.npmjs.com/package/install-release-action)

GitHub action for downloading, extracting, caching an executable from a GitHub release and putting it to PATH.

* Simple syntax with defaults according to the best performance and practices.
* Convenient version specification - `latest` or `X.Y.Z` or any [semantic version specification].
* An already unpacked version is cached to speed up the build pipeline.
* GitHub workflow token is used by default.

## Usage

Install jsonlint from the most recent release:

```yml
- uses: prantlf/install-release-action@v1
  with:
    repo: prantlf/v-jsonlint
```

Install jsonlint from the compatible patch release recent release:

```yml
- uses: prantlf/install-release-action@v1
  with:
    repo: prantlf/v-jsonlint
    version: ~0.0.1
```

The archive with the executable is expected to be:

    {name}-{platform}-{architecture}.zip

where:

* `{name}` is the name of the tool (executable)
* `{platform}` is the name of the target platform: `linux`, `macos` or `windows`
* `{architecture}` is the name of the target architecture: `aarch64` or `arm64` (64-bit ARM), `amd64`, `x86_64`, `x64` or `x86` (64-bit AMD)

## Inputs

The following parameters can be specified using the `with` object:

### repo

Type: `String`<br>

Specify the repository in the form `owner/name` to download the archive with the executable from. Mandatory.

### version

Type: `String`<br>
Default: `latest`

Specify the version of the executable to download and extract. It can be `latest` (the latest published semantic version), or a semantic version number, plain or in the form of a git tag (usually `vX.Y.Z`, but sometimes only `X.Y.Z`), or any [semantic version specification].

### name

Type: `String`<br>
Default: (inferred from platform archives)

Specify the name prefix of the archive to download and the name of the the executable to extract from it. If not specified, the first archive named `{name}-{platform}-{architecture}.zip` will be picked and the prefix `name` will be used.

### platforms

Type: `Map{String, String[]}`<br>
Default:

    darwin:macos
    linux:
    win32:windows

A map where keys are Node.js platforms and values are their aliases which will be recognised in names of the installation archives. The Node.js platform name itself doesn't have to be included in the aliases. This input is a multi-line string, where each line is a map entry. The kay is separated from the value by colon (:). Aliases are separated by commas (,).

### architectures

Type: `Map{String, String[]}`<br>
Default:

      arm64:aarch64
      x64:amd64,x86_64,x86

A map where keys are Node.js architectures and values are their aliases which will be recognised in names of the installation archives. The Node.js architectures name itself doesn't have to be included in the aliases. This input is a multi-line string, where each line is a map entry. The kay is separated from the value by colon (:). Aliases are separated by commas (,).

### use-cache

Type: `Boolean`<br>
Default: `true`

Set to `false` to ignore the cache and always perform the full installation by downloading and unpacking a binary.

### token

Type: `String`<br>
Default: `${{ github.token }}`

Authorization token to inspect releases and commits in the `{repo}` repository. Either a GitHub personal access token or the GitHub workflow token. If not provided, the environment variable `GITHUB_TOKEN` will be used as a fallback. And if even that is not set, the GitHub workflow token from the action-execution context will be used as default.

## Outputs

The following parameters can be accessed by the `github` context:

### version

Type: `String`<br>

The actually installed version of the executable, as returned by `{executable} -V`., for example: `1.0.0`.

### bin-path

Type: `String`<br>

The complete path to the directory with the extracted.

### exe-path

Type: `String`<br>

The complete path to the extracted executable.

### used-cache

Type: `Boolean`<br>

A boolean value indicating if the installation succeeded from the cache.

## License

Copyright (C) 2023 Ferdinand Prantl

Licensed under the [MIT License].

[MIT License]: http://en.wikipedia.org/wiki/MIT_License
[semantic version specification]: https://semver.org/
