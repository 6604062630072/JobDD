$url = "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json"
$out = "d:\JobSabuy\apps\web\public\thai-address.json"
Invoke-WebRequest -Uri $url -OutFile $out
Write-Host "Downloaded to $out"
