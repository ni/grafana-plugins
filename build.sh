#!/usr/bin/env bash
set -e

rm -rf build
mkdir build

for d in ./*/; do
    cd $d
    if test -f package.json; then
        echo $(pwd)
        npm ci
        npm run build
        cp -r dist ../build/${d}
    fi
    cd ..
done

cd build
zip -r grafana-plugins .