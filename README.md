✔️ Compatibilidad ExtendScript — Illustrator CS6–2026
Evita funciones modernas (como Math.sign), usa variables bien delimitadas, y no hay llaves ni variables fuera de ámbito.

✔️ Interfaz de diálogo
Solicita el lado en mm y el grosor, valida correctamente los valores ingresados antes de proceder.

✔️ Cálculo geométrico
Convierte el lado en mm a puntos, calcula la separación real de líneas en base a la geometría isométrica, y añade márgenes extra para asegurar que la cuadrícula cubre todo el artboard, aunque esté desplazada.

✔️ Creación de guías
Las líneas verticales y diagonales se crean como guías, garantizando un resultado editable y útil para diseño.

✔️ Margen geométrico
El margen se calcula considerando las diagonales y el tamaño del artboard, asegurando que ninguna zona queda sin cubrir.

✔️ Estructura y flujo

    Verifica si hay un documento abierto.
    Pregunta al usuario los parámetros clave.
    Valida las entradas.
    Crea una capa de guías, añade las líneas según geometría isométrica (verticales, diagonales 330° y 210°), y la bloquea al final.
    Da retroalimentación con un alerta una vez generado.

Detalle adicional:
La función sign es totalmente válida y compatible con versiones antiguas de ExtendScript.
El uso de forStep garantiza que el iterador funcione para todos los casos (pasos positivos, rango inverso, etc.).
