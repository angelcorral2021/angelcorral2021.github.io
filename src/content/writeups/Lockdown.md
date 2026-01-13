---
title: "Lockdown Lab"
date: "2026-01-11"
description: "Informe Técnico de Análisis Forense: Lockdown Lab"
difficulty: "Easy"
tags: ["Forensics", "Blue Team", "ciberdefenders"]
---

#### Guión

El SOC de TechNova Systems ha detectado tráfico saliente sospechoso desde un servidor IIS público en su plataforma en la nube, actividad que sugiere una caída del shell web y conexiones encubiertas a un host desconocido.

Como examinador forense, tiene tres artefactos críticos a su disposición: un PCAP que captura el tráfico inicial, una imagen completa de la memoria del servidor y una muestra de malware recuperada del disco. Reconstruya la intrusión y todas las actividades del atacante para que TechNova pueda contener la brecha y reforzar sus defensas.
Este laboratorio, denominado **Lockdown Lab**, es un ejercicio de respuesta a incidentes y análisis forense digital (DFIR). El objetivo es reconstruir la cadena de ataque (Kill Chain) sufrida por un servidor IIS, desde el reconocimiento inicial hasta la identificación de la familia de malware.

## 1. Resumen del Incidente

El SOC de TechNova Systems identificó tráfico saliente sospechoso desde un servidor IIS público. El análisis forense confirmó el compromiso del host mediante la carga de un web shell y la posterior ejecución de un troyano de acceso remoto (RAT) para persistencia y exfiltración de datos.


---

### Fase 1: Reconocimiento y Enumeración

El atacante comenzó identificando servicios vulnerables en la infraestructura de TechNova Systems.

- **Identificación del Atacante:** Mediante el análisis del tráfico de red (PCAP), se determinó que la dirección IP **10.0.2.4** fue la fuente de los sondeos rápidos.
    
- **Técnica de MITRE ATT&CK:** Esta actividad se clasifica como **T1046 (Network Service Scanning)**, utilizada para buscar servicios abiertos en el host objetivo.
    

### Fase 2: Explotación y Acceso Inicial

El atacante aprovechó el protocolo SMB (Server Message Block) para interactuar con el servidor e introducir archivos maliciosos.

- **Enumeración SMB:** El análisis de tráfico mostró conexiones a recursos compartidos (Tree Connect) específicos: `\\10.0.2.15\Documents` y `\\10.0.2.15\IPC$`.
    
- **Instalación del Web Shell:** El atacante subió una carga útil llamada **`shell.aspx`**. Este archivo permitió la ejecución remota de código (RCE) a través de la web.
    
    - **Detalle Técnico:** La solicitud de escritura SMB2 especificó un tamaño exacto de **1,015,024 bytes** para este archivo.
        
- **Establecimiento del Canal:** La web shell realizó una conexión de retorno (**Reverse Shell**) al atacante a través del puerto **4443**.
    

#### Filtros de Wireshark Utilizados

- **Identificación de origen:** `ip.src == 10.0.2.4` permite aislar el tráfico del atacante durante la fase de sondeo.
    
- **Enumeración de recursos:** `smb2.tree_connect_request` visualiza las solicitudes a rutas compartidas.
    
- **Localización de carga útil:** `smb2.filename contains "shell.aspx"` identifica la transferencia del archivo malicioso.
    
- **Canal de comunicación:** `tcp.port == 4443` filtra el tráfico de la shell inversa establecida tras la explotación.
    

#### Hallazgos Técnicos

- **IP Atacante:** 10.0.2.4.
    
- **Técnica MITRE ATT&CK:** T1046 (Network Service Scanning).
    
- **Recursos SMB Comprometidos:** `\\10.0.2.15\Documents` y `\\10.0.2.15\IPC$`.
    
- **Web Shell:** `shell.aspx` (Longitud: 1,015,024 bytes).
    
- **Puerto de Escucha:** 4443.
    

---

### Fase 3: Análisis Forense de Memoria

Para comprender el estado del sistema comprometido, se analizó el volcado de memoria (`memdump.mem`).

- **Contexto del Sistema:** Se identificó la dirección base del núcleo (Kernel) en **`0xf80079213000`**, un dato crítico para mapear procesos en memoria.
    
- **Persistencia:** Se detectó un ejecutable sospechoso fuera de la ruta habitual de IIS: `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\updatenow.exe`.
    
    - **Técnica de MITRE ATT&CK:** Este método de persistencia corresponde a **T1547 (Boot or Logon Autostart Execution)**.
        
- **Relación de Procesos:** El proceso legítimo de Windows **`w3wp.exe`** (el proceso de trabajo de IIS), bajo el **PID 4332**, fue el encargado de gestionar el tráfico de la shell inversa y generar el ejecutable de persistencia.
    
#### Comandos de Volatility 3

- `windows.info`: Utilizado para determinar que la dirección base del núcleo es **0xf80079213000**.
    
- `windows.pstree`: Reveló que el proceso de trabajo de IIS **w3wp.exe** (PID 4332) gestionó el tráfico de la shell y generó el ejecutable de persistencia.
    
- `windows.filescan`: Localizó el binario implantado en la ruta de inicio del sistema.
    

#### Persistencia y Ejecución

- **Ruta del ejecutable:** `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\updatenow.exe`.
    
- **Técnica MITRE ATT&CK:** T1547 (Boot or Logon Autostart Execution).
    
- **Tráfico saliente del shell inverso:**  w3wp.exe,4332
---

### Fase 4: Análisis de Malware (Ingeniería Inversa)

El archivo recuperado, `updatenow.exe`, fue sometido a inspección estática y de inteligencia.

|**Atributo**|**Detalle Técnico**|
|---|---|
|**Formato**|AutoIt (v3.XX)|
|**Empaquetado**|**UPX (v3.91)**, utilizado para comprimir y dificultar el análisis estático|
|**C&C (FQDN)**|El malware se comunica con el dominio **`cp8nl.hyperhost.ua`**|

### Fase 5: Atribución

Finalmente, cruzando el hash del archivo y el dominio de Comando y Control (C2) con fuentes de inteligencia de código abierto (OSINT) como VirusTotal, se identificó la amenaza:

- **Familia de Malware:** **AgentTesla**.
    
- **Capacidades:** Se trata de un **RAT (Remote Access Trojan)** y spyware diseñado en .NET para el robo de datos personales, captura de pantalla y registro de pulsaciones de teclas (keylogger).


El binario recuperado fue analizado para identificar su funcionalidad y destino de conexión.

#### Procedimiento Técnico

- **Identificación:** El comando `diec updatenow.exe` determinó que es un script de **AutoIt (3.XX)** empaquetado con **UPX (3.91)**.
    
- **Desofuscación:** Se requiere el uso de `upx -d` para descomprimir el binario y facilitar la extracción de cadenas de texto.
    
- **Atribución OSINT:** El hash del archivo vincula la muestra con la familia de malware **AgentTesla**.
    

#### Inteligencia de Comando y Control (C2)

|**Atributo**|**Detalle**|
|---|---|
|**FQDN de Conexión**|`cp8nl.hyperhost.ua`|
|**Familia de Malware**|AgentTesla|
|**Capacidades**|Robo de credenciales, captura de pantalla y registro de teclado|
