
# 🧠 Cyber Portfolio — Desarrollado con Astro ⚡



> Portafolio personal orientado a **ciberseguridad, hacking ético y desarrollo web**, construido con **Astro.js** y desplegado en **GitHub Pages**.



## 🏷️ Estado del Proyecto

![Astro](https://img.shields.io/badge/Astro-3.0-FF5D01?logo=astro&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Deploy](https://img.shields.io/github/deployments/angelcorral2021/Portafolio-Web/github-pages?label=deploy)
![Build](https://img.shields.io/github/actions/workflow/status/angelcorral2021/Portafolio-Web/deploy.yml?label=build)



## 🚀 Descripción

Este proyecto es un **sitio web de portafolio profesional** que presenta:
- Experiencia y especialización en **Ciberseguridad y Pentesting**.
- Sección de **Writeups técnicos** (CTFs, laboratorios, auditorías).
- Blog con **artículos técnicos**.
- Módulo de **servicios profesionales** (consultoría, formación, auditorías).
- Proyectos personales.
- Página de **contacto** con enlaces a redes.

El diseño está inspirado en una estética **oscura con neones azules y verdes**, moderna, legible y profesional.



## 🧩 Stack Tecnológico

| Herramienta | Uso |
|--------------|------|
| 🧱 **Astro.js** | Framework base del sitio |
| 🎨 **TailwindCSS** | Estilos y diseño responsive |
| 📝 **Markdown / Astro Content** | Gestión de writeups y artículos |
| ⚙️ **TypeScript** | Tipado y consistencia de componentes |
| ☁️ **GitHub Pages** | Hosting estático |
| 🧰 **Node.js + npm** | Dependencias y build tools |


## 🗂️ Estructura del Proyecto

```bash

📦 Portafolio-Web
┣ 📁 public/              # Archivos estáticos (imágenes, íconos)
┣ 📁 src/
┃ ┣ 📁 components/        # Componentes UI reutilizables
┃ ┣ 📁 content/
┃ ┃ ┣ 📁 writeups/        # Writeups en formato Markdown
┃ ┃ ┣ 📁 articles/        # Artículos técnicos
┃ ┣ 📁 layouts/           # Layouts globales (BaseLayout, etc.)
┃ ┣ 📁 pages/             # Páginas principales del sitio
┃ ┣ 📁 scripts/           # Scripts JS (índice lateral, interacciones)
┃ ┣ 📁 styles/            # Estilos globales y de secciones
┣ 📄 astro.config.mjs     # Configuración de Astro
┣ 📄 tailwind.config.mjs  # Configuración de TailwindCSS
┣ 📄 package.json         # Dependencias y scripts
┗ 📄 README.md            # Este documento

```

## ⚙️ Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/angelcorral2021/Portafolio-Web.git
cd Portafolio-Web

# 2. Instalar dependencias
npm install

# 3. Ejecutar entorno local
npm run dev

# 4. Abrir en navegador
http://localhost:4321

```

## 🌐 Despliegue en GitHub Pages

El sitio se **construye estáticamente** y se despliega automáticamente mediante **GitHub Actions**.

### Configuración de Astro

Archivo `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://angelcorral2021.github.io",
  base: "/Portafolio-Web/",
  integrations: [tailwind()],
});

```

### Workflow automático (`.github/workflows/deploy.yml`)

```yaml

name: Deploy Astro to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build site
        run: npm run build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist

```

> ✅ Cada vez que haces `git push` en `main`, el sitio se construye y se publica automáticamente en **GitHub Pages**.


## 🧠 Contenido Dinámico (Writeups / Artículos)

Los writeups y artículos se definen en Markdown dentro de `src/content/`.
Cada archivo contiene un **frontmatter** con metadatos:

```markdown
---
title: "SoulMate - HackTheBox"
date: 2025-10-25
difficulty: "Intermedio"
platform: "Hack The Box"
ip: "10.10.11.68"
domain: "planning.htb"
image: "/img/soulmatehtb.png"
tags: ["Linux", "Docker", "Grafana"]
description: "Explotación completa de la máquina SoulMate."
---
```

El contenido se renderiza automáticamente en la ruta `/writeups/[slug]`.


## 💅 Diseño Visual

* Paleta: **oscura con acentos neon (#00b3ff / #00ffb2)**
* Tipografía: *Inter*, *JetBrains Mono*
* Layout responsivo, optimizado para lectura técnica
* Integración con efectos *Glass UI* y animaciones sutiles


## 🧰 Scripts Disponibles

| Comando           | Descripción                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Ejecuta entorno local                       |
| `npm run build`   | Genera sitio estático                       |
| `npm run preview` | Previsualiza la build localmente            |
| `npm run deploy`  | (opcional) Despliegue manual a GitHub Pages |

---

## 📈 Capturas del Sitio

| Sección       | Vista                                                  |
| :------------ | :----------------------------------------------------- |
| **Inicio**    | ![Home Preview](./public/img/preview_home.png)         |
| **Writeups**  | ![Writeups Preview](./public/img/preview_writeups.png) |
| **Proyectos** | ![Projects Preview](./public/img/preview_projects.png) |


## 🧩 Próximas Mejoras

* [ ] Buscador de writeups con filtro por dificultad.
* [ ] CMS local para gestión de artículos (Markdown).
* [ ] Soporte para modo claro/oscuro.
* [ ] Integración con API de GitHub para proyectos activos.
* [ ] Sistema de comentarios técnico en cada writeup.


## 👨‍💻 Autor

**Ángel Corral**
Desarrollador Web & Entusiasta de la Ciberseguridad

📧 **Email:** [angelcorral2023@gmail.com](mailto:angelcorral2023@gmail.com)
🐙 **GitHub:** [angelcorral2021](https://github.com/angelcorral2021)
💼 **LinkedIn:** [linkedin.com/in/angelcorral](https://linkedin.com/in/angelcorral)


## 📄 Licencia

Este proyecto se distribuye bajo la **licencia MIT**.
Eres libre de usarlo, modificarlo y distribuirlo con atribución.




