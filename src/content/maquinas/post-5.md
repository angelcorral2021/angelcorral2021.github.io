---
title: Psycho
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Feb 22 2025'
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


![alt text](image.png)

## **1. Escaneo y Enumeración**:

Escaneo de red:

Comando: 
```
nmap -sC -sV -sS -p- -open --min-rate 5000 172.17.0.2 -Pn -n -oN nmap.txt
```

Resultado:

![alt text](<Captura de pantalla 2025-02-21 200914.png>)

Enumeración:

Comando enumeracion parametros: 
```
wfuzz -c --hc=404 --hw 169 -t 200 -w /usr/share/seclists/Discovery/Web-Content/directory-list-lowercase-2.3-medium.txt 'http://172.17.0.2/index.php?FUZZ=../../../../../../../../../etc/passwd'
```

Resultado: Parametro encontrado -> "secret"

![alt text](<Captura de pantalla 2025-02-22 094038.png>)

Herramientas : nmap - wfuzz

## **2. Análisis de Vulnerabilidades**

Análisis manual:

Probamos el parametro **"secret"** encontrando que permite leer el **/etc/passwd** obteniendo la lista de usuarios --> **luisillo, vaxei, root**.

![alt text](<Captura de pantalla 2025-02-22 094914.png>)

### Con este parametro podemos leer el archivo **id_rsa** del usuario vaxei en la ruta **/home/vaxei/.ssh/id_rsa**

El archivo id_rsa es un archivo de clave privada utilizado en el protocolo SSH (Secure Shell) para autenticación. Es parte de un par de claves asimétricas (pública y privada) que permiten acceder de manera segura a servidores o sistemas remotos sin necesidad de contraseñas. Aquí te explico en detalle:

**¿Qué es el archivo id_rsa?**

**Clave privada:**
El archivo id_rsa contiene la clave privada generada junto con su correspondiente clave pública (normalmente almacenada en id_rsa.pub).

**Ubicación:**
Por defecto, se encuentra en el directorio ~/.ssh/ del usuario en sistemas Linux/Unix.

**Formato:**
Es un archivo de texto que comienza con una línea que dice -----BEGIN RSA PRIVATE KEY----- y termina con -----END RSA PRIVATE KEY-----.

**¿Para qué se usa?**

**Autenticación en SSH:**

La clave privada (id_rsa) se usa para autenticarse en servidores remotos que tienen la clave pública correspondiente (id_rsa.pub) en el archivo ~/.ssh/authorized_keys.

**Ejemplo de conexión:**

ssh -i ~/.ssh/id_rsa usuario@servidor

**Acceso sin contraseña:**

Al usar claves SSH, no es necesario ingresar una contraseña para acceder al servidor, lo que facilita la automatización de tareas y mejora la seguridad.

**Cifrado y firma digital:**

Las claves SSH también pueden usarse para cifrar datos o firmar archivos digitalmente.
Estructura del archivo id_rsa
El archivo id_rsa tiene un formato similar a este:

-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAwV...
...
-----END RSA PRIVATE KEY-----

**Protección:**

El archivo id_rsa debe estar protegido con permisos restrictivos (chmod 600) para evitar que otros usuarios lo lean o modifiquen.


**¿Qué pasa si alguien obtiene tu id_rsa?**

Acceso no autorizado:

Si un atacante obtiene tu archivo id_rsa, puede usarlo para acceder a cualquier servidor donde hayas configurado la clave pública correspondiente.

**Medidas de protección:**

Nunca compartas tu clave privada.
Usa una passphrase para cifrar el archivo.
Revoca la clave pública en los servidores si crees que tu clave privada ha sido comprometida.

![alt text](<Captura de pantalla 2025-02-21 201449-1.png>)

## **3. Explotación**

Explotar vulnerabilidades:

Con el archivo id_rsa podemos ingresar por ssh al servidor como usuario vaxei, para esto debemos copiar el contenido del archivo id_rsa teniendo cuidado de no dejar espacios vacíos al principio y al final del archivo, lo guardamos con el mismo nombre y le damos permisos con chmod 600 e ingresamos por ssh al servidor.

![alt text](<Captura de pantalla 2025-02-22 100835.png>)

## **4. Post-Explotación**

Escalar privilegios:

Encontramos que el usuario luisillo puede ejecutar binarios perl sin permisos, en GTFOBins encontramos el Payloads para explotarlo,

Comando: 
```
sudo perl -e 'exec "/bin/sh";'
```

Para que funcione lo modificamos --> 
```
sudo -u luisillo /usr/bin/perl -e 'exec "/bin/sh";'
```

![alt text](<Captura de pantalla 2025-02-22 101736.png>)

**Recolección de datos:**

Encontramos un archivo interesante llamado paw.py que podemos ejecutar.

![alt text](<Captura de pantalla 2025-02-22 102442.png>)

### **Archivo paw.py**

![alt text](<Captura de pantalla 2025-02-22 102606.png>)

**Explicacion Codigo:**

Este código en Python realiza varias operaciones, algunas útiles y otras innecesarias, como una simulación de procesamiento de datos y cálculos. Aquí te explico brevemente cada parte:

**1. Importaciones**

import subprocess

import os

import sys

import time

subprocess: Para ejecutar comandos del sistema operativo.

os: Para interactuar con el sistema operativo (por ejemplo, ejecutar comandos con os.system).

sys: Para manejar funcionalidades del sistema (aunque no se usa en este código).

time: Para manejar tiempos (aunque no se usa en este código).

**2. Función dummy_function**

def dummy_function(data):
    result = ""
    for char in data:
        result += char.upper() if char.islower() else char.lower()
    return result

Propósito: Cambia las letras de un texto a mayúsculas si son minúsculas, y viceversa.

Ejemplo: Si recibe "Hello", devuelve "hELLO".

**3. Ejecución de un comando con os.system**

os.system("echo Ojo Aqui")

Propósito: Ejecuta un comando en la terminal del sistema operativo.

Resultado: Muestra "Ojo Aqui" en la consola.

**4. Función data_processing**

def data_processing():
    data = "This is some dummy data that needs to be processed."
    processed_data = dummy_function(data)
    print(f"Processed data: {processed_data}")

Propósito: Simula el procesamiento de datos usando la función dummy_function.

Resultado: Muestra el texto con las letras invertidas (mayúsculas a minúsculas y viceversa).

**5. Función perform_useless_calculation**

def perform_useless_calculation():
    result = 0
    for i in range(1000000):
        result += i
    print(f"Useless calculation result: {result}")

Propósito: Realiza un cálculo innecesario (suma números del 0 al 999,999).

Resultado: Muestra la suma total (499999500000).

**6. Función run_command**

def run_command():
    subprocess.run(['echo Hello!'], check=True)

Propósito: Ejecuta un comando en la terminal usando subprocess.run.

Resultado: Muestra "Hello!" en la consola.

**7. Función main**

def main():
    data_processing()
    perform_useless_calculation()
    run_command()

Propósito: Orquesta la ejecución de las funciones anteriores.

Flujo:

Procesa datos con data_processing.

Realiza un cálculo innecesario con perform_useless_calculation.

Ejecuta un comando en la terminal con run_command.

**8. Bloque if __name__ == "__main__":**

if __name__ == "__main__":
    main()

**Escalar privilegios:**

Al ejecutar el codigo vemos que genera errores, aprovecharemos esto para escalar privilegios:

![alt text](<Captura de pantalla 2025-02-22 103322.png>)

Desde este punto existen distintas maneras de escalar privilegios veremos 2 formas:

**1° Crear un archivo subprocess.py --> Python Library Hijacking.**

Podemos crear un archivo con el nombre de la libreria subprocess en el mismo directorio e incluirle un codigo malisioso esta es una tecnica llamada python library hijacking:

**El Python Library Hijacking (secuestro de bibliotecas en Python)** es una técnica de ataque en la que un atacante manipula o reemplaza una biblioteca legítima de Python con una versión maliciosa. Esto puede permitirle ejecutar código arbitrario en el sistema de la víctima cuando se importa o utiliza la biblioteca comprometida.

**¿Cómo funciona?**

Ubicación de las bibliotecas:

Python busca bibliotecas en varios directorios, definidos en sys.path. Este incluye:

El directorio actual (.).

Directorios de instalación de Python (como site-packages).

Rutas definidas en la variable de entorno PYTHONPATH.

**Inyección de código malicioso:**

