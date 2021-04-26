#!/usr/bin/env bash
set -e

rm -rf build
mkdir -p build/{plugins,config,examples}
echo "DEBUGGING"
echo $BASH_VERSION
echo $(ls)

for d in ./*/; do
    cd $d
    if test -f package.json; then
        echo $(pwd)
        npm ci
        npm run build
        cp -r dist ../build/plugins/${d}
    fi
    cd ..
done

cp -r config build/config
cp -r examples build/examples
cp Setup-Grafana.ps1 build

cd build
zip -r grafana-plugins .