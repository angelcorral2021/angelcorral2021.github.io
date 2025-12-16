---
title: "Guia Seguridad"
description: "Descripcion"
date: "2025-12-16"
tags: ["Bash"]
---

# GUÍA PRÁCTICA DE SEGURIDAD INTERNACIONAL: OWASP TOP 10 (2021)

Esta guía se enfoca en las 10 vulnerabilidades más críticas que afectan a la seguridad de las aplicaciones web. Para cada riesgo, se detallan las medidas de implementación necesarias para la prevención.

## A01:2021 - FALLOS DE CONTROL DE ACCESO (BROKEN ACCESS CONTROL)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Acceso a Funciones y Datos Privilegiados**|Un usuario puede acceder a recursos o realizar acciones que no le corresponden, como ver archivos de otros usuarios o acceder a funciones de administración.|**1. Denegar por Defecto:** Implementar mecanismos de control de acceso para **denegar por defecto** cualquier petición. Solo se debe permitir el acceso a rutas y funciones que se hayan definido explícitamente como accesibles para un rol específico.|
|**Fallas en la Verificación**|Fallas en la verificación de roles y permisos antes de ejecutar una acción en el servidor.|**2. Patrones de Control:** Usar un único mecanismo de control de acceso en la aplicación (ej. una _factory_ de control de acceso) y reusarlo rigurosamente en cada punto de acceso.|
|**IDOR (Insecure Direct Object Reference)**|La aplicación no valida si el usuario tiene permiso para acceder a un recurso a través de su ID (`/datos?id=123`).|**3. Evitar Referencias Externas:** Usar referencias indirectas por objeto (ej. UUID, hashes o identificadores aleatorios) en lugar de claves primarias secuenciales en los parámetros URL.|

## A02:2021 - FALLOS CRIPTOGRÁFICOS (CRYPTOGRAPHIC FAILURES)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Exposición de Datos Sensibles**|Fallas en la protección de datos en tránsito o en reposo (contraseñas, tarjetas de crédito, datos personales) debido a cifrado débil o inexistente.|**1. Encriptación Fuerte:** Asegurar que **todos** los datos sensibles se cifren en reposo (en la base de datos) y en tránsito (usando **TLS 1.2 o superior**, y habilitando **HSTS**).|
|**Algoritmos Inseguros**|Uso de funciones criptográficas y algoritmos obsoletos, rotos o débiles (ej. SHA1, MD5 para contraseñas, cifrado ECB).|**2. Hasheo de Contraseñas:** No almacenar contraseñas. Usar funciones de _hashing_ fuertes y resistentes a fuerza bruta, como **Argon2** o **bcrypt** con un factor de trabajo (costo) alto.|
|**Gestión de Claves**|Claves de cifrado o certificados mal protegidos, codificados en el código o almacenados sin protección.|**3. Almacenamiento Seguro:** Almacenar claves y secretos de cifrado en almacenes de claves (Key Vaults) o sistemas de gestión de secretos, no en el código fuente.|

## A03:2021 - INYECCIÓN (INJECTION)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Inyección de SQL, NoSQL, OS**|Un atacante envía datos maliciosos que son interpretados como comandos o consultas por el servidor (ej. `SQL Injection`).|**1. Consultas Parametrizadas (Recomendado):** Utilizar **consultas parametrizadas (Prepared Statements)** en _todos_ los accesos a la base de datos. Esto separa el código de la consulta de los datos de entrada del usuario.|
|**Uso de Funciones Peligrosas**|Concatenar directamente la entrada del usuario en comandos del sistema operativo (`exec()`, `system()`).|**2. Sanitización:** Escapar el contenido de entrada peligroso para el intérprete. Usar librerías de validación para asegurar que la entrada coincide con el tipo de datos esperado (ej. un número es realmente un número).|

## A04:2021 - DISEÑO INSEGURO (INSECURE DESIGN)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Fallas Arquitectónicas**|La vulnerabilidad no está en la implementación, sino en la ausencia de controles de seguridad en la concepción del diseño (ej. no validar límites de peticiones, diseño sin segregación de roles).|**1. Modelado de Amenazas:** Integrar el modelado de amenazas **antes** de escribir el código, para identificar y mitigar los riesgos de diseño.|
|**Ausencia de Controles**|Falta de controles de seguridad en flujos críticos del negocio.|**2. Uso de Patrones Seguros:** Utilizar patrones de diseño de seguridad probados (ej. Patrón de Puerta de Enlace de Seguridad, Patrón de Repositorio Seguro).|

## A05:2021 - CONFIGURACIÓN INCORRECTA DE SEGURIDAD (SECURITY MISCONFIGURATION)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Valores por Defecto**|El sistema utiliza configuraciones por defecto inseguras (ej. contraseñas por defecto, mensajes de error detallados).|**1. _Hardening_** **del Servidor:** Aplicar los **CIS Benchmarks** al sistema operativo y al servidor web (Apache, Nginx, IIS).|
|**Exposición de Información**|Directorios o servicios innecesarios habilitados.|**2. Principio de Mínimo Privilegio:** Eliminar o deshabilitar cualquier funcionalidad, puerto, servicio o _script_ que no sea absolutamente esencial para el funcionamiento.|
|**Errores Detallados**|Los mensajes de error contienen _stack traces_ o detalles de la base de datos.|**3. Gestión de Errores:** Deshabilitar los mensajes de error detallados en producción. Configurar páginas de error genéricas y registrar el detalle internamente en los _logs_.|

## A06:2021 - COMPONENTES VULNERABLES Y OBSOLETOS

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Uso de Librerías Antiguas**|La aplicación utiliza librerías de terceros (frameworks, módulos, dependencias) que contienen vulnerabilidades conocidas (CVEs).|**1. Inventario de Componentes:** Mantener un inventario de todos los componentes de terceros, sus versiones y sus dependencias.|
|**Desconocimiento de Versiones**|El equipo no monitorea activamente las vulnerabilidades en sus dependencias.|**2. Actualización Continua:** Establecer un proceso automatizado para escanear las dependencias regularmente (_Software Composition Analysis - SCA_). Priorizar y aplicar parches inmediatamente a los componentes críticos.|

## A07:2021 - FALLOS DE IDENTIFICACIÓN Y AUTENTICACIÓN

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Contraseñas Débiles/Sin Cifrar**|Permite ataques de fuerza bruta, robo de sesiones o credenciales reutilizadas.|**1. Autenticación Multifactor (MFA):** Implementar MFA/2FA para todas las cuentas críticas y, preferiblemente, para todos los usuarios.|
|**Manejo Inseguro de Sesiones**|El ID de sesión se expone en la URL o el tiempo de vida de la sesión es infinito.|**2. Límites de Sesión:** Implementar mecanismos para detectar y prevenir ataques de fuerza bruta y _credential stuffing_ (ej. _rate limiting_ y _CAPTCHAs_).|
|**Almacenamiento de Sesiones**|Almacenar identificadores de sesión de manera segura (ej. _cookies_ seguras con los flags `HttpOnly` y `Secure`).||

## A08:2021 - INTEGRIDAD DE DATOS Y SOFTWARE NO VERIFICADA

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Integridad del Código**|La aplicación descarga o actualiza componentes sin verificar su integridad (ej. mediante firmas digitales o _checksums_).|**1. Integridad de los Componentes:** Verificar la firma digital y/o los _hashes_ de las librerías, módulos o paquetes de software antes de su despliegue y durante las actualizaciones.|
|**Serialización Insegura**|Deserializar objetos de fuentes no confiables, lo que puede llevar a la inyección de código.|**2. Deserialización Segura:** Utilizar formatos de serialización que no permitan la ejecución de código (como JSON o YAML), y evitar la deserialización de objetos de fuentes externas.|

## A09:2021 - FALLOS DE REGISTRO Y MONITORIZACIÓN DE SEGURIDAD

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Registro Insuficiente (_Logging_)**|La aplicación no registra eventos de seguridad críticos (ej. intentos de inicio de sesión fallidos, errores de control de acceso).|**1. Registro Exhaustivo:** Registrar eventos de seguridad críticos con suficiente contexto: quién (usuario), qué (acción), cuándo (fecha/hora), dónde (IP/localización) y el resultado.|
|**Monitorización Deficiente**|Los _logs_ se almacenan sin proteger o no se revisan activamente.|**2. Alerta y Respuesta:** Implementar un sistema centralizado de gestión de _logs_ (SIEM/ELK Stack) con alertas configuradas para patrones sospechosos (ej. 10 fallos de _login_ por minuto, acceso denegado en funciones críticas).|

## A10:2021 - FALSA PETICIÓN EN EL LADO DEL SERVIDOR (SSRF)

|**Riesgo**|**Descripción**|**Medidas Clave de Implementación / Práctica**|
|---|---|---|
|**Acceso a Recursos Internos**|El servidor procesa una URL proporcionada por el usuario y realiza una petición a un recurso interno o externo no deseado (ej. metadatos de AWS, servicios internos, puertos locales).|**1. Lista Blanca de Destinos:** Utilizar una **lista blanca** estricta de dominios, puertos y protocolos permitidos si la aplicación necesita hacer peticiones a URLs externas. Denegar cualquier dirección IP privada o bucle local (loopback) por defecto.|
|**Validación Inexistente**|La URL no se valida antes de que el servidor realice la petición.|**2. Deshabilitar _Redirects_**: Deshabilitar las redirecciones HTTP cuando el servidor hace peticiones a URLs proporcionadas por el usuario.|