Un atacante puede colocar un archivo malicioso con el mismo nombre que una biblioteca legítima en un directorio que tenga prioridad en sys.path (por ejemplo, el directorio actual). Cuando el script importa la biblioteca, Python cargará la versión maliciosa en lugar de la legítima.

**El código malicioso puede realizar acciones como:**

Robar información sensible.

Ejecutar comandos en el sistema.

Modificar o eliminar archivos.

![alt text](<Captura de pantalla 2025-02-22 104521.png>)

![alt text](<Captura de pantalla 2025-02-22 104858.png>)

**2° Eliminar el archivo paw.py original y crear otro.**

Eliminamos el archivo original ya que esta permitido hacerlo y creamos otro con el mismo nombre pero con un codigo malicioso.

![alt text](<Captura de pantalla 2025-02-22 110744.png>)

## **5. Informe y Comunicación**

La principal entrada para este CTF fue por el fuzzing de parametros, algunos consejos para evitar que esto suceda son:

**1. Configura un Web Application Firewall (WAF)**
WAF es una de las mejores defensas contra el fuzzing y otros ataques web. 

Puedes usar:

WAF basado en la nube: Como Cloudflare, AWS WAF o Akamai.

WAF local: Como ModSecurity (para Apache o Nginx).

¿Qué hace un WAF?

Bloquea solicitudes maliciosas basadas en reglas predefinidas.

Detecta y mitiga intentos de fuzzing, inyecciones SQL, XSS, etc.

**2. Limita la tasa de solicitudes (Rate Limiting)**

Configura límites en la cantidad de solicitudes que un cliente puede hacer en un período de tiempo. 
Esto dificulta el fuzzing automatizado.

**3. Filtra solicitudes sospechosas**

Bloquea solicitudes que contengan patrones sospechosos, como:

Parámetros con nombres o valores inusuales.

Longitudes de parámetros excesivas.

Caracteres especiales o codificaciones extrañas.



**4. Oculta la estructura de tu aplicación**

Evita revelar información sensible:

No expongas mensajes de error detallados que revelen la estructura de tu aplicación (por ejemplo, versiones de software o rutas de archivos).

Usa URLs amigables:

Evita exponer parámetros en la URL (por ejemplo, usa /user/123 en lugar de /user?id=123).

**5. Implementa CAPTCHA**

Usa CAPTCHA en formularios y endpoints críticos para evitar que bots automatizados realicen fuzzing.

Herramientas:

Google reCAPTCHA.
hCAPTCHA.


## **6. Resumen**

**Hallazgos Principales**

**Escaneo y Enumeración:**

Se utilizó nmap para identificar servicios y puertos abiertos.

Mediante wfuzz, se descubrió un parámetro vulnerable (secret) que permitía acceso a archivos sensibles como /etc/passwd y claves SSH.

**Explotación:**

El parámetro secret permitió leer la clave privada SSH (id_rsa) del usuario vaxei, obteniendo acceso al servidor.

**Post-Explotación:**

Se escalaron privilegios aprovechando que el usuario luisillo podía ejecutar binarios Perl sin restricciones.

Se analizó un script en Python (paw.py) y se explotó mediante Python Library Hijacking para ejecutar código malicioso.

**Vulnerabilidades Críticas:**

Exposición de parámetros sensibles mediante fuzzing.

Permisos excesivos en binarios y scripts.

Falta de controles para prevenir la escalación de privilegios.

**Recomendaciones**

**Protección contra Fuzzing:**

Implementar un Web Application Firewall (WAF).

Limitar la tasa de solicitudes (rate limiting).

Filtrar solicitudes sospechosas y ocultar la estructura de la aplicación.

**Refuerzo de Seguridad:**

Restringir permisos de ejecución en binarios y scripts.

Monitorear y auditar el uso de bibliotecas en Python.

Usar CAPTCHA en formularios y endpoints críticos.

**Mejoras en Configuración:**

Desactivar métodos HTTP innecesarios.
Configurar headers de seguridad (CSP, HSTS, X-Frame-Options).
Conclusión
El ataque demostró vulnerabilidades críticas en el servidor, desde la exposición de parámetros hasta la escalación de privilegios. Se recomienda implementar medidas proactivas para mitigar riesgos y fortalecer la seguridad del sistema.