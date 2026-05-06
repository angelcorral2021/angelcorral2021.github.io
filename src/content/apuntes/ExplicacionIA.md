---
title: "Conceptos de I.A"
description: "Descripcion"
date: "2026-04-21"
tags: ["IA"]
---


**Definiciones Fundamentales**

- **LLM (Cerebro):** Modelo base de aprendizaje profundo. Ejecuta el procesamiento, comprensión y razonamiento cognitivo. Carece de capacidad de interacción directa con el entorno. Ejemplos: GPT-4, Claude, Gemini.
    
- **Agente (Orquestador):** Entidad de control autónomo. Utiliza el LLM como motor lógico para establecer ciclos de percepción, planificación y acción. Descompone tareas y delega la ejecución física.
    
- **Skills (Herramientas):** Módulos operativos (APIs, scripts). Proveen capacidades funcionales específicas bajo demanda. Operan en estricta subordinación al Agente; no poseen autonomía.
    
- **MCP (Protocolo):** Estándar de comunicación unificado. Abstrae y estandariza la conexión entre el Agente, las Skills y los ecosistemas de datos externos, eliminando integraciones individuales.

- **RAG (Retrieval-Augmented Generation):** Arquitectura de inyección de contexto. Extrae datos externos y los inserta en el prompt del LLM antes de la generación para fundamentar la respuesta y mitigar alucinaciones.
    
- **Base de Datos Vectorial:** Infraestructura de almacenamiento semántico. Indexa embeddings matemáticos y ejecuta la recuperación de datos requerida por el proceso RAG.
    
- **Memoria de Agente:** Subsistema de estado. Retiene datos a corto plazo (dentro de la ventana de contexto actual) y a largo plazo (almacenamiento persistente) para mantener la coherencia operativa entre ejecuciones.
    
- **HITL (Human-in-the-Loop):** Nodo de validación de seguridad. Interrumpe la autonomía del agente antes de la ejecución de Skills críticas, exigiendo autorización o corrección manual.
    
- **Sistemas Multi-Agente:** Topología de red distribuida. Coordina múltiples Agentes, cada uno con LLMs, instrucciones y Skills independientes, delegando tareas bajo un enrutamiento predefinido.
    

**Modelo Jerárquico Integral (De núcleo a macro-estructura)**

1. **LLM (Núcleo):** Procesamiento de lenguaje e inferencia cognitiva.
    
2. **Agente (Control):** Lógica de orquestación. Integra la **Memoria de Agente** para conservar el estado durante sus ciclos de percepción, planificación y acción.
    
3. **Skills (Ejecución):** Herramientas subordinadas al Agente. Una de estas Skills es la encargada de consultar la **Base de Datos Vectorial** para ejecutar la arquitectura **RAG**.
    
4. **MCP (Infraestructura de red):** Protocolo que estandariza la conexión física hacia esas bases de datos y herramientas externas.
    
5. **HITL (Capa de supervisión):** Control de acceso superpuesto entre la decisión del Agente y la ejecución de la Skill.
    
6. **Sistema Multi-Agente (Nivel Organizacional):** Estructura superior que agrupa y coordina múltiples iteraciones de las capas 1 al 5.
    

**Flujo de Operación de Extremo a Extremo** El Agente recibe una instrucción y recupera el contexto previo desde su Memoria. Determina la necesidad de información privada y utiliza una Skill (conectada vía MCP) para consultar una Base de Datos Vectorial (RAG). El Agente inyecta estos datos recuperados en el LLM para formular un plan de acción exacto. Si el plan requiere alterar un sistema externo (ej. realizar un pago o borrar un registro), un nodo HITL pausa el flujo hasta recibir aprobación humana. Tras la confirmación, se ejecuta la Skill final. En topologías avanzadas, este flujo completo opera dentro de un Sistema Multi-Agente, donde el resultado validado de este primer Agente se transfiere como instrucción inicial al siguiente Agente de la red.


---

Los modelos de lenguaje de gran tamaño (LLMs) se clasifican principalmente por su desarrollador y arquitectura. Aquí los ejemplos más destacados divididos por su naturaleza:

## Modelos de Código Cerrado (Propietarios)

Estos modelos son accesibles mediante API o interfaces específicas y su código/pesos no son públicos.

- **GPT-4o / GPT-4 Turbo (OpenAI):** Estándar actual en razonamiento complejo y multimodalidad.
    
- **Claude 3.5 Sonnet / Opus (Anthropic):** Destacados por su tono humano, capacidades de programación y gran ventana de contexto.
    
- **Gemini 1.5 Pro / Flash (Google):** Especializados en procesamiento de contexto masivo (hasta millones de tokens) y ecosistema multimodal nativo.
    
- **o1-preview (OpenAI):** Modelo enfocado específicamente en razonamiento lógico y resolución de problemas complejos mediante "cadena de pensamiento".
    

## Modelos de Código Abierto (Open Weights)

Modelos cuyos pesos están disponibles para ser ejecutados en infraestructura propia o local.

- **Llama 3.1 / 3.2 (Meta):** El referente más importante del sector abierto, con variantes desde 1B hasta 405B de parámetros.
    
- **Mistral Large 2 / Mixtral 8x7B (Mistral AI):** Modelos europeos conocidos por su eficiencia y rendimiento en arquitecturas MoE (Mixture of Experts).
    
- **Gemma 2 (Google):** Versiones ligeras y abiertas basadas en la tecnología de Gemini.
    
