# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2023-08-12

## Changed

- If `fs.renameSync` fails (e.g. because source and destination files are on different partitions), try `fs.copySync` and `fs.unlinkSync` instead (#14).

## Fixed

- Re-enable npm run test in CI (#15).

- Fix release version check in unit test (#15).

- Add helper function for checking the latest releases in the unit tests (#15).

## [1.3.0] - 2023-05-19

## Changed

- Action now checks tool cache for installed version before querying Octokit (#5/#10)

## [1.2.0] - 2022-10-29

## Added

- `CAPSULE_LOG` is now set to 'none' for less verbose setup logs (#1/#2)

## Fixed

- Release list now paginates the API to find old versions of Nextflow (#3)

## [1.1.0] - 2022-06-15

### Changed

- JavaScript converted to TypeScript

## [1.0.1] - 2022-06-13

### Fixed

- JavaScript now compiled for appropriate use as GitHub action

## [1.0.0] - 2022-06-13

### Added

- NodeJS GitHub Action to download and install Nextflow
- GitHub Actions workflow to test Nextflow installation and downstream usage
- Documentation and license files

[unreleased]: https://github.com/nf-core/setup-nextflow/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/nf-core/setup-nextflow/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/nf-core/setup-nextflow/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/nf-core/setup-nextflow/compare/v1.1.1...v1.2.0
[1.1.0]: https://github.com/nf-core/setup-nextflow/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nf-core/setup-nextflow/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nf-core/setup-nextflow/releases/tag/v1.0.0
