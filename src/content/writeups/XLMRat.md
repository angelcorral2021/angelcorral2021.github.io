---
title: "XLMRat Lab"
date: "2026-01-11"
description: "Informe Técnico de Análisis Forense: XLMRat Lab"
difficulty: "Easy"
tags: ["Forensics", "Blue Team", "ciberdefenders"]
--- 

#### Guión

Se ha detectado un equipo comprometido debido a tráfico de red sospechoso. La tarea consiste en analizar el archivo PCAP (`236-XLMRat.pcap`) para determinar el método de ataque, identificar las cargas maliciosas y rastrear la cronología de los eventos. El análisis se centra en la ejecución sigilosa, la descarga de código reflexivo y el uso de técnicas de evasión por parte del atacante.

## 1. Resumen del Incidente

El análisis forense de la captura de red reveló una infección en varias etapas. El atacante logró descargar una carga útil inicial disfrazada de archivo de imagen, la cual contenía un script ofuscado. Este script desplegó el malware **AsyncRat** utilizando técnicas de "Living-off-the-Land" (LOLBins) para evadir la detección, ejecutando el código malicioso a través de binarios legítimos de Microsoft .NET y eliminando posteriormente sus huellas del sistema.

---

### Fase 1: Acceso Inicial y Descarga (Ingress Tool Transfer)

El atacante inició la cadena de infección ejecutando un comando para descargar la primera etapa del malware desde un servidor remoto.

- **Descarga de Payload:** Se identificó una petición HTTP GET para recuperar un archivo con extensión `.jpg`, que en realidad no era una imagen, sino un script malicioso.
    
- **Infraestructura del Atacante:** La dirección IP asociada al servidor de descarga pertenece al proveedor de hosting **ReliableSite.Net**.
    
- **Técnica MITRE ATT&CK:** **T1105 (Ingress Tool Transfer)**.
    

#### Hallazgos Técnicos y Filtros

- **Filtro Wireshark:** `http.request.method == GET` permitió aislar la petición sospechosa.
    
- **URL Maliciosa:** `http://45.126.209.4:222/mdm.jpg`
    
- **Proveedor (Whois):** ReliableSite.Net
    

---

### Fase 2: Análisis de Malware y Desofuscación

Al analizar el contenido del archivo descargado (`mdm.jpg`), se descubrió que contenía scripts ofuscados y una carga útil codificada en hexadecimal.

- **Extracción de Carga Útil:** El script contenía una cadena hexadecimal con guiones bajos (`_`) como ofuscación.
    
- **Proceso de Ingeniería Inversa:**
    
    1. Extracción de la cadena hexadecimal.
        
    2. Limpieza de caracteres de relleno (`_`).
        
    3. Conversión de Hexadecimal a Binario (archivo ejecutable de Windows).
        
- **Identificación del Malware:** Tras obtener el hash del binario reconstruido, se identificó como una variante de **AsyncRat**.
    
- **Metadatos:** El tiempo de compilación del ejecutable indica que fue creado el **2023-10-30 15:08**.
    

#### Procedimiento Técnico (CyberChef)

Se utilizó CyberChef para la normalización y obtención del hash:

1. _Find and Replace_ (eliminar `_`).
    
2. _From Hex_.
    
3. _SHA2_.
    

|**Atributo**|**Detalle Técnico**|
|---|---|
|**Hash SHA256**|`1eb7b02e18f67420f42b1d94e74f3b6289d92672a0fb1786c30c03d68e81d798`|
|**Familia de Malware**|**AsyncRat** (Confirmado por firmas en VirusTotal/AliCloud)|
|**Fecha de Creación**|2023-10-30 15:08|

---

### Fase 3: Ejecución Sigilosa (Living-off-the-Land)

Para ejecutar el código malicioso sin levantar sospechas, el script utilizó un **LOLBin** (Living-off-the-Land Binary).

- **Binario Legítimo Abusado:** **`RegSvcs.exe`** (Herramienta de registro de ensamblados .NET).
    
- **Mecanismo de Evasión:** El script construyó la ruta al ejecutable mediante concatenación de cadenas y reemplazo de caracteres para evitar la detección basada en firmas estáticas (e.g., eliminando el carácter `#`).
    
- **Técnica MITRE ATT&CK:** **T1218.009 (System Binary Proxy Execution: RegSvcs/RegAsm)**.
    

#### Análisis de Código Desofuscado

El comando original ofuscado:

PowerShell

```
$AC = $NA + 'osof#####t.NET\Fra###mework\v4.0.303###19\R##egSvc#####s.exe'-replace '#', ''
```

Se traduce a la ruta completa del sistema:

> **Ruta:** `C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegSvcs.exe`

Este binario está firmado por Microsoft, lo que permite al atacante ejecutar código arbitrario (el payload de AsyncRat) bajo el contexto de un proceso confiable.

---

### Fase 4: Evasión de Defensa y Limpieza

El script incluye instrucciones explícitas para eliminar los archivos temporales utilizados durante la infección, intentando dificultar el análisis forense posterior.

- **Archivos Eliminados:** Se identificaron comandos para borrar scripts de PowerShell, Batch y VBScript ubicados en el directorio público de usuarios.
    
- **Técnica MITRE ATT&CK:** **T1070.004 (Indicator Removal on Host: File Deletion)**.
    

#### Artefactos Identificados

Mediante el análisis de cadenas (`strings`) y búsqueda de patrones (`grep`), se identificaron los siguientes archivos objetivos de eliminación:

1. `C:\Users\Public\Conted.ps1`
    
2. `C:\Users\Public\Conted.bat`
    
3. `C:\Users\Public\Conted.vbs`
    

---

### Resumen de Atribución e Indicadores (IOCs)

|**Indicador**|**Valor**|**Contexto**|
|---|---|---|
|**IP / URL**|`45.126.209.4` / `http://45.126.209.4:222/mdm.jpg`|Servidor de descarga (Stage 1)|
|**Hash (SHA256)**|`1eb7b02e18f67420f42b1d94e74f3b6289d92672a0fb1786c30c03d68e81d798`|Payload final (AsyncRat)|
|**LOLBin Path**|`C:\Windows\Microsoft.NET\Framework\v4.0.30319\RegSvcs.exe`|Ejecución proxy|
|**Archivos Host**|`Conted.ps1`, `Conted.bat`, `Conted.vbs`|Scripts intermedios (Eliminados)|