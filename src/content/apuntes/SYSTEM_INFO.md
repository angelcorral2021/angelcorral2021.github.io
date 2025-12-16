---
title: "Enumeracion Sistema"
description: "Descripcion"
date: "2024-12-01"
tags: ["Bash"]
---

```bash

#!/bin/bash
# sys_info.sh — Recolecta información clave del sistema (modo solo lectura)

OUT="sysinfo.txt"
echo "[*] Auditoría del sistema iniciada: $(date)" > "$OUT"

echo "[*] Usuario actual: $(whoami)" >> "$OUT"
echo "[*] Hostname: $(hostname)" >> "$OUT"
echo "[*] Distribución y versión:" >> "$OUT"
cat /etc/*release 2>/dev/null | grep -E "NAME=|VERSION=" >> "$OUT"

echo "[*] Kernel: $(uname -r)" >> "$OUT"
echo "[*] Arquitectura: $(uname -m)" >> "$OUT"
echo "[*] Tiempo encendido:" >> "$OUT"
uptime -p >> "$OUT"

echo "[*] Interfaces de red y direcciones IP:" >> "$OUT"
ip -brief address show >> "$OUT"

echo "[*] Rutas activas:" >> "$OUT"
ip route show >> "$OUT"

echo "[*] Variables de entorno relevantes:" >> "$OUT"
env | grep -E 'USER|HOME|SHELL|PATH|HTTP|PROXY' >> "$OUT"

echo "[*] Procesos privilegiados (root):" >> "$OUT"
ps -U root -u root u | head -n 10 >> "$OUT"

echo "[*] Conexiones activas:" >> "$OUT"
ss -tupan 2>/dev/null | head -n 10 >> "$OUT"

echo "[*] Usuarios del sistema:" >> "$OUT"
getent passwd | grep -v 'nologin' >> "$OUT"

echo "[*] Servicios en ejecución:" >> "$OUT"
systemctl list-units --type=service --state=running | head -n 15 >> "$OUT"

echo "[*] Variables de entorno Docker/podman (si existen):" >> "$OUT"
env | grep -iE 'docker|container|podman' >> "$OUT"

echo "[+] Informe generado en $OUT"
```