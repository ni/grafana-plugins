$FilesRoot = 'C:/Program Files/National Instruments/Shared'
$ConfigRoot = 'C:/ProgramData/National Instruments/Skyline'
$PluginRoot = "$FilesRoot/Web Server/htdocs/plugins"
$GrafanaRoot = 'C:/Program Files/GrafanaLabs/grafana'

If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))
{
  Write-Output 'Restarting as an elevated process...'
  Start-Sleep 1
  Start-Process powershell.exe -Verb RunAs "-Command cd \`"$pwd\`"; & \`"$($MyInvocation.MyCommand.Path)\`""
  exit
}

$IsInstalled = (Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*).displayname -contains "GrafanaOSS"
if (-Not $IsInstalled) {
    Write-Output 'Grafana not found - downloading installer'
    Start-BitsTransfer -Source 'https://dl.grafana.com/oss/release/grafana-8.3.6.windows-amd64.msi' -Destination 'grafana.msi'
    Write-Output "Installing GrafanaOSS..."
    Start-Process msiexec.exe -Wait -ArgumentList '/I grafana.msi /qr'
    Remove-Item './grafana.msi'
}

Write-Output 'Writing SystemLink configuration'
Copy-Item -Path './config/ni-grafana' -Destination $PluginRoot -Recurse -Force
Copy-Item -Path './config/custom.ini' -Destination "$GrafanaRoot/conf" -Force
Copy-Item -Path './config/75_grafana.conf' -Destination "$FilesRoot/Web Server/conf/conf.d" -Force

Write-Output 'Copying over plugins to Grafana'
New-Item -ItemType 'directory' -Path "$GrafanaRoot/data/plugins" -Force
Copy-Item -Path './plugins/*' -Destination "$GrafanaRoot/data/plugins" -Recurse -Force

Write-Output 'Provisioning datasources'
New-Item -ItemType 'directory' -Path "$ConfigRoot/Grafana/dashboards" -Force
Copy-Item -Path './examples/*.ipynb' -Destination "$ConfigRoot/JupyterHub/notebooks/_shared/reports" -Force
Copy-Item -Path './config/datasources.yml' -Destination "$GrafanaRoot/conf/provisioning/datasources" -Force
Copy-Item -Path './examples/Default Test Module.json' -Destination "$ConfigRoot/Grafana/dashboards" -Force
Copy-Item -Path './config/dashboards.yml' -Destination "$GrafanaRoot/conf/provisioning/dashboards" -Force

Write-Output 'Restarting services...'
Restart-Service 'Grafana'
Restart-Service 'NI Web Server'
Write-Output 'Finished'
