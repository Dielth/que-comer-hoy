/*
 * motor.js — Motor de lógica difusa
 *
 * Cada platillo es un conjunto difuso sobre el universo de 15 características
 * (grado de pertenencia en [0,1]). El perfil del usuario es otro conjunto difuso
 * sobre el mismo universo. La coincidencia se mide con la INTERSECCIÓN DIFUSA:
 *
 *     (A ∩ B)(x) = min( A(x), B(x) )
 *
 * y la suma de la intersección (cardinalidad) mide qué tan parecidos son:
 *
 *     |A ∩ B| = Σ min( A(x), B(x) )
 *
 * Como cada usuario marca un número distinto de características, el umbral de
 * confianza se aplica sobre el grado de coincidencia relativo:
 *
 *     coincidencia = |A ∩ B| / |B|     (B = perfil del usuario)
 */

// Intersección difusa elemento a elemento
function interseccion(a, b) {
  return a.map((x, i) => Math.min(x, b[i]));
}

// Cardinalidad escalar (suma de grados)
function suma(v) {
  return v.reduce((acc, x) => acc + x, 0);
}

/**
 * Evalúa un perfil de usuario contra el banco de platillos.
 * @param {number[]} perfil  15 valores en [0,1]
 * @param {object[]} banco   lista de platillos {id, nombre, valores[15]}
 * @param {object}   cfg     {umbral, margenEmpate, minCaracteristicas, maxAlternativas}
 * @returns {{estado:string, total:number, activas:number, ranking:object[], mejores:object[]}}
 *   estado: "faltan-datos" | "sin-resultado" | "ok"
 */
function evaluar(perfil, banco, cfg) {
  const total = suma(perfil);                       // |B|
  const activas = perfil.filter(v => v > 0).length;

  if (activas < cfg.minCaracteristicas) {
    return { estado: "faltan-datos", total, activas, ranking: [], mejores: [] };
  }

  const ranking = banco.map(p => {
    const inter = interseccion(p.valores, perfil);
    const sigma = suma(inter);
    return { platillo: p, interseccion: inter, suma: sigma, coincidencia: sigma / total };
  }).sort((x, y) => y.suma - x.suma);

  const mejor = ranking[0];
  if (mejor.coincidencia < cfg.umbral) {
    return { estado: "sin-resultado", total, activas, ranking, mejores: [] };
  }

  // Resultado principal + empates / cercanos (también confiables)
  const mejores = ranking
    .filter((r, i) => i === 0 ||
      (r.coincidencia >= cfg.umbral && r.suma >= mejor.suma * cfg.margenEmpate))
    .slice(0, 1 + cfg.maxAlternativas);

  return { estado: "ok", total, activas, ranking, mejores };
}

if (typeof module !== "undefined") {
  module.exports = { interseccion, suma, evaluar };
}
