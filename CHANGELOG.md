# 1.0.0 (2025-03-28)


### Bug Fixes

* build runtime from slim python, not venv ([052aeb0](https://github.com/vre-charite-dev/core/commit/052aeb05ec2f97c7f7d2555ae3052888c11dd9e6))
* disable SSE for buckets, because KMS isn't activated ([6e380cb](https://github.com/vre-charite-dev/core/commit/6e380cbf263acbb0332d9c852138e029ba64279a))
* execute run.py in Dockerfile instead of gunicorn worker ([94e9fa6](https://github.com/vre-charite-dev/core/commit/94e9fa661ff5bb710296cb1c9c206ef0b2a8f26a))
* **portal:** add copyright to the left of term of use ([ca5f6b1](https://github.com/vre-charite-dev/core/commit/ca5f6b1bc031de8749ccc99f3a20764dd331af8a))
* **portal:** align left and right part of footer ([dfe3094](https://github.com/vre-charite-dev/core/commit/dfe309461c743bd9dd1cffdd0c193d4c90571364))
* run as gunicorn server without uvicorn workers. Output logs to stdout, stderr ([ab4eb18](https://github.com/vre-charite-dev/core/commit/ab4eb18440ea966312f7b1a6ad61d87de4372c7f))
* update keyacloak mappers configs for react-app ([60fb174](https://github.com/vre-charite-dev/core/commit/60fb174965d71733c8c29e614b2ec288f198c1be))
* update versions ([ab7fe22](https://github.com/vre-charite-dev/core/commit/ab7fe228a837b08c24791afb53fffaef1c207a2a))
* use correct Python version in Dockerfile ([8063f9a](https://github.com/vre-charite-dev/core/commit/8063f9a4823f99459eb387c6362fefbf2ad340ec))


### Features

* add commit lint and semantic release ([178f9cc](https://github.com/vre-charite-dev/core/commit/178f9cc34cac8f05d7b1f40e23c87885be9b1aea))


### Reverts

* Revert "VRE-2203 Replace docker registry address with tls encrytion domain URL as per..." ([778e26a](https://github.com/vre-charite-dev/core/commit/778e26a788a35ef1f755ef326c91c6134727ef0b))
