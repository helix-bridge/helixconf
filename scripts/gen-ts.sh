#!/bin/bash
#

set -ex

BIN_PATH=$(cd "$(dirname "$0")"; pwd -P)
WORK_PATH=${BIN_PATH}/../

cd ${WORK_PATH}

npm run codegen -- --language=ts

cd ${WORK_PATH}/generated/typescript

npm run build

npm run test

