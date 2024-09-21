---
title: Maquinas CTF Dockerlabs ConsoleLog
excerpt: Writeup
publishDate: 'Sept 20 2024'
isFeatured: true
tags:
  - Web
  - Guide
  - CTFs
  - Dockerlabs
seo:
  image:
    src: 'public\img-maquinas\Pasted image 20240920214323.png'
    alt: logo
---

![logo](/consolelog.png)




> "El código es como la vida: siempre puedes refactorizar, mejorar y evolucionar."



# Herramientas Utilizadas 

- nmap - gobuster - nano - hydra

## Comando 

nmap -sSCV -p- --open --min-rate 5000 172.17.0.2 -Pn -n -vvv 


## Puertos Descubiertos

- **80** --> HTTP (Apache)
- **3000** --> HTTP (Node.js)
- **5000** --> SSH (OpenSSH)

## Navegación en HTTP

Ingresamos al navegador para ver el contenido del servidor web.

![web](/consoleweb.png)

## Fuzzing y Exploración de Directorios

Por el nombre de la máquina, revisamos la consola en las herramientas del navegador y encontramos un token y un directorio. Realizamos un fuzzing web para encontrar más directorios y archivos, hallando dos directorios interesantes.

![gobuster](/consolegobuster.png)

### Directorio Backend

Dentro del directorio `backend`, encontramos un archivo interesante llamado `server.js`.

![server](/consoleserver.png)

### Análisis del Archivo `server.js`

En este archivo, encontramos una contraseña que podría ser útil. Decidimos realizar un ataque de fuerza bruta con hydra al puerto 5000 (SSH), ya que es posible que esta contraseña esté en uso.

## Fuerza Bruta con Hydra

![hydra](/console4.png)

¡Éxito! Encontramos al usuario lovely.

![ssh](/consolessh.png)

## Escalada de Privilegios con `nano`

Revisamos los permisos del sistema y descubrimos que tenemos acceso al binario `nano`, el cual podemos ejecutar con privilegios elevados.

## Modificación del Archivo `/etc/passwd`

El hecho de poder usar `nano` nos permitió modificar el archivo `/etc/passwd` para cambiar los permisos del usuario root.

![etc](/consoleetc.png)

![etc2](/consoleetc2.png)
## Acceso Total

Eliminamos la restricción para root
y cambiamos al usuario root, obteniendo acceso completo al sistema.

![logo](/consoleroot.png)