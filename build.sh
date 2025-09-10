#!/usr/bin/env bash
set -e

external_datasources=("workspace" "system" "tag" "alarms" "asset" "products" "results")
external_panels=("plotly")
local_plugins=("systemlink-test-monitor-datasource" "systemlink-notebook-datasource")

rm -rf build
mkdir -p build/{plugins,config,examples}
mkdir -p systemlink-grafana-plugins/dist

cd systemlink-grafana-plugins

npm ci
npm run build

for n in ${external_datasources[@]}; 
do
    cp -r dist/datasources/${n} ../build/plugins/${n}
done

for p in ${external_panels[@]};
do
    cp -r dist/panels/${p} ../build/plugins/${p}
done

cd ..

for d in ${local_plugins[@]};
do
    cd ${d}
    echo $(pwd)
    npm ci
    npm run build
    cp -r dist ../build/plugins/${d}
    
    cd ..
done

cp -r {config,examples} build
cp Setup-Grafana.ps1 build

cd build
zip -r grafana-plugins .