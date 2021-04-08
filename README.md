# grafana-plugins
Grafana plugins for SystemLink

## Configuring SystemLink to host Grafana
To configure a SystemLink instance to host Grafana, this repo provides a PowerShell script `Setup-Grafana.ps1` that automatically installs Grafana to the machine, copies over the necessary configuration to show Grafana as a plugin within SystemLink, and installs the latest release of the plugins sourced here.

To run the script, clone this repo or download the source from GitHub to the machine where SystemLink is installed, and then execute `Setup-Grafana.ps1` by right-clicking > "Run With PowerShell" or by running it from the PowerShell console.

Caveats:
- This setup assumes a standard install of SystemLink and Grafana. If you have custom paths, you may need to modify the variables at the start of the script.
- Grafana v7.5.3 will be installed by default. If you need a different Grafana version, manually install it before running the script.



## Development
### Installing Grafana
https://grafana.com/docs/grafana/latest/installation/

### Configuring plugins directory
Before you can get started building plugins, you need to set up your environment for plugin development.

To discover plugins, Grafana scans a plugin directory, the location of which depends on your operating system.

1. Clone this repo to your local machine using https://github.com/ni-kismet/grafana-plugins.

2. Find the plugins property in the Grafana configuration file and set the plugins property to the path of the grafana-plugins directory. Refer to the [Grafana configuration documentation](https://grafana.com/docs/grafana/latest/installation/configuration/#plugins) for more information.
```
[paths]
plugins = "/path/to/grafana-plugins"
```
3. Restart Grafana if it’s already running, to load the new configuration.

### Installing additional plugins
Any external plugins installed from Grafana's plugin library or another repo should be placed in a subdirectory `external-plugins`.

For example, installing from the plugin library would look like this:
```
grafana-cli --pluginsDir "/path/to/grafana-plugins/external-plugins" plugins install <plugin-id>
```

### Using example dashboards
The `examples` subdirectory contains dashboard examples using these plugins that can be imported into any Grafana instance.

Refer to the Grafana documentation for more information:
https://grafana.com/docs/grafana/latest/dashboards/export-import/

You should install and configure datasource plugins **before** importing a dashboard, as part of the import workflow includes picking the datasource instances to be used for the new dashboard.