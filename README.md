# grafana-plugins
Grafana plugins for SystemLink

## Installing Grafana
https://grafana.com/docs/grafana/latest/installation/

## Configuring plugins directory
Before you can get started building plugins, you need to set up your environment for plugin development.

To discover plugins, Grafana scans a plugin directory, the location of which depends on your operating system.

1. Clone this repo to your local machine using https://github.com/ni-kismet/grafana-plugins.

2. Find the plugins property in the Grafana configuration file and set the plugins property to the path of the grafana-plugins directory. Refer to the [Grafana configuration documentation](https://grafana.com/docs/grafana/latest/installation/configuration/#plugins) for more information.
```
[paths]
plugins = "/path/to/grafana-plugins"
```
3. Restart Grafana if it’s already running, to load the new configuration.

## Installing additional plugins
Any external plugins installed from Grafana's plugin library or another repo should be placed in a subdirectory `external-plugins`.

For example, installing from the plugin library would look like this:
```
grafana-cli --pluginsDir "/path/to/grafana-plugins/external-plugins" plugins install <plugin-id>
```

## Using example dashboards
The `examples` subdirectory contains dashboard examples using these plugins that can be imported into any Grafana instance.

Refer to the Grafana documentation for more information:
https://grafana.com/docs/grafana/latest/dashboards/export-import/

You should install and configure datasource plugins **before** importing a dashboard, as part of the import workflow includes picking the datasource instances to be used for the new dashboard.