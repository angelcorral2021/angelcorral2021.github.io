# 🏭 INGENIERÍA Y AUTOMATIZACIÓN
## EDICIÓN ESPECIAL: PLC, Automatización y Electricidad Industrial

Bienvenido al Módulo Teórico definitivo, basado en los estándares globales de automatización. Esta guía cubre desde los fundamentos eléctricos hasta la programación avanzada de Controladores Lógicos Programables (PLC).

---

## 1. Fundamentos Eléctricos y Circuitos
Para entender el control, primero debemos entender la energía. La **Electricidad** es la energía generada por el movimiento de electrones.
- **Voltaje (V):** Es la fuerza que impulsa el flujo de electrones (medida en Voltios).
- **Corriente (I):** Es el flujo de electrones a través de un conductor (medida en Amperios).
- **Resistencia (R):** Es la oposición al flujo de corriente (medida en Ohmios). La Ley de Ohm establece que `V = I × R`.
- **AC vs DC:** La *Corriente Continua (DC)* fluye de manera constante en una dirección (ej. baterías, sistemas de 24V de un PLC). La *Corriente Alterna (AC)* cambia de dirección periódicamente (ej. red eléctrica de 110V/220V).

### Topologías de Circuitos
- **Serie:** Existe un solo camino para la corriente. Si un elemento falla, se interrumpe todo el circuito. El voltaje se divide proporcionalmente entre los componentes.
- **Paralelo:** Existen varios caminos paralelos. El voltaje es el mismo en todos los puntos y la corriente se divide. Asegura continuidad operativa si una rama falla.
- **Mixto:** Combina configuraciones en serie y paralelo, ofreciendo la máxima flexibilidad en los tableros de control.

---

## 2. Componentes Eléctricos y Tableros de Control
Los gabinetes o tableros centralizan el "cerebro" y protegen todos los componentes de hardware eléctrico. 

- **Interruptor Termomagnético (MCB):** Protege contra sobrecargas (calentamiento prolongado) y cortocircuitos (picos magnéticos inmediatos). 
- **Transformador de Control:** Reduce el voltaje de la red industrial (ej. de 440V a 110V) aislando galvánicamente los circuitos de control para proteger a los operadores de descargas mortales.
- **Fuente de Alimentación AC/DC:** Convierte el voltaje alterno en corriente directa (típicamente 24VDC), el estándar mundial para alimentar PLCs y sensores de campo.
- **Relevador (Relé):** Es un interruptor electromecánico. Utiliza una bobina magnética de baja potencia (bornes A1, A2) para conmutar contactos de alta potencia que pueden ser Normalmente Abiertos (NO) o Normalmente Cerrados (NC).
- **Contactor:** Funciona exactamente igual que un relevador pero está diseñado con platinos más grandes para manejar cargas industriales pesadas, como el encendido de grandes motores trifásicos (contactos de fuerza L1-T1).
- **Guardamotor y Relevador de Sobrecarga (OL):** Protegen integralmente los motores contra daños térmicos al detectar corrientes excesivas mediante un bimetal interno que se flexiona por el calor.
- **VFD (Variador de Frecuencia):** Controla de forma inteligente la velocidad y el torque de motores de inducción ajustando dinámicamente la frecuencia (Hz) y el voltaje suministrado.

---

## 3. Teoría y Conexión de Sensores (PNP vs NPN)

En la industria, conectar correctamente un sensor a un PLC es crítico para no quemar las tarjetas de entrada. Existen dos arquitecturas de transistores fundamentales en DC:

| Tipo de Sensor | Operación de Detección | Estándar de Industria |
| :--- | :--- | :--- |
| **PNP (Sourcing)** | Al detectar un objeto, **entrega +24V** hacia la tarjeta del PLC. La carga (entrada del PLC) debe estar internamente conectada a GND (0V). | Es el estándar más seguro y utilizado globalmente por marcas como Siemens y Allen-Bradley. |
| **NPN (Sinking)** | Al detectar, **conecta la carga a GND (0V)**. Por ende, la tarjeta del PLC debe suministrar los +24V de forma constante. | Típico en PLCs asiáticos (como Mitsubishi) o proyectos de electrónica general. |

---

## 4. Relevadores de Seguridad y Precauciones
La automatización pesada puede ser letal. Para cumplir normas rigurosas como ISO 13849 o IEC 62061 (categorías SIL2/SIL3), se usan sistemas redundantes e infalibles.

- **Lógica de Mando a Dos Manos:** Obliga al operador a presionar dos botones al mismo tiempo (con una ventana de ≤0.5 segundos). Esto garantiza físicamente que tenga las dos manos fuera del área de peligro (prensas hidráulicas, guillotinas).
- **Protección contra Fallos:** Los relés de seguridad detectan cortocircuitos en los cables y evitan "trampas operativas" (como cuando los operadores ponen cinta adhesiva en un botón). Usan *contactos de fuerza guiada* que no se pueden quedar pegados de forma insegura.
- **Safety PLCs (PLCs de Seguridad):** Son versiones especiales (comúnmente pintadas de amarillo o rojo) que procesan la lógica de paradas de emergencia, cortinas láser y radares de zona con procesadores duales redundantes.

---

## 5. Controladores Lógicos Programables (PLC)
El PLC es el cerebro digital de la fábrica. Su funcionamiento se basa en un bucle repetitivo e ininterrumpido conocido como el **Ciclo de Scan**:
1. **Lee Entradas:** Revisa el estado físico del cableado de los sensores (Ej. 0V o 24V).
2. **Ejecuta el Programa:** Resuelve tu código y lógica de escalera desde la primera línea (Rung) hasta la última, en cuestión de microsegundos.
3. **Actualiza Salidas:** Enciende o apaga las salidas físicas (mandando señales a contactores o electroválvulas).

**Tipos de Arquitecturas:**
- *Compactos:* CPU, módulos de I/O (Entradas/Salidas) y fuente de poder están integrados en un solo "ladrillo" económico (ej. S7-1200, Micrologix).
- *Modulares:* Usan un chasis o rack que permite expandir y cambiar tarjetas a medida que crece el proyecto (ej. ControlLogix, S7-1500).

---

## 6. Lógica Programada (Lenguaje Ladder / Escalera)
El lenguaje visual *Ladder Logic* imita perfectamente los diagramas de circuitos de relés de los antiguos electricistas.

### 🔌 Contactos (Entradas Lógicas)
- **NA (Normalmente Abierto / XIC):** Permite el flujo de la corriente virtual si la condición física es `1` (Verdadera).
- **NC (Normalmente Cerrado / XIO):** Permite el flujo virtual únicamente si la condición física es `0` (Falsa).

### ⚡ Bobinas (Salidas Lógicas)
- **OTE (Output Energize):** Activa la salida física mientras la línea (rung) tenga flujo de corriente ininterrumpido.
- **OTL (Latch / Set):** Memoria permanente; mantiene la salida encendida incluso si el sensor que la activó pierde señal.
- **OTU (Unlatch / Reset):** Sirve para apagar una salida que estaba "Latcheada".

### ⏱️ Temporizadores y Contadores
- **TON (On-Delay):** Retrasa la activación. (Empieza a contar tiempo *solo mientras* recibe señal).
- **TOF (Off-Delay):** Retrasa el apagado. (Mantiene algo encendido y empieza a contar tiempo *cuando pierde* la señal).
- **RTO (Retentive Timer):** Acumula tiempo de proceso. Si pierde la señal, pausa su tiempo sin borrarse; requiere una instrucción física de Reset (RES) para volver a cero.
- **CTU (Count Up) y CTD (Count Down):** Contadores que suman o restan inventario o eventos con cada pulso detectado.

### 🧮 Bloques Avanzados: Comparadores y Matemáticas
Un PLC no solo prende focos; procesa datos masivos.
- *Comparadores:* Bloques como **EQU** (Igual), **NEQ** (Diferente), **GRT** (Mayor que), o **LES** (Menor que) verifican parámetros analógicos, decidiendo si un tanque de presión está al límite.
- *Matemáticas:* Instrucciones como **ADD** (Suma), **SUB** (Resta), **MUL** (Multiplicación) o **MOV** (Mover valores) gestionan fórmulas, recetas de productos o reenvían configuraciones numéricas.

---

## 7. Diagramas Eléctricos: Fuerza vs. Control
Al abrir los planos de ingeniería de una máquina industrial, encontrarás dos divisiones claras:
1. **Diagrama de Fuerza (Potencia):** Maneja altas corrientes y voltajes (220V/480V AC) para transportar la energía de los transformadores hacia los motores. Los cables son gruesos.
2. **Diagrama de Control:** Aquí vive el PLC. Maneja la lógica de automatización usando bajo voltaje (típicamente 24V DC o 110V AC) para activar bobinas de forma remota, proporcionando un **aislamiento galvánico** crucial entre la computadora frágil y las tormentas de energía del área de Fuerza.

---

## 8. Protocolos de Comunicación Industrial
Los PLCs modernos de la Industria 4.0 no operan aislados, forman redes neuronales complejas:
- **Nivel de Campo:** Redes como *IO-Link* y *AS-Interface* se usan para diagnosticar a los sensores individuales de forma inteligente.
- **Nivel de Control:** Redes ultra rápidas como *Ethernet/IP*, *PROFINET*, o *EtherCAT* comunican PLCs entre sí, o controlan servos y variadores VFD con latencias de nanosegundos.
- **Nivel de Gestión:** *OPC UA* o *Modbus TCP/IP* envían la información global de la planta hacia pantallas táctiles (SCADA), bases de datos y análisis en la Nube.

---
*Fin del Módulo de Revista. Dirígete a la pestaña de Simulador para comenzar a crear tu primera Lógica de Escalera con los retos interactivos.*
