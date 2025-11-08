---
title: "Script de Respaldo Automático"
description: "Descripcion"
date: "2024-12-01"
status: "completed"
tags: ["Bash"]
---



### Resumen
Script Bash para automatizar respaldos locales (tar.gz), gestionar retención básica y opcionalmente sincronizar los archivos de respaldo con un repositorio Git (por ejemplo, en GitHub). Está diseñado para uso en Linux/Unix y sigue buenas prácticas de robustez y seguridad.

### Características principales
- Parámetros configurables mediante variables de entorno.
- Manejo de errores y limpieza segura (trap).
- Rotación simple de backups por número máximo.
- Integración opcional con Git (commit y push) usando la rama configurada.

### Requisitos
- Bash (>= 4 recomendado)
- tar, gzip
- git (solo si se quiere sincronizar con un repositorio remoto)
- Permisos adecuados sobre los directorios implicados

### Variables configurables (valores por defecto dentro del script)
- ORIGEN: directorio a respaldar
- BACKUP_DIR: directorio donde se almacenan los backups localmente
- KEEP: número máximo de backups a conservar (rotación)
- GIT_REPO: ruta local del repositorio Git donde se guardarán los backups (opcional)
- GIT_BRANCH: rama para push (por defecto: main)

### Uso
1. Copiar el script a un archivo, por ejemplo backup.sh
2. Editar las variables al principio del script o definirlas como variables de entorno antes de ejecutar.
3. Dar permisos de ejecución:

```bash
chmod +x backup.sh

4. Ejecutar manualmente o añadir a crontab para ejecución periódica.

## Script recomendado
```bash
---

# Configuración (ajustar según sea necesario o exportar como variables de entorno)
: "${ORIGEN:=/ruta/a/origen}"
: "${BACKUP_DIR:=/ruta/a/backups}"
: "${KEEP:=10}"
: "${GIT_REPO:="}"  # ruta local del repo git (vacío = no usar git)
: "${GIT_BRANCH:=main}"

FECHA=$(date '+%Y-%m-%d_%H-%M-%S')
NOMBRE="backup_${FECHA}.tar.gz"

log() { printf "%s %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

# Verificaciones iniciales
if [ ! -d "$ORIGEN" ]; then
    log "ERROR: Directorio de origen no existe: $ORIGEN"
    exit 2
fi

mkdir -p "$BACKUP_DIR"

TMPFILE=$(mktemp -p "$BACKUP_DIR" .tmp_backup_XXXXXX) || { log "Fallo creando tmpfile"; exit 3; }
cleanup() {
    rm -f "$TMPFILE"
}
trap cleanup EXIT

log "Creando backup: $NOMBRE"
if tar -czf "$TMPFILE" -C "$ORIGEN" .; then
    mv "$TMPFILE" "$BACKUP_DIR/$NOMBRE"
    log "Backup creado en $BACKUP_DIR/$NOMBRE"
else
    log "ERROR: Falló creación del tar.gz"
    exit 4
fi

# Rotación: conservar solo los últimos $KEEP archivos
if command -v ls >/dev/null 2>&1; then
    mapfile -t archivos < <(ls -1t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null || true)
    if [ "${#archivos[@]}" -gt "$KEEP" ]; then
        for f in "${archivos[@]:$KEEP}"; do
            log "Eliminando backup viejo: $f"
            rm -f -- "$f" || log "Advertencia: no se pudo eliminar $f"
        done
    fi
fi

# Integración con Git (opcional)
if [ -n "$GIT_REPO" ]; then
    if [ ! -d "$GIT_REPO/.git" ]; then
        log "ERROR: $GIT_REPO no es un repositorio git válido"
        exit 5
    fi

    cp "$BACKUP_DIR/$NOMBRE" "$GIT_REPO/" || { log "ERROR: no se pudo copiar $NOMBRE a $GIT_REPO"; exit 6; }
    cd "$GIT_REPO"
    git add "$NOMBRE"
    git commit -m "Backup: $FECHA" || log "Advertencia: ningún cambio para commitear"
    git push origin "$GIT_BRANCH" || { log "ERROR: push falló"; exit 7; }
    log "Backup sincronizado en repo: $GIT_REPO"
fi

log "Proceso finalizado con éxito"
```

#### Ejemplo de crontab
Recomendado usar rutas absolutas y redirigir salida a un log controlado.

```
# Ejecutar diariamente a las 01:30 y guardar log (ejecutar como el usuario con permisos)
30 1 * * * /usr/bin/env bash /ruta/a/backup.sh >> /var/log/backup_script.log 2>&1
```

### Buenas prácticas y seguridad
- Preferir autenticación por clave SSH para git push y/o usar un token con gh o con credenciales del sistema.
- Restringir permisos del directorio de backups: chmod 700 /ruta/a/backups.
- Evitar poner contraseñas en texto plano dentro del script.
- Probar el script manualmente antes de programarlo en cron.

### Depuración y troubleshooting
- Revisar /var/log/backup_script.log (o el archivo que haya definido) para mensajes de error.
- Ejecutar el script en modo verboso para aislar problemas: bash -x backup.sh.

### Notas finales
Este script es una base sólida para respaldos simples y sincronización con Git. Para entornos de producción o datos críticos, considere soluciones dedicadas (rsync+snapshots, Borg, Restic, duplicity) que brindan deduplicación, cifrado y mejor retención.