- **Falcon 180B (TII):** Uno de los modelos abiertos más masivos desarrollados en los Emiratos Árabes Unidos.
    
- **DeepSeek-V2.5:** Modelo chino optimizado para tareas de programación y matemáticas con alta eficiencia de costos.
    

## Modelos Especializados

- **Codestral (Mistral AI):** Optimizado exclusivamente para generación y depuración de código.
    
- **Med-PaLM 2 (Google):** Ajustado para el dominio médico y análisis de datos clínicos.
    
- **SQLCoder (Defog):** Diseñado para traducir lenguaje natural a consultas SQL de forma precisa.

---

## Agentes de Productividad y Autonomía (Agentes de Propósito General)

- **AutoGPT / BabyAGI:** Proyectos pioneros de código abierto que, a partir de un objetivo (ej. "crea una empresa de zapatos"), desglosan tareas, buscan en internet y ejecutan código de forma recursiva hasta completar la meta.
    
- **OpenDevin / Devin:** Diseñados específicamente para ingeniería de software. Pueden escribir código, depurar errores, navegar por repositorios de GitHub y desplegar aplicaciones por sí mismos.
    
- **Microsoft Copilot Studio Agents:** Herramientas empresariales que permiten crear agentes que consultan bases de datos internas, responden correos de clientes o gestionan inventarios conectándose a sistemas como SAP o Salesforce.
    

## Agentes de Navegación Web y Acción (Computer Use)

- **Claude "Computer Use":** Una capacidad de los modelos de Anthropic que les permite interactuar con una interfaz de computadora como un humano: mover el cursor, hacer clic en botones y escribir texto en cualquier aplicación.
    
- **Skyvern:** Un agente especializado en automatizar flujos de trabajo en navegadores web complejos (como completar formularios de seguros o trámites gubernamentales) que no tienen una API disponible.
    
- **MultiOn:** Un agente diseñado para actuar en la web por ti, capaz de reservar vuelos, pedir comida o realizar compras completando todo el proceso de checkout.
    

## Agentes de Investigación y Análisis

- **GPT Researcher:** Un agente autónomo que realiza investigaciones exhaustivas en la web. Visita más de 20 fuentes por búsqueda, agrega la información y genera un informe detallado con citas bibliográficas.
    
- **Perplexity Pages:** Aunque funciona como buscador, actúa como agente al sintetizar información en tiempo real, decidir qué fuentes son confiables y estructurar artículos completos con formato editorial.
    

## Marcos de Trabajo (Frameworks para crear agentes)

Si buscas ejemplos de la tecnología que permite construirlos:

- **CrewAI:** Permite orquestar "tripulaciones" de agentes donde cada uno tiene un rol (ej. uno es el "Investigador" y otro el "Escritor").
    
- **LangGraph (LangChain):** Enfocado en crear agentes con lógica de ciclos y control de estado muy preciso.
    
- **Microsoft AutoGen:** Especializado en conversaciones multi-agente para resolver tareas complejas mediante la colaboración de varios LLMs.
---

## Skills de Interacción con Archivos y Datos

- **Análisis de Datos (Code Interpreter):** Capacidad de escribir y ejecutar código Python para procesar archivos CSV o Excel, generar gráficos y realizar cálculos estadísticos.
    
- **Lectura de Documentos (PDF/OCR):** Extraer texto y estructura de documentos escaneados o manuales técnicos de gran extensión.
    
- **Gestión de Bases de Datos:** Capacidad de traducir lenguaje natural a SQL para consultar, insertar o actualizar registros en una base de datos corporativa.
    

## Skills de Navegación y Búsqueda

- **Búsqueda en Tiempo Real (Web Search):** Acceder a motores de búsqueda para obtener información actualizada que no estaba en su entrenamiento original.
    
- **Web Scraping:** Extraer información específica de un sitio web (precios, noticias, especificaciones) para procesarla.
    
- **Navegación por Mapas:** Consultar APIs de geolocalización para calcular rutas, distancias o encontrar establecimientos cercanos.
    

## Skills de Comunicación y Aplicaciones

- **Gestión de Correo (Gmail/Outlook):** Leer hilos de correos, redactar borradores o enviar respuestas automáticas según el contexto.
    
- **Automatización de Calendario:** Verificar disponibilidad y agendar reuniones sincronizándose con Google Calendar.
    
- **Mensajería (Slack/WhatsApp):** Enviar notificaciones a canales específicos o interactuar con equipos de trabajo.
    

## Skills Creativas y Multimedia

- **Generación de Imágenes (DALL-E / Imagen):** Crear representaciones visuales a partir de descripciones textuales.
    
- **Conversión de Texto a Voz (TTS):** Generar audio con voz natural a partir de los informes redactados por el agente.
    
- **Traducción Especializada:** Utilizar glosarios técnicos específicos para traducir documentos manteniendo la terminología de una industria particular.
    

## Skills Técnicas de Infraestructura

- **Ejecución de Comandos (Shell):** Interactuar directamente con el sistema operativo para instalar dependencias o configurar servidores.
    
- **Llamadas a API (JSON):** Estructurar peticiones a cualquier servicio externo que tenga una interfaz programable (clima, bolsa de valores, estado de envíos).
    

> **Diferencia clave:** Mientras que el **LLM** es el conocimiento general y el **Agente** es el ejecutor con autonomía, la **Skill** es la "herramienta" en el cinturón del agente que le permite afectar o leer el entorno.
