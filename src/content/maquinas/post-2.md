---
title: -Pn
excerpt: WritheUp maquina de DockerLabs
publishDate: 'Sept 19 2024'
isFeatured: true
tags:
  - Web
  - Guide
  - CTF
seo:
  image:
    src: '/post-14.jpg'
    alt: Wavy lines
---



## Información General


- **Plataforma:** https://dockerlabs.es
- **Dificultad:** Fácil
- **Categoría:** Pentesting
- **Autor:** El Pinguino de Mario

---

## Herramientas Utilizadas

- **nmap**
- **ftp**
- **msfvenom**
- **netcat**

---

## Fase 1: Escaneo de Puertos

### Comando

```bash
nmap -sSCV -p- --open --min-rate 5000 [IP] -Pn -n -vvv

```




### Resultados

| Puerto | Servicio     | Descripción          |
|--------|--------------|----------------------|
| [80]   | [HTTP]       | [Servidor Apache]    |
| [3000] | [HTTP]       | [Aplicación Node.js] |
| [5000] | [SSH]        | [OpenSSH]            |

---

## Fase 2: Exploración Web

### Navegación Inicial

Descripción de los pasos al ingresar en el navegador.

### Fuzzing de Directorios

Comando utilizado para fuzzing:

```bash
gobuster dir -u http://[IP] -w [wordlist] -x [extensiones]
```

**Directorios encontrados:**

- `/admin`
- `/backend`

### Archivos Importantes

| Archivo   | Descripción               |
|-----------|---------------------------|
| `server.js` | Contiene [contraseña/token] |
| [Otro]     | Descripción               |

---

## Fase 3: Ataque de Fuerza Bruta

### Fuerza Bruta SSH con Hydra

Comando utilizado:

```bash
hydra -l [usuario] -P [diccionario] ssh://[IP] -s [puerto]
```

**Resultado:** Encontrado el usuario **[usuario]** con la contraseña **[contraseña]**.

---

## Fase 4: Escalada de Privilegios

### Análisis de Permisos

Comprobación de permisos del usuario:

```bash
sudo -l
```

**Permiso importante:** Podemos ejecutar **nano** con privilegios elevados.

### Modificación de `/etc/passwd`

Pasos para modificar el archivo `/etc/passwd` y obtener acceso como root:

```bash
sudo nano /etc/passwd
```

Descripción de los cambios realizados para escalar privilegios.

---

## Conclusión

- **Usuario Final Obtenido:** [root/usuario objetivo]
- **Flags:** [Flag obtenida: user.txt/root.txt]

**Notas adicionales:**
[Conclusiones, aprendizaje o herramientas nuevas usadas]
```

Este formato está diseñado para seguir un flujo típico en la resolución de CTFs. Lo puedes ir rellenando paso a paso conforme realizas las actividades.