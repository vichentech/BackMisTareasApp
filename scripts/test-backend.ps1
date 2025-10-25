# Script de Prueba del Backend desde Windows
# Ejecutar: .\test-backend.ps1 -VpsIp "TU-VPS-IP"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 3000
)

$baseUrl = "http://${VpsIp}:${Port}"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🧪 Prueba del Backend MisPartes" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL Base: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Función para hacer requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $url = "$baseUrl$Endpoint"
    $defaultHeaders = @{
        "Content-Type" = "application/json"
    }
    
    $allHeaders = $defaultHeaders + $Headers
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $allHeaders -Body $jsonBody -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $allHeaders -UseBasicParsing
        }
        
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Test 1: Health Check
Write-Host "1️⃣  Probando Health Check..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/status"

if ($result.Success) {
    Write-Host "   ✅ Health Check OK" -ForegroundColor Green
    Write-Host "   Status: $($result.Content.status)" -ForegroundColor Gray
    Write-Host "   Message: $($result.Content.message)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Health Check FAILED" -ForegroundColor Red
    Write-Host "   Error: $($result.Error)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Setup Status
Write-Host "2️⃣  Verificando estado de configuración..." -ForegroundColor Cyan
$result = Invoke-ApiRequest -Method "GET" -Endpoint "/setup/status"

if ($result.Success) {
    Write-Host "   ✅ Setup Status OK" -ForegroundColor Green
    Write-Host "   Necesita Setup: $($result.Content.needsSetup)" -ForegroundColor Gray
    
    if ($result.Content.needsSetup -eq $true) {
        Write-Host ""
        Write-Host "   ⚠️  El sistema necesita configuración inicial" -ForegroundColor Yellow
        Write-Host ""
        
        # Preguntar si crear admin
        $createAdmin = Read-Host "   ¿Deseas crear el usuario administrador? (S/N)"
        
        if ($createAdmin -eq "S" -or $createAdmin -eq "s") {
            Write-Host ""
            Write-Host "3️⃣  Creando usuario administrador..." -ForegroundColor Cyan
            
            $username = Read-Host "   Username [admin]"
            if ([string]::IsNullOrWhiteSpace($username)) { $username = "admin" }
            
            $password = Read-Host "   Password [admin123]" -AsSecureString
            $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
            )
            if ([string]::IsNullOrWhiteSpace($passwordPlain)) { $passwordPlain = "admin123" }
            
            $email = Read-Host "   Email [admin@example.com]"
            if ([string]::IsNullOrWhiteSpace($email)) { $email = "admin@example.com" }
            
            $adminBody = @{
                username = $username
                password = $passwordPlain
                email = $email
            }
            
            $result = Invoke-ApiRequest -Method "POST" -Endpoint "/setup/create-admin" -Body $adminBody
            
            if ($result.Success) {
                Write-Host "   ✅ Usuario administrador creado" -ForegroundColor Green
                Write-Host ""
                Write-Host "   🔑 Credenciales:" -ForegroundColor Yellow
                Write-Host "      Username: $username" -ForegroundColor Gray
                Write-Host "      Password: $passwordPlain" -ForegroundColor Gray
                Write-Host ""
                
                # Test 3: Login
                Write-Host "4️⃣  Probando login..." -ForegroundColor Cyan
                
                $loginBody = @{
                    username = $username
                    password = $passwordPlain
                }
                
                $result = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login-admin" -Body $loginBody
                
                if ($result.Success) {
                    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
                    Write-Host "   Token: $($result.Content.token.Substring(0, 20))..." -ForegroundColor Gray
                    
                    $token = $result.Content.token
                    
                    Write-Host ""
                    Write-Host "5️⃣  Probando endpoint protegido..." -ForegroundColor Cyan
                    
                    $headers = @{
                        "Authorization" = "Bearer $token"
                    }
                    
                    $result = Invoke-ApiRequest -Method "GET" -Endpoint "/data/users" -Headers $headers
                    
                    if ($result.Success) {
                        Write-Host "   ✅ Endpoint protegido OK" -ForegroundColor Green
                        Write-Host "   Usuarios encontrados: $($result.Content.users.Count)" -ForegroundColor Gray
                    } else {
                        Write-Host "   ❌ Endpoint protegido FAILED" -ForegroundColor Red
                        Write-Host "   Error: $($result.Error)" -ForegroundColor Red
                    }
                } else {
                    Write-Host "   ❌ Login FAILED" -ForegroundColor Red
                    Write-Host "   Error: $($result.Error)" -ForegroundColor Red
                }
            } else {
                Write-Host "   ❌ Error al crear administrador" -ForegroundColor Red
                Write-Host "   Error: $($result.Error)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "   ℹ️  El sistema ya está configurado" -ForegroundColor Blue
        Write-Host ""
        
        # Preguntar credenciales para login
        $testLogin = Read-Host "   ¿Deseas probar el login? (S/N)"
        
        if ($testLogin -eq "S" -or $testLogin -eq "s") {
            Write-Host ""
            Write-Host "3️⃣  Probando login..." -ForegroundColor Cyan
            
            $username = Read-Host "   Username"
            $password = Read-Host "   Password" -AsSecureString
            $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
            )
            
            $loginBody = @{
                username = $username
                password = $passwordPlain
            }
            
            $result = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login-admin" -Body $loginBody
            
            if ($result.Success) {
                Write-Host "   ✅ Login exitoso" -ForegroundColor Green
                Write-Host "   Token: $($result.Content.token.Substring(0, 20))..." -ForegroundColor Gray
            } else {
                Write-Host "   ❌ Login FAILED" -ForegroundColor Red
                Write-Host "   Error: $($result.Error)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "   ❌ Setup Status FAILED" -ForegroundColor Red
    Write-Host "   Error: $($result.Error)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ Pruebas completadas" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 URL del Backend: $baseUrl" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:    ssh usuario@$VpsIp 'docker compose logs -f'" -ForegroundColor Gray
Write-Host "   Ver estado:  ssh usuario@$VpsIp 'docker compose ps'" -ForegroundColor Gray
Write-Host "   Reiniciar:   ssh usuario@$VpsIp 'docker compose restart'" -ForegroundColor Gray
Write-Host ""
