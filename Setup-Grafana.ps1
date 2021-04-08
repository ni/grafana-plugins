$FilesRoot = 'C:/Program Files/National Instruments/Shared'
$ConfigRoot = 'C:/ProgramData/National Instruments/Skyline'
$PluginRoot = "$FilesRoot/Web Server/htdocs/plugins"
$GrafanaRoot = 'C:/Program Files/GrafanaLabs/grafana'

If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))
{
  Write-Output 'Restarting as an elevated process...'
  Start-Sleep 1
  Start-Process powershell.exe "-File",('"{0}"' -f $MyInvocation.MyCommand.Path) -Verb RunAs
  exit
}

$IsInstalled = (Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*).displayname -contains "GrafanaOSS"
if (-Not $IsInstalled) {
    Write-Output 'Grafana not found - downloading installer'
    Start-BitsTransfer -Source 'https://dl.grafana.com/oss/release/grafana-7.5.2.windows-amd64.msi' -Destination 'grafana.msi'
    Write-Output "Installing GrafanaOSS..."
    Start-Process msiexec.exe -Wait -ArgumentList '/I grafana.msi /qr'
    Remove-Item './grafana.msi'
}

Write-Output 'Writing SystemLink configuration'
Copy-Item -Path './config/ni-grafana' -Destination $PluginRoot -Recurse -Force
Copy-Item -Path './config/custom.ini' -Destination "$GrafanaRoot/conf" -Force
Copy-Item -Path './config/75_grafana.conf' -Destination "$FilesRoot/Web Server/conf/conf.d" -Force

[Net.ServicePointManager]::SecurityProtocol = "tls12, tls11, tls"
$PluginsUrl = 'https://api.github.com/repos/ni-kismet/grafana-plugins/releases/latest'

# If this breaks, contact Carson Moore
$Headers = @{ Authorization = 'Basic bXVyZTpnaHBfc3JsT1dNaDFIcTUyT2Uxank0TE5hR2V2SzV1c2hVM3czeVNF' }
Write-Output 'Downloading SystemLink Grafana plugins'
$Release = Invoke-RestMethod -Uri $PluginsUrl -Headers $Headers
Invoke-RestMethod `
    -Uri $Release.assets[0].url `
    -Headers ($Headers += @{ Accept = 'application/octet-stream' }) `
    -OutFile 'grafana-plugins.zip'

Expand-Archive 'grafana-plugins.zip' -Force
Write-Output 'Copying over plugins to Grafana'
Copy-Item -Path './grafana-plugins/*' -Destination "$GrafanaRoot/data/plugins" -Recurse -Force

Write-Output 'Provisioning datasources'
Copy-Item -Path './examples/*.ipynb' -Destination "$ConfigRoot/JupyterHub/notebooks/_shared/reports" -Force
Copy-Item -Path './config/datasources.yml' -Destination "$GrafanaRoot/conf/provisioning/datasources" -Force
Copy-Item -Path './examples/Default Test Module.json' -Destination "$ConfigRoot/Grafana/dashboards" -Force
Copy-Item -Path './config/dashboards.yml' -Destination "$GrafanaRoot/conf/provisioning/dashboards" -Force

Write-Output 'Restarting services...'
Restart-Service 'Grafana'
Restart-Service 'NI Web Server'
Write-Output 'Finished'
