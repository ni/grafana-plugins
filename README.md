# grafana-plugins
Grafana plugins for SystemLink

## Configuring SystemLink Server to host Grafana for the first time
To configure a SystemLink instance to host Grafana, this repo provides a PowerShell script `Setup-Grafana.ps1` that automatically installs Grafana to the machine, copies over the necessary configuration to show Grafana as a plugin within SystemLink, and installs the latest release of the plugins sourced here.

To run the script, [download the latest release](https://github.com/ni/grafana-plugins/releases) from GitHub to the machine where SystemLink is installed, and then execute `Setup-Grafana.ps1` by right-clicking > "Run With PowerShell" or by running it from the PowerShell console. If the script immediately closes without executing, you may need to configure your [Execution Policy](https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies).

Caveats:
- This setup assumes a standard install of SystemLink and Grafana. If you have custom paths, you may need to modify the variables at the start of the script.
- Grafana v11.5.1 will be installed by default. If you need a different Grafana version, manually install it before running the script.

## Updating an existing Grafana installation on a SystemLink Server instance
*Note: If you have installed any custom datasources or altered config files, the changes may be overwritten. In that scenario, you should review the install powershell script and manually work through it as appropriate.*

To update an existing install, first upgrade Grafana by downloading and running the following MSI: https://dl.grafana.com/oss/release/grafana-11.5.1.windows-amd64.msi

Following that, execute the powershell script in the release archive.

To run the script, download the latest release from GitHub to the machine where SystemLink is installed, extract it, and then execute `Setup-Grafana.ps1` by right-clicking > "Run With PowerShell" or by running it from the PowerShell console.

### Troubleshooting

#### Grafana UI shows error code 400 when using the SystemLink Products datasource

The Products datasource has a minor incompatibility with SystemLink Server due to the fact it was originally implemented for SystemLink Enterprise, where "Products" are mapped to workspaces. "Products" do not have workspaces in SystemLink Server. The default query includes a request to return the workspace property for each product, and thus fails. The resolution is to deselect "Workspace" under the "Properties" section of the query. The datasource will behave as expected at that point.

The full text of the error is as follows:

> **Error during product query** </br>
> The query failed due to the following error: (status 400) An error occurered while parsing the JSON request body: 'Error converting value "workspace" to type 'NationalInstruments.Skyline.TestMonitor.HTTP.V2.ProductField'. Path 'projection[3]', line 1, position 108.'..

#### Grafana UI shows `Error: Fetch error: 404 Not Found Instantiating` when loading a plugin

Make sure that you have run `Setup-Grafana.ps1` from the directory extracted from "***-grafana-plugins.zip" that is downloaded from an [official packaged release](https://github.com/ni/grafana-plugins/releases). If you run the script using just the source code, you will receive this error.

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

### Security scanning with Snyk

This repository uses [Snyk](https://snyk.io/) for security scanning to identify and fix vulnerabilities in code before they reach production. Snyk provides Static Application Security Testing (SAST) that scans your code for security issues as you develop.

- **IDE integration**: Install the Snyk extension for [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=snyk-security.snyk-vulnerability-scanner) or [Visual Studio](https://marketplace.visualstudio.com/items?itemName=snyk-security.snyk-vulnerability-scanner-vs-2022) to get real-time security feedback while writing code. To suggest the Snyk extension to contributors, add `.vscode/extensions.json` or `.vsconfig` files to your project root. The VSCode Snyk extension has a richer feature set and is the preferred IDE for working with Snyk.
- **Pull request scanning**: Snyk automatically scans PRs and posts comments for high/critical vulnerabilities.
- **Post-merge monitoring**: Automated bugs are created for unresolved issues after code is merged.

**Contributors within NI/Emerson**: For detailed guidance on working with Snyk, including how to address security issues and create ignore records, see the [Snyk reference](https://dev.azure.com/ni/DevCentral/_wiki/wikis/Stratus/146862/Snyk-reference).

**Contributors outside of NI/Emerson**: If you are having issues resolving a vulnerability Snyk identifies on your PR, consult with a code owner to understand your options for resolution.
