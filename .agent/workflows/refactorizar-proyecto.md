---
description: Plan de refactorización del proyecto
---

# Plan de Refactorización del Proyecto

## Objetivos
1. Organizar la estructura de carpetas de manera profesional
2. Eliminar archivos duplicados y obsoletos
3. Mejorar la separación de responsabilidades
4. Facilitar el mantenimiento futuro

## Estructura Actual (Problemas)
```
/
├── index.html (duplicado, debería estar solo en dist/)
├── articles/ (carpeta obsoleta)
├── contact/ (carpeta obsoleta)
├── projects/ (carpeta obsoleta)
├── writeups/ (carpeta obsoleta)
├── img/ (debería estar en public/)
├── services/ (carpeta obsoleta)
├── src/
│   ├── components/ (bien)
│   ├── content/ (bien)
│   ├── layouts/ (bien)
│   ├── pages/ (bien)
│   └── styles/ (bien)
└── scripts/ (bien)
```

## Estructura Propuesta
```
/
├── .agent/
│   └── workflows/
├── .github/
├── public/
│   ├── images/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   └── ThemeToggle.astro
│   │   ├── cards/
│   │   │   ├── ProjectCard.astro
│   │   │   ├── WriteupCard.astro
│   │   │   └── Card.astro
│   │   └── sections/
│   │       └── Hero.astro
│   ├── content/
│   │   ├── apuntes/
│   │   ├── projects/
│   │   ├── writeups/
│   │   └── config.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ProjectLayout.astro
│   │   └── MarkdownLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── apuntes/
│   │   ├── projects/
│   │   ├── writeups/
│   │   ├── contact.astro
│   │   └── services.astro
│   ├── styles/
│   │   └── global.css
│   └── utils/
│       └── (funciones auxiliares si es necesario)
├── scripts/
│   ├── sync-heroes.js
│   └── validate-heroes.js
├── astro.config.mjs
├── package.json
├── tailwind.config.cjs
├── tsconfig.json
└── README.md
```

## Pasos de Refactorización

### 1. Reorganizar Componentes
- Crear subcarpetas: `common/`, `cards/`, `sections/`
- Mover componentes a sus respectivas carpetas

### 2. Mover Imágenes
- Mover contenido de `/img/` a `/public/images/`
- Actualizar referencias en el código

### 3. Limpiar Archivos Obsoletos
- Eliminar `/index.html` de la raíz
- Eliminar carpetas obsoletas: `/articles/`, `/contact/`, `/projects/`, `/writeups/`, `/services/`
- Mantener solo `/dist/` para archivos generados

### 4. Mejorar Layouts
- Renombrar `ProjectLayout.astro` a `MarkdownLayout.astro` (más descriptivo)
- Asegurar consistencia en todos los layouts

### 5. Crear Utilidades (si es necesario)
- Crear carpeta `/src/utils/` para funciones auxiliares
- Mover lógica reutilizable

### 6. Actualizar Configuración
- Verificar que todas las rutas en `astro.config.mjs` sean correctas
- Actualizar scripts en `package.json` si es necesario

### 7. Actualizar README
- Documentar la nueva estructura
- Añadir instrucciones claras de desarrollo

## Beneficios Esperados
- ✅ Estructura más clara y profesional
- ✅ Fácil navegación y mantenimiento
- ✅ Separación clara entre código fuente y archivos generados
- ✅ Mejor escalabilidad para futuras funcionalidades
- ✅ Eliminación de archivos duplicados y obsoletos
