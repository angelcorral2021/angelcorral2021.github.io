---
title: 'Script Respaldo Automatico Archivos en Sistema Linux'
description: Pequeño script para respaldar archivos.
publishDate: 'Septiembre 30 2024'
isFeatured: true
seo:
  image:
    src: '/apptodo.png'
    alt: 'Vista previa del proyecto'
---




## Descripción
Este script en Bash automatiza la creación de respaldos de archivos desde un directorio de origen y los almacena en un directorio de respaldo. Posteriormente, sube el archivo de respaldo a un repositorio en GitHub.

## Requisitos
Antes de ejecutar el script, asegúrate de cumplir con los siguientes requisitos:

- Tener instalado `git` y configurado un repositorio en GitHub.
- Contar con acceso al directorio de origen con archivos que deseas respaldar.
- Tener un directorio de respaldo o permitir que el script lo cree automáticamente.
- Configurar correctamente las credenciales de GitHub para permitir la subida automática de archivos.

## Funcionamiento
El script realiza los siguientes pasos:

1. Verifica la existencia del directorio de origen.
2. Crea el directorio de respaldo si no existe.
3. Genera un archivo comprimido (`.tar.gz`) con los archivos del directorio de origen.
4. Guarda el archivo en el directorio de respaldo con un nombre basado en la fecha y hora actual.
5. Accede al directorio del repositorio y sube el archivo de respaldo a GitHub mediante `git`.

## Uso
Para ejecutar el script, simplemente corre el siguiente comando en la terminal:

```bash
./nombre_del_script.sh
```

Si el script no tiene permisos de ejecución, otórgale permisos con:

```bash
chmod +x nombre_del_script.sh
```

## Notas
- Es recomendable agregar una clave SSH o configurar credenciales en `git` para evitar que solicite autenticación en cada ejecución.
- Si deseas cambiar los directorios de origen y respaldo, modifícalos en las variables `ORIGEN` y `REPO_DIR` dentro del script.
- El directorio debe apuntar y tener los permisos para el repositorio remoto en GitHub.

CODIGO:

```
#!/bin/bash

set -e  # Detener el script en caso de error

# Directorio de origen y repositorio
ORIGEN="/directorio/archivos"
REPO_DIR="/directorio/directorio_respaldo"

# Fecha actual para el nombre del backup
FECHA=$(date '+%Y-%m-%d_%H-%M-%S')
ARCHIVO_BACKUP="backup_$FECHA.tar.gz"

# Verificar si el directorio de origen existe
if [ ! -d "$ORIGEN" ]; then
    echo "Error: El directorio de origen no existe." >&2
    exit 1
fi

# Verificar si el directorio del repositorio existe, si no, crearlo
if [ ! -d "$REPO_DIR" ]; then
    echo "El directorio del repositorio no existe. Creándolo..."
    mkdir -p "$REPO_DIR"
fi

# Crear backup en el directorio del repositorio
echo "Creando el backup..."
if tar -czvf "$REPO_DIR/$ARCHIVO_BACKUP" -C "$ORIGEN" .; then
    echo "Backup creado exitosamente."
else
    echo "Error: Falló la creación del backup." >&2
    exit 1
fi

# Subir cambios al repositorio de GitHub
cd "$REPO_DIR" || { echo "Error: No se pudo acceder al directorio del repositorio." >&2; exit 1; }

echo "Subiendo a GitHub..."
git add "$ARCHIVO_BACKUP" && \
    git commit -m "Backup: $FECHA" && \
    git push origin main && \
    echo "Respaldo y subida a GitHub completados correctamente."

```

CODIGO PARA AUTOMATIZAR CON CRON:

```
30 12 * * * /bin/bash /home/usuario/Desktop/ARCHIVOS_BACKUP/backup_script.sh >> /home/usuario/Desktop/ARCHIVOS_BACKUP/log_backup.txt 2>&1
```

Esta línea es una **tarea programada en `cron`** (una **cron job**) que ejecuta un script de respaldo automáticamente a una hora específica. Vamos a desglosarla:  

---

### 📌 **Explicación de la Sintaxis**


#### **1. Programación en `cron` (los primeros 5 campos)**
| Campo  | Valor | Significado |
|--------|-------|------------|
| Minuto | `30`  | Ejecuta la tarea en el minuto 30 |
| Hora   | `12`  | Ejecuta la tarea a las 12 del mediodía |
| Día del mes | `*` | Se ejecuta **cualquier día del mes** |
| Mes    | `*`   | Se ejecuta **en cualquier mes** |
| Día de la semana | `*` | Se ejecuta **cualquier día de la semana** |

✅ **Conclusión:** Se ejecutará **todos los días a las 12:30 PM**.

---

#### **2. Comando Ejecutado**
```bash
/bin/bash /home/usuario/Desktop/ARCHIVOS_BACKUP/backup_script.sh
```
- `/bin/bash` → Especifica que el script debe ejecutarse con `Bash`.
- `/home/usuario/Desktop/ARCHIVOS_BACKUP/backup_script.sh` → Ruta del script que se ejecutará.


---

#### **3. Redirección de Salida**
```bash
>> /home/usuario/Desktop/ARCHIVOS_BACKUP/log_backup.txt 2>&1
```
- `>>` → **Añade** la salida al archivo de log (`log_backup.txt`) sin sobrescribirlo.
- `2>&1` → **Redirige errores (`stderr`) al mismo archivo** donde se almacena la salida normal (`stdout`).

✅ **Conclusión:** Cualquier mensaje o error del script se guardará en `log_backup.txt`.
