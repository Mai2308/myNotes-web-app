param(
    [string]$SqlHost = "localhost",
    [int]$SqlPort = 1433
)

Write-Host "Waiting for SQL Server at ${SqlHost}:${SqlPort}..."

while ($true) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient($SqlHost, $SqlPort)
        $tcp.Close()
        Write-Host "SQL Server is up!"
        break
    } catch {
        Write-Host "Waiting for SQL Server at ${SqlHost}:${SqlPort}..."
        Start-Sleep -Seconds 2
    }
}
