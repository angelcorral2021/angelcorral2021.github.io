---
title: "DOCKER AUDIT"
description: "Descripcion"
date: "2025-12-16"
tags: ["DOCKER"]
---

```bash

#!/bin/bash
# docker_audit.sh v1.3 — Auditoría rápida y no intrusiva del entorno Docker

echo "=== Docker Security Audit ($(date '+%Y-%m-%d %H:%M:%S')) ==="
echo

# Verificar que Docker esté instalado
if ! command -v docker &>/dev/null; then
  echo "[!] Docker no está instalado o no está en el PATH."
  exit 1
fi

# 1. Versión y privilegios
echo "[*] Información general:"
docker version --format 'Servidor: {{.Server.Version}} | Cliente: {{.Client.Version}}' 2>/dev/null || echo "[!] No se pudo obtener la versión de Docker."
echo "Usuario actual: $(whoami)"
groups | grep -q docker && echo "[✔] Usuario pertenece al grupo docker" || echo "[!] Usuario NO pertenece al grupo docker"
echo

# 2. Contenedores en ejecución
echo "[*] Contenedores en ejecución:"
if ! docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | grep -v "NAMES" >/dev/null; then
  echo "[i] No hay contenedores en ejecución."
else
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
fi
echo

# 3. Verificación de montajes sensibles
echo "[*] Verificando montajes peligrosos..."
containers=$(docker ps -q)
if [ -z "$containers" ]; then
  echo "[i] No hay contenedores para inspeccionar."
else
  risk_found=false
  while read -r id; do
    name=$(docker inspect --format '{{.Name}}' "$id" | tr -d '/')
    mounts=$(docker inspect "$id" --format '{{json .Mounts}}' 2>/dev/null)
    if echo "$mounts" | grep -Eq 'docker.sock|/root|/etc/shadow|/var/run/docker.sock|/etc/passwd'; then
      echo "[!] Riesgo: Contenedor '$name' monta rutas sensibles"
      echo "    → $(echo "$mounts" | grep -Eo '/[^"]+' | grep -E 'docker.sock|/root|/etc/shadow|/etc/passwd')"
      risk_found=true
    fi
  done <<< "$containers"
  [ "$risk_found" = false ] && echo "[✔] No se detectaron montajes sensibles."
fi
echo

# 4. Revisión de capacidades peligrosas
echo "[*] Revisando capacidades peligrosas..."
if docker ps -q | while read -r id; do docker inspect "$id" --format '{{.HostConfig.CapAdd}}'; done | grep -qE 'SYS_ADMIN|NET_ADMIN|SYS_PTRACE'; then
  echo "[!] Algunos contenedores tienen capacidades elevadas (SYS_ADMIN, NET_ADMIN, SYS_PTRACE)."
else
  echo "[✔] No se detectaron capacidades peligrosas."
fi
echo

# 5. Revisión de modo privilegiado
echo "[*] Comprobando contenedores con modo privilegiado..."
if docker ps -q | while read -r id; do docker inspect "$id" --format '{{.HostConfig.Privileged}}'; done | grep -q true; then
  echo "[!] Hay contenedores en modo privilegiado."
else
  echo "[✔] Ningún contenedor usa modo privilegiado."
fi
echo

echo "=== Auditoría Docker completada ==="

```