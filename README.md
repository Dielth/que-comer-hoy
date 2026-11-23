# 🍽️ ¿Qué comer hoy?
### Recomendador de platillos aplicando Lógica Difusa

Proyecto Final de **Inteligencia Artificial** · Universidad Autónoma de Querétaro · 6.º semestre

**Equipo:** Arturo Bravo Reyes · Diego Mendoza Chávez

🔗 **Sistema en línea:** https://dielth.github.io/que-comer-hoy/

---

## ¿De qué trata?

El usuario describe su antojo con frases cotidianas («bien picoso», «que no salga caro», «calientito») usando deslizadores y menús desplegables, sin ver ni escribir números. El sistema lo compara contra un banco de **20 platillos** y recomienda el que más se parece. Si ninguno se parece lo suficiente, responde *«no tengo suficiente información»* en lugar de forzar una recomendación.

## Cómo funciona (lógica difusa)

- Cada platillo es un **conjunto difuso** sobre **15 características** (picante, dulce, rapidez, económico, saludable, llenador, caliente, con carne, queso, verduras, frito, tradicional, para compartir, para llevar, novedoso), con grados de pertenencia en [0, 1].
- El antojo del usuario es otro conjunto difuso sobre las mismas 15 características.
- La coincidencia se mide con la **intersección difusa**:

  `(A ∩ B)(x) = min(A(x), B(x))`  y  `|A ∩ B| = Σ min(A(x), B(x))`

- Para decidir si el resultado es confiable se usa la coincidencia relativa `|A ∩ B| / |B|` contra un **umbral de 65 %**.
- Se pide mover al menos 3 controles y se muestran hasta 3 alternativas cercanas (≥ 85 % de la suma del mejor).

## Módulos

| Módulo | Descripción |
|---|---|
| Presentación | Título, nombres del equipo y pasos de uso |
| Banco de platillos (pre-cargado) | 20 platillos × 15 características, con ID único |
| Captura del perfil | 15 controles en lenguaje cotidiano (9 deslizadores, 6 menús) |
| Búsqueda / recomendación | Intersección difusa, umbral, ranking y cálculo paso a paso |

## Estructura del repositorio

```
├── index.html    Interfaz (presentación, captura, resultado, banco)
├── estilos.css   Estilos
├── datos.js      "Base de datos": características, platillos y parámetros
├── motor.js      Motor de lógica difusa (intersección, umbral, ranking)
└── app.js        Lógica de la interfaz
```

## Ejecutar en local

No requiere instalación ni dependencias: descarga el repositorio y abre `index.html` en cualquier navegador.

## Probar el motor

`motor.js` y `datos.js` también funcionan en Node.js:

```js
const d = require("./datos.js"), m = require("./motor.js");
const cfg = { umbral: d.UMBRAL_CONFIANZA, margenEmpate: d.MARGEN_EMPATE,
              minCaracteristicas: d.MIN_CARACTERISTICAS, maxAlternativas: d.MAX_ALTERNATIVAS };
console.log(m.evaluar(/* vector de 15 valores en [0,1] */, d.PLATILLOS, cfg));
```

## Tecnologías

HTML, CSS y JavaScript puros (sitio estático publicado con GitHub Pages).

## Referencias

- Zadeh, L. A. (1965). Fuzzy sets. *Information and Control, 8*(3), 338–353.
- Klir, G. J., & Yuan, B. (1995). *Fuzzy Sets and Fuzzy Logic: Theory and Applications*. Prentice Hall.
- Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4.ª ed.). Pearson.
