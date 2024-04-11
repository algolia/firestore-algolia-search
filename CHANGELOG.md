# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.2.3](https://github.com/algolia/firestore-algolia-search/compare/v1.2.2...v1.2.3) (2024-04-11)


### Bug Fixes

* change doc to use path ([42c6f95](https://github.com/algolia/firestore-algolia-search/commit/42c6f9512a3c3cc9ac0278f915c64454e3a99b6d))

### [1.2.2](https://github.com/algolia/firestore-algolia-search/compare/v1.2.1...v1.2.2) (2024-03-20)

### Bug Fixes

* update logger to obfuscated config to prevent api key from being outputted in logs

### [1.2.1](https://github.com/algolia/firestore-algolia-search/compare/v1.2.0...v1.2.1) (2024-02-13)

### Features

* Add configuration input to allow users to set a firebase property as objectID in Algolia
* Update README to reflect changes
* Add logic to extract JS to use the alternative record id if it is set
* Add test for this change

## [1.2.0](https://github.com/algolia/firestore-algolia-search/compare/v1.1.5...v1.2.0) (2023-12-04)

### Features

* Add configuration input to allow users to set a firebase property as objectID in Algolia
* Update README to reflect changes
* Add logic to extract JS to use the alternative record id if it is set
* Add test for this change

## [1.2.0](https://github.com/algolia/firestore-algolia-search/compare/v1.1.5...v1.2.0) (2023-12-04)

### Features

* implement query cursors ([#182](https://github.com/algolia/firestore-algolia-search/issues/182)) ([c7c17ac](https://github.com/algolia/firestore-algolia-search/commit/c7c17ac3bc4c32d163d02d10d6eb0aad5496a429))

### [1.1.5](https://github.com/algolia/firestore-algolia-search/compare/v1.1.4...v1.1.5) (2023-11-10)

* refactor: update runtime to node18
* refactor: update libraries to remove vulnerabilities


### [1.1.4](https://github.com/algolia/firestore-algolia-search/compare/v1.1.3...v1.1.4) (2023-10-05)

### Features

* add database field to configuration to select another database other than default


### [1.1.3](https://github.com/algolia/firestore-algolia-search/compare/v1.1.2...v1.1.3) (2023-06-03)


### Bug Fixes

* add subcollection support for full indexing ([b5ce70e](https://github.com/algolia/firestore-algolia-search/commit/b5ce70e203adceeaedd093808ff7c6541f8c6714))

### [1.1.2](https://github.com/algolia/firestore-algolia-search/compare/v1.1.1...v1.1.2) (2023-05-31)


### Bug Fixes

* boolean for force update and full indexing ([28f2408](https://github.com/algolia/firestore-algolia-search/commit/28f240897dc3a547f0f77ce757ce80b4207dc21f))

### [1.1.1](https://github.com/algolia/firestore-algolia-search/compare/v1.1.0...v1.1.1) (2023-05-25)
### Bug Fixes

* use qualified full indexing function name ([0fde7c2](https://github.com/algolia/firestore-algolia-search/commit/0fde7c2cb9f971090781a3431a608eb6531a6419))

## [1.1.0](https://github.com/algolia/firestore-algolia-search/compare/v0.5.16...v1.1.0) (2023-05-11)


### Features

* add full index ([85ac65c](https://github.com/algolia/firestore-algolia-search/commit/85ac65c19cd308fa92aeef5706cfda6b821f05a0))
* update firestore libs ([d8263a8](https://github.com/algolia/firestore-algolia-search/commit/d8263a8e8c10b6afcf968a6afa98cec488864e7c))


### Bug Fixes

* eslint errors ([0bb1b02](https://github.com/algolia/firestore-algolia-search/commit/0bb1b025cadb640cf392ee1f023842e749a642bb))
* full index ([8d3332e](https://github.com/algolia/firestore-algolia-search/commit/8d3332e3e294d6b23e0373fa8ee5206d72b17cfc))
* issues with processor.ts ([737204a](https://github.com/algolia/firestore-algolia-search/commit/737204a0bfeb311f03fc8ece18e5cba716933136))
* merge dependicies form devDepencies ([fff7993](https://github.com/algolia/firestore-algolia-search/commit/fff799358501867bab840c5d8781b90ab825ab11))
* removing cli.js and algolia-firestore func ref ([7c7a4f2](https://github.com/algolia/firestore-algolia-search/commit/7c7a4f2e15121882a0d3fbd63817108a348cab1b))
* removing default extension to support mutli devs ([4e83d4f](https://github.com/algolia/firestore-algolia-search/commit/4e83d4f5b50b6c8360649c88c74fe5c5b2fb4ae8))
* update code for full indexing process ([21c633d](https://github.com/algolia/firestore-algolia-search/commit/21c633da6ddc5b81d5a1bad5b0a7de6dd91d60d4))
* update create test ([5f5e5c4](https://github.com/algolia/firestore-algolia-search/commit/5f5e5c438e3efc1d226c2848700345b651f38e6e))
* update json file to work emulator ([0f1e2dd](https://github.com/algolia/firestore-algolia-search/commit/0f1e2dd8d0e6788049ec320af2cc36d13707a926))
* updating package prepare ([ea62d34](https://github.com/algolia/firestore-algolia-search/commit/ea62d34b3340a30ea1dd6b6f8ebbd5cbd565616f))

### [0.5.18](https://github.com/algolia/firestore-algolia-search/compare/v0.5.16...v0.5.18) (2023-04-20)


### Features

* add full index ([85ac65c](https://github.com/algolia/firestore-algolia-search/commit/85ac65c19cd308fa92aeef5706cfda6b821f05a0))
* update firestore libs ([d8263a8](https://github.com/algolia/firestore-algolia-search/commit/d8263a8e8c10b6afcf968a6afa98cec488864e7c))


### Bug Fixes

* eslint errors ([0bb1b02](https://github.com/algolia/firestore-algolia-search/commit/0bb1b025cadb640cf392ee1f023842e749a642bb))
* issues with processor.ts ([737204a](https://github.com/algolia/firestore-algolia-search/commit/737204a0bfeb311f03fc8ece18e5cba716933136))
* merge dependicies form devDepencies ([fff7993](https://github.com/algolia/firestore-algolia-search/commit/fff799358501867bab840c5d8781b90ab825ab11))
* removing cli.js and algolia-firestore func ref ([7c7a4f2](https://github.com/algolia/firestore-algolia-search/commit/7c7a4f2e15121882a0d3fbd63817108a348cab1b))
* removing default extension to support mutli devs ([4e83d4f](https://github.com/algolia/firestore-algolia-search/commit/4e83d4f5b50b6c8360649c88c74fe5c5b2fb4ae8))
* update code for full indexing process ([21c633d](https://github.com/algolia/firestore-algolia-search/commit/21c633da6ddc5b81d5a1bad5b0a7de6dd91d60d4))
* update create test ([5f5e5c4](https://github.com/algolia/firestore-algolia-search/commit/5f5e5c438e3efc1d226c2848700345b651f38e6e))
* update json file to work emulator ([0f1e2dd](https://github.com/algolia/firestore-algolia-search/commit/0f1e2dd8d0e6788049ec320af2cc36d13707a926))
* updating package prepare ([ea62d34](https://github.com/algolia/firestore-algolia-search/commit/ea62d34b3340a30ea1dd6b6f8ebbd5cbd565616f))

### [0.5.17](https://github.com/algolia/firestore-algolia-search/compare/v0.5.16...v0.5.17) (2023-04-03)


### Features

* add full index ([85ac65c](https://github.com/algolia/firestore-algolia-search/commit/85ac65c19cd308fa92aeef5706cfda6b821f05a0))
* update firestore libs ([d8263a8](https://github.com/algolia/firestore-algolia-search/commit/d8263a8e8c10b6afcf968a6afa98cec488864e7c))


### Bug Fixes

* issues with processor.ts ([737204a](https://github.com/algolia/firestore-algolia-search/commit/737204a0bfeb311f03fc8ece18e5cba716933136))
* merge dependicies form devDepencies ([fff7993](https://github.com/algolia/firestore-algolia-search/commit/fff799358501867bab840c5d8781b90ab825ab11))
* update code for full indexing process ([21c633d](https://github.com/algolia/firestore-algolia-search/commit/21c633da6ddc5b81d5a1bad5b0a7de6dd91d60d4))
* update create test ([5f5e5c4](https://github.com/algolia/firestore-algolia-search/commit/5f5e5c438e3efc1d226c2848700345b651f38e6e))

### [0.5.16](https://github.com/algolia/firestore-algolia-search/compare/v0.5.15...v0.5.16) (2022-11-08)


### Bug Fixes

* some vulnerabilities issues ([a72ff3d](https://github.com/algolia/firestore-algolia-search/commit/a72ff3d722d52c340abd6da679a1d3befcd6f6be))

### [0.5.15](https://github.com/algolia/firestore-algolia-search/compare/v0.5.14...v0.5.15) (2022-10-28)


### Bug Fixes

* add compliled import ([481bb7a](https://github.com/algolia/firestore-algolia-search/commit/481bb7adbd314723c386f38daef1878e58a08cc0))
* remove exit function to allow async to complete ([c7f207c](https://github.com/algolia/firestore-algolia-search/commit/c7f207c936f71cfe65b2ce21bbea720416aeab61))

### [0.5.14](https://github.com/algolia/firestore-algolia-search/compare/v0.5.13...v0.5.14) (2022-09-08)


### Bug Fixes

* remove null attributes from index record ([e297e27](https://github.com/algolia/firestore-algolia-search/commit/e297e27e28c8cda6cc6dd274f2bafbbc775781c7))

### [0.5.13](https://github.com/algolia/firestore-algolia-search/compare/v0.5.12...v0.5.13) (2022-06-20)


### Features

* add commandline inputs for import process ([703827f](https://github.com/algolia/firestore-algolia-search/commit/703827f01321b472efa591e4c0d99e200c146805))

### [0.5.12](https://github.com/algolia/firestore-algolia-search/compare/v0.5.11...v0.5.12) (2022-06-06)


### Bug Fixes

* moving all dev to dependencies ([01d8f66](https://github.com/algolia/firestore-algolia-search/commit/01d8f665797a19acc821aac3522951837ac5ebeb))

### [0.5.11](https://github.com/algolia/firestore-algolia-search/compare/v0.5.10...v0.5.11) (2022-06-06)


### Bug Fixes

* move rimraf from dev to dependencies ([44a747a](https://github.com/algolia/firestore-algolia-search/commit/44a747a796709dc84ecab5805bb406611a17a678))

### [0.5.10](https://github.com/algolia/firestore-algolia-search/compare/v0.5.9...v0.5.10) (2022-05-13)


### Features

* add data sync ([482b43f](https://github.com/algolia/firestore-algolia-search/commit/482b43f405e044d6c0b166d95a52ab1c119b8fe3))

### [0.5.9](https://github.com/algolia/firestore-algolia-search/compare/v0.5.8...v0.5.9) (2021-11-15)


### Features

* Changed API key to type 'secret' ([#81](https://github.com/algolia/firestore-algolia-search/issues/81)) ([9bbad73](https://github.com/algolia/firestore-algolia-search/commit/9bbad73805efc0938193af291e3b3ebe8aa36047))

### [0.5.8](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.8) (2021-10-27)


### Features

* add document path to record ([db43169](https://github.com/algolia/firestore-algolia-search/commit/db43169be8fd846e335b5cf5737bf6d20e6c766e))
* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))


### Bug Fixes

* check path for subcollection ([19b9022](https://github.com/algolia/firestore-algolia-search/commit/19b902282624f2a4e3db747943d6ee5400687748))
* remove the data fetch ([23a5da7](https://github.com/algolia/firestore-algolia-search/commit/23a5da7489766ecdeba9f2c354cc4221aa2cc2fe))
* security and versioning ([218e547](https://github.com/algolia/firestore-algolia-search/commit/218e547c2fc93657103e07d8a2d661c7826845a8))

### [0.5.7](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.7) (2021-10-13)


### Features

* add document path to record ([db43169](https://github.com/algolia/firestore-algolia-search/commit/db43169be8fd846e335b5cf5737bf6d20e6c766e))
* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))


### Bug Fixes

* remove the data fetch ([23a5da7](https://github.com/algolia/firestore-algolia-search/commit/23a5da7489766ecdeba9f2c354cc4221aa2cc2fe))

### [0.5.6](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.6) (2021-10-13)


### Features

* add document path to record ([db43169](https://github.com/algolia/firestore-algolia-search/commit/db43169be8fd846e335b5cf5737bf6d20e6c766e))
* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))


### Bug Fixes

* remove the data fetch ([23a5da7](https://github.com/algolia/firestore-algolia-search/commit/23a5da7489766ecdeba9f2c354cc4221aa2cc2fe))

### [0.5.5](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.5) (2021-10-06)


### Features

* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))


### Bug Fixes

* remove the data fetch ([23a5da7](https://github.com/algolia/firestore-algolia-search/commit/23a5da7489766ecdeba9f2c354cc4221aa2cc2fe))

### [0.5.4](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.4) (2021-09-29)


### Features

* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))


### Bug Fixes

* remove the data fetch ([23a5da7](https://github.com/algolia/firestore-algolia-search/commit/23a5da7489766ecdeba9f2c354cc4221aa2cc2fe))

### [0.5.3](https://github.com/algolia/firestore-algolia-search/compare/v0.5.2...v0.5.3) (2021-09-28)


### Features

* handle removed attributes ([321cb84](https://github.com/algolia/firestore-algolia-search/commit/321cb842246df903658c9ea209fb29927cf17e85))
* **release:** add semver, commitlint, and changelog ([728eb2f](https://github.com/algolia/firestore-algolia-search/commit/728eb2fd44db5aabafb19886b12b7e622e75fe92))
