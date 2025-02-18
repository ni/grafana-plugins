$GrafanaOSS_URL = 'https://dl.grafana.com/oss/release/grafana-11.5.1.windows-amd64.msi'
$FilesRoot = 'C:/Program Files/National Instruments/Shared'
$ConfigRoot = 'C:/ProgramData/National Instruments/Skyline'
$PluginRoot = "$FilesRoot/Web Server/htdocs/plugins"
$GrafanaRoot = 'C:/Program Files/GrafanaLabs/grafana'

$GrafanaOSS_URL | Select-String -Pattern "(\d+)\.(\d+)\.(\d+)" |
        Foreach-Object {
            $selected_major, $selected_minor, $slected_build = $_.Matches[0].Groups[1..3].Value
         }

If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))
{
  Write-Output 'Restarting as an elevated process...'
  Start-Sleep 1
  Start-Process powershell.exe -Verb RunAs "-Command cd \`"$pwd\`"; & \`"$($MyInvocation.MyCommand.Path)\`""
  exit
}

Try {
    Get-ChildItem "$GrafanaRoot\bin\grafana.exe" -ErrorAction Stop
    $IsInstalled = $True
} Catch [System.Management.Automation.ItemNotFoundException] {
    $IsInstalled = $False
} Catch {
    throw
}

if ($IsInstalled) {
    Push-Location -Path "$GrafanaRoot\bin"
    $version = ./grafana.exe -version
    $version | Select-String -Pattern "(\d+)\.(\d+)\.(\d+)" |
        Foreach-Object {
            $major, $minor, $build = $_.Matches[0].Groups[1..3].Value
         }
    if (($selected_major -gt $major) -or (($selected_major -eq $major) -and ($selected_minor -gt $minor)) -or (($selected_major -eq $major) -and ($selected_minor -eq $minor) -and ($selected_build -gt $build))) {
	$UpgradeRequired = $True
    }
    Pop-Location
}

if (-Not $IsInstalled) {
    Write-Output 'Grafana not found - Need to install it'
    $DoGrafanaInstall = $True
}
if ($UpgradeRequired) {
    Write-Output 'Grafana out of date - Need to upgrade it'
    Write-Output 'Shutting down Grafana Service...'
    Stop-Service -Name "Grafana"
    $DoGrafanaInstall = $True
}
if ($DoGrafanaInstall) {
    Write-Output 'Downloading GrafanaOSS...'
    Start-BitsTransfer -Source $GrafanaOSS_URL -Destination 'grafana.msi'
    Write-Output "Installing GrafanaOSS..."
    Start-Process msiexec.exe -Wait -ArgumentList '/I grafana.msi /qr'
    Remove-Item './grafana.msi'
} else {
    Write-Output 'Grafana is already installed and up-to-date'
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
