---
title: "Tusk Infostealer"
date: "2026-01-13"
description: "Informe Técnico de Análisis Forense: Tusk Infostealer"
difficulty: "Easy"
tags: ["Forensics", "Blue Team", "ciberdefenders"]
--- 




#### Guión

Una empresa de desarrollo de blockchain detectó actividad inusual cuando un empleado fue redirigido a un sitio web desconocido mientras accedía a una plataforma de gestión de DAO. Poco después, se vaciaron varias billeteras de criptomonedas vinculadas a la organización. Los investigadores sospechan que se utilizó una herramienta maliciosa para robar credenciales y exfiltrar fondos.

Su tarea es analizar la inteligencia proporcionada para descubrir los métodos de ataque, identificar indicadores de compromiso y rastrear la infraestructura del actor de la amenaza.

DATA: MD5: E5B8B2CF5B244500B22B665C87C11767

---

Este laboratorio corresponde al reto **"Tusk Infostealer"** (a veces referido como Blockchain Deception o similar) de CyberDefenders. La clave para resolverlo es realizar Inteligencia de Fuentes Abiertas (OSINT) basándose en el hash MD5 proporcionado y correlacionar los hallazgos con informes de amenazas recientes sobre campañas dirigidas a usuarios de criptomonedas.

A continuación, presento la reconstrucción de la investigación y las respuestas validadas:

### 🕵️‍♂️ Fase de Inteligencia (OSINT)

El punto de partida es el hash MD5: `E5B8B2CF5B244500B22B665C87C11767`.

Al buscar este hash en plataformas como VirusTotal o Kaspersky OpenTIP, se identifica una campaña específica documentada por **Kaspersky** y **Bitdefender** conocida como **"Tusk"**. Esta campaña utiliza sitios de phishing que imitan servicios de blockchain y traductores de IA para distribuir _infostealers_ (como Danabot y StealC).

La mayoria del laboratorio se puede resolver leyendo el informe de la amenaza:  https://securelist.com/tusk-infostealers-campaign/113367/

---

### 📝 Resolución Paso a Paso

#### Q1: Tamaño del archivo malicioso en KB

Buscando el hash en Kaspersky Threat Intelligence Portal o VirusTotal, verificamos las propiedades básicas del archivo `Setup.exe` (o el nombre asociado al hash).

- **Análisis:** El tamaño reportado es aproximadamente 921 KB.
    
- **Respuesta:** `921.36`
    

#### Q2: Palabra clave en los logs (Criatura antigua cazada)

Los informes de inteligencia (específicamente el de Kaspersky sobre la campaña "Tusk") mencionan que los actores de amenazas utilizan un término de la jerga ciberdelincuente rusa para referirse a las víctimas ("mamut"), aludiendo a que son cazados por sus "colmillos" (tusks/dinero).

- **Análisis:** La palabra en inglés para "Mamut" es "Mammoth".
    
- **Respuesta:** `Mammoth`
    

#### Q3: Sitio web malicioso que imita a Peerme.io

El malware crea sitios falsos (Typosquatting/Phishing). El informe detalla que para `peerme.io` (gestión de DAOs), crearon un dominio falso específico.

- **Análisis:** Según el reporte de la campaña Tusk, el dominio falso utilizado fue `tidyme.io`.
    
- **Respuesta:** `tidyme.io`
    

#### Q4: Servicio de almacenamiento en la nube utilizado

La campaña aloja los payloads iniciales en servicios legítimos para evadir la detección.

- **Análisis:** Los ejecutables maliciosos para Windows y macOS estaban alojados en **Dropbox**.
    
- **Respuesta:** `Dropbox`
    

#### Q5: Contraseña de descompresión en la configuración

El _dropper_ contiene una configuración ofuscada. Los analistas de malware han extraído esta configuración en sus reportes técnicos.

- **Análisis:** La contraseña hardcodeada para descomprimir los payloads de segunda etapa es `newfile2024`.
    
- **Respuesta:** `newfile2024`
    

#### Q6: Nombre de la función para recuperar el archivo

Esto requiere ingeniería inversa del script malicioso (generalmente un archivo Electron/JS en esta campaña).

- **Análisis:** La función responsable de descargar y extraer el archivo cifrado se llama `downloadAndExtractArchive`.
    
- **Respuesta:** `downloadAndExtractArchive`
    

#### Q7: Proyecto de traductor de IA (Legítimo, Malicioso)

La campaña también suplantó un servicio de traducción.

- **Análisis:** El servicio legítimo es **Yous.ai**. El sitio falso creado por los atacantes fue **Voico.io**.
    
- **Respuesta:** `yous.ai, voico.io`
    

#### Q8: Direcciones IP de los servidores C2 de StealC

El análisis de tráfico o la extracción de configuración del malware _StealC_ revela los servidores de Comando y Control.

- **Análisis:** Las IPs identificadas en esta campaña específica son `46.8.238.240` y `23.94.225.177`.
    
- **Respuesta:** `46.8.238.240,23.94.225.177`
    

#### Q9: Dirección de la billetera Ethereum

Esta dirección se encuentra usualmente en las cadenas de texto del _clipper_ (malware que reemplaza direcciones en el portapapeles) o en los logs de la comunidad de seguridad que rastrea los fondos robados.

- **Análisis:** La dirección reportada asociada a este hash es `0xaf0362e215Ff4e004F30e785e822F7E20b99723A`.
    
- **Respuesta:** `0xaf0362e215Ff4e004F30e785e822F7E20b99723A`
    