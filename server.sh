#!/usr/bin/env bash

set -e -o pipefail

OLD_PATH=`pwd`
PROJECT_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $PROJECT_PATH

./node_modules/.bin/http-server $PROJECT_PATH -c-1 -p8086 -i -d -g -o

cd $OLD_PATH