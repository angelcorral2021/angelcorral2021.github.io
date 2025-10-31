---
title: "Mejores Podcast"
description: "Web Sobre Podcast en Español"
date: "2024-12-01"
status: "completed"
tags: ["htb", "privilege-escalation", "web", "grafana", "cve-2024-9264", "docker"]
---
# 🎙️ Mejores Podcasts

Una aplicación web moderna construida con Astro.js para descubrir y explorar los mejores capítulos de podcast en español.

## ✨ Características

- 🎥 **Visualización de videos de YouTube** - Muestra videos embebidos con reproductor integrado
- 🖼️ **Miniaturas automáticas** - Genera miniaturas desde YouTube automáticamente
- 📝 **Descripciones detalladas** - Información completa sobre cada episodio
- 🏷️ **Categorización** - Organiza podcasts por categorías (Tecnología, Negocios, Salud, etc.)
- 📱 **Diseño responsivo** - Optimizado para todos los dispositivos
- ⚡ **Rendimiento optimizado** - Construido con Astro.js para máxima velocidad
- 🎨 **UI moderna** - Interfaz atractiva con Tailwind CSS

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.0 o superior
- npm, yarn o pnpm

### Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Inicia el servidor de desarrollo:

```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:4321`

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run astro` - Ejecuta comandos de Astro CLI

## 📁 Estructura del Proyecto

```
├── public/          # Archivos estáticos (favicon, imágenes, etc.)
├── src/
│   ├── components/  # Componentes reutilizables
│   │   ├── sections/        # Componentes de secciones
│   │   │   ├── HumorSection.astro
│   │   │   ├── LatestSection.astro
│   │   │   ├── CultSection.astro
│   │   │   └── BestSection.astro
│   │   ├── PodcastCard.astro    # Tarjeta con like button
│   │   ├── VideoCard.astro      # Tarjeta básica de video
│   │   ├── VideoPlayer.astro    # Reproductor de YouTube
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ToggleTheme.astro    # Botón de cambio de tema
│   ├── data/        # Datos y contenido
│   │   └── podcasts.ts
│   ├── layouts/     # Layouts de página
│   │   └── Layout.astro
│   ├── pages/       # Páginas de la aplicación
│   │   ├── index.astro          # Página principal con 4 secciones
│   │   ├── categorias.astro
│   │   ├── podcast/[id].astro   # Página dinámica de episodio
│   │   ├── show/[showId].astro  # Página dinámica de show
│   │   └── 404.astro
│   ├── types/        # Definiciones de tipos TypeScript
│   │   └── podcast.ts
│   └── utils/        # Utilidades
│       └── likes.ts  # Sistema de gestión de likes
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── COMPONENTS.md     # Documentación de componentes
└── README.md
```

## 📝 Agregar Nuevos Podcasts

Para agregar nuevos episodios de podcast, edita el archivo `src/data/podcasts.ts`:

```typescript
{
  id: 'nuevo-id',
  title: 'Título del Episodio',
  description: 'Descripción detallada del contenido...',
  youtubeId: 'ID_DEL_VIDEO_YOUTUBE',
  thumbnail: 'https://img.youtube.com/vi/ID_DEL_VIDEO/maxresdefault.jpg',
  duration: '45:30',
  date: '2024-02-20',
  category: 'Humor', // Categoría del podcast
  podcastName: 'Nombre del Podcast',
  episodeNumber: 1,
  likes: 0,          // Likes iniciales (opcional)
  rating: 4.5,      // Rating del episodio (opcional)
  isCult: false,    // Marcar como de culto (opcional)
  podcastId: 'podcast-nombre-del-podcast' // ID del show (opcional)
}
```

### Campos Importantes

- **`category`**: Determina en qué sección aparece. Usa `'Humor'` para aparecer en la sección principal.
- **`podcastId`**: Agrupa episodios del mismo podcast para navegación y página de show.
- **`isCult`**: Marca como `true` para aparecer en la sección "De Culto".
- **`rating`**: Influencia el ordenamiento en "Mejores Capítulos".

### Obtener el ID de YouTube

El ID de YouTube se encuentra en la URL del video:
- URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ID: `dQw4w9WgXcQ`

La miniatura se genera automáticamente con el formato:
`https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg`

## 🎨 Personalización

### Colores

Los colores principales se pueden personalizar en los componentes usando las clases de Tailwind CSS. El tema actual usa:
- Púrpura (`purple-600`) como color principal
- Rosa (`pink-600`) para gradientes

### Estilos

El proyecto usa Tailwind CSS. Los estilos están definidos dentro de cada componente usando la directiva `<style>` de Astro.

## 📦 Build para Producción

Para generar una build de producción optimizada:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`, listos para desplegar en cualquier servidor estático o servicio de hosting como:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## 🛠️ Tecnologías Utilizadas

- **[Astro.js](https://astro.build/)** - Framework web moderno con generación estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework de CSS utility-first
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático
- **LocalStorage API** - Persistencia de likes y preferencias de usuario

## 🎯 Funcionalidades Principales

### Sistema de Likes y Rating
- ✅ Botones de like en tarjetas y páginas individuales
- ✅ Persistencia en localStorage
- ✅ Ordenamiento dinámico en "Mejores Podcasts de Humor"
- ✅ Animaciones suaves al dar like

### Navegación
- ✅ Páginas dinámicas para cada episodio (`/podcast/[id]`)
- ✅ Páginas de show completo (`/show/[showId]`)
- ✅ Navegación anterior/siguiente entre episodios
- ✅ Lista completa de episodios del show

### Secciones de la Página Principal
- ✅ **Mejores Podcasts de Humor**: Ordenados por likes + rating
- ✅ **Últimos Capítulos**: Episodios más recientes
- ✅ **De Culto**: Episodios icónicos destacados
- ✅ **Mejores Capítulos**: Ordenados por rating

### Optimizaciones
- ✅ Lazy loading de imágenes
- ✅ Generación estática de páginas (SSG)
- ✅ Componentes modulares y reutilizables
- ✅ Diseño responsive completo
- ✅ Modo oscuro con persistencia

## 📖 Documentación

Para más detalles sobre componentes y arquitectura, consulta [COMPONENTS.md](./COMPONENTS.md).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

¡Disfruta explorando los mejores podcasts! 🎧

