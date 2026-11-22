/* app.js — interfaz: navegación, captura del perfil, resultados y banco de platillos */

const CFG = {
  umbral: UMBRAL_CONFIANZA,
  margenEmpate: MARGEN_EMPATE,
  minCaracteristicas: MIN_CARACTERISTICAS,
  maxAlternativas: MAX_ALTERNATIVAS
};

const $ = (s, r = document) => r.querySelector(s);
const fmt = n => (Math.round(n * 100) / 100).toString();
const pct = n => Math.round(n * 100) + " %";

/* ---------- Navegación ---------- */
function ir(id) {
  document.querySelectorAll(".vista").forEach(v => v.classList.toggle("activa", v.id === id));
  document.querySelectorAll("nav button").forEach(b => b.classList.toggle("activo", b.dataset.ir === id));
  window.scrollTo({ top: 0 });
  if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-ir]");
  if (b) ir(b.dataset.ir);
});

/* ---------- Construcción del formulario ---------- */
function construirFormulario() {
  const cont = $("#preguntas");
  cont.innerHTML = "";
  CARACTERISTICAS.forEach(c => {
    const div = document.createElement("div");
    div.className = "pregunta";
    if (c.tipo === "slider") {
      div.innerHTML = `
        <div class="q">${c.pregunta}</div>
        <div class="slider-fila">
          <span class="emo">${c.extremos[0]}</span>
          <input type="range" id="c${c.id}" min="0" max="4" step="1" value="0" aria-label="${c.nombre}">
          <span class="emo">${c.extremos[1]}</span>
        </div>
        <div class="etiqueta-valor" id="e${c.id}">${c.etiquetas[0]}</div>`;
      const r = div.querySelector("input");
      r.addEventListener("input", () => { $("#e" + c.id).textContent = c.etiquetas[r.value]; });
    } else {
      div.innerHTML = `
        <div class="q">${c.pregunta}</div>
        <select id="c${c.id}" aria-label="${c.nombre}">
          ${c.opciones.map((o, i) => `<option value="${i}">${o.texto}</option>`).join("")}
        </select>`;
    }
    cont.appendChild(div);
  });
}

/* ---------- Captura: traduce las respuestas a valores difusos (invisibles para el usuario) ---------- */
function leerPerfil() {
  return CARACTERISTICAS.map(c => {
    const idx = parseInt($("#c" + c.id).value, 10);
    return c.tipo === "slider" ? NIVELES[idx] : c.opciones[idx].valor;
  });
}
function fijarPerfilPorIndices(indices) {
  CARACTERISTICAS.forEach((c, i) => {
    const el = $("#c" + c.id);
    el.value = indices[i];
    if (c.tipo === "slider") $("#e" + c.id).textContent = c.etiquetas[indices[i]];
  });
}

/* ---------- Resultado ---------- */
function tablaCalculo(r, perfil) {
  const cab = CARACTERISTICAS.map(c => `<th title="${c.nombre}">${c.id}</th>`).join("");
  const fila = (cls, nombre, vals, suma) =>
    `<tr class="${cls}"><td class="nom">${nombre}</td>${vals.map(v => `<td>${fmt(v)}</td>`).join("")}<td class="sigma">${suma === null ? "" : fmt(suma)}</td></tr>`;
  return `
    <div class="tabla-wrap"><table>
      <tr><th class="nom">Característica →</th>${cab}<th>Σ</th></tr>
      ${fila("fila-user", "Tu antojo", perfil, suma(perfil))}
      ${fila("", r.platillo.nombre, r.platillo.valores, suma(r.platillo.valores))}
      ${fila("fila-min", "Intersección (mínimos)", r.interseccion, r.suma)}
    </table></div>
    <p class="nota">${CARACTERISTICAS.map(c => c.id + " = " + c.nombre).join(" · ")}</p>`;
}

function mostrarResultado(res, perfil, nombre) {
  const out = $("#resultado");
  const saludo = nombre ? nombre.trim() + ", " : "";

  if (res.estado === "faltan-datos") {
    out.innerHTML = `<div class="tarjeta-res aviso"><h3>Cuéntanos un poquito más 🙂</h3>
      <p>Para poder recomendarte algo necesitamos que muevas al menos <b>${CFG.minCaracteristicas}</b> de los controles
      (ahora llevas ${res.activas}). Mientras más nos cuentes, mejor será la recomendación.</p></div>`;
    return;
  }

  const ranking = res.ranking.map(r => `
      <div class="rank-fila"><span>${r.platillo.emoji} ${r.platillo.nombre}</span>
      <span class="barra-r"><i style="width:${Math.round(r.coincidencia * 100)}%"></i></span>
      <span>${pct(r.coincidencia)}</span></div>`).join("");

  if (res.estado === "sin-resultado") {
    const cerca = res.ranking[0];
    out.innerHTML = `<div class="tarjeta-res aviso">
      <h3>🤔 ${saludo}no tengo suficiente información para recomendarte algo</h3>
      <p>Ningún platillo de nuestro banco se parece lo bastante a lo que describes
      (el más cercano fue <b>${cerca.platillo.nombre}</b>, con solo ${pct(cerca.coincidencia)} de coincidencia,
      y pedimos al menos ${pct(CFG.umbral)}). Prueba combinando antojos más comunes o cambia algunas respuestas.</p>
      <details><summary>Ver ranking completo</summary><div class="rank">${ranking}</div></details></div>`;
    return;
  }

  const [m, ...alt] = res.mejores;
  const altHtml = alt.length ? `
    <h4>También podría gustarte</h4>
    <div class="alternativas">${alt.map(a => `
      <div class="alt"><b>${a.platillo.emoji} ${a.platillo.nombre}</b>${pct(a.coincidencia)} de coincidencia<br><small>${a.platillo.descripcion}</small></div>`).join("")}
    </div>` : "";

  out.innerHTML = `<div class="tarjeta-res">
    <div class="cab-res">
      <div class="emoji-grande">${m.platillo.emoji}</div>
      <div>
        <p>${saludo}hoy te recomendamos:</p>
        <h3>${m.platillo.nombre}</h3>
        <p>${m.platillo.descripcion}</p>
        <p><span class="pct">${pct(m.coincidencia)}</span> de coincidencia con tu antojo</p>
        <div class="medidor"><i style="width:${Math.round(m.coincidencia * 100)}%"></i></div>
      </div>
    </div>
    ${altHtml}
    <details ${document.body.classList.contains("abrir") ? "open" : ""}><summary>¿Cómo calculó el sistema esto? (intersección difusa)</summary>
      ${tablaCalculo(m, perfil)}
      <p class="nota">Para cada característica se toma el <b>mínimo</b> entre tu antojo y el platillo; la suma de esos mínimos (Σ = ${fmt(m.suma)})
      se divide entre la suma de tu antojo (${fmt(res.total)}): ${fmt(m.suma)} / ${fmt(res.total)} = ${pct(m.coincidencia)}.
      Como supera el umbral de ${pct(CFG.umbral)}, el resultado se considera confiable.</p>
    </details>
    <details><summary>Ver ranking completo de los 20 platillos</summary><div class="rank">${ranking}</div></details>
  </div>`;
}

/* ---------- Banco de platillos ---------- */
function construirBanco() {
  const t = $("#tabla-banco");
  const color = v => `background:rgba(228,87,46,${(v * 0.75).toFixed(2)});color:${v > 0.6 ? "#fff" : "inherit"}`;
  t.innerHTML = `<tr><th class="nom">ID · Platillo</th>${CARACTERISTICAS.map(c => `<th class="v">${c.id}. ${c.nombre}</th>`).join("")}</tr>` +
    PLATILLOS.map(p => `<tr><td class="nom">${p.id} · ${p.emoji} ${p.nombre}</td>${p.valores.map(v => `<td style="${color(v)}">${fmt(v)}</td>`).join("")}</tr>`).join("");
}

/* ---------- Demos (para capturas y pruebas): ?demo=antojo | picoso | raro ---------- */
const DEMOS = {
  //        pic dul rap bar sal lle cal car que ver fri tra com por nov
  antojo: [3,  0,  4,  3,  0,  3,  3,  4,  1,  0,  2,  4,  0,  3,  0],  // tacos / quesadillas
  sano:   [0,  1,  3,  1,  4,  1,  1,  0,  0,  4,  0,  0,  0,  2,  1],
  raro:   [4,  4,  0,  0,  4,  4,  0,  4,  4,  4,  4,  0,  4,  4,  4]   // combinación sin platillo parecido
};

/* ---------- Inicio ---------- */
function enviar(e) {
  if (e) e.preventDefault();
  const perfil = leerPerfil();
  const res = evaluar(perfil, PLATILLOS, CFG);
  mostrarResultado(res, perfil, $("#nombre").value);
  $("#resultado").scrollIntoView({ behavior: "smooth", block: "start" });
}

construirFormulario();
construirBanco();
$("#formulario").addEventListener("submit", enviar);
$("#limpiar").addEventListener("click", () => {
  fijarPerfilPorIndices(CARACTERISTICAS.map(() => 0));
  $("#nombre").value = "";
  $("#resultado").innerHTML = "";
});

const params = new URLSearchParams(location.search);
const demo = params.get("demo");
if (params.get("abrir") === "1") document.body.classList.add("abrir");
if (params.get("solo") === "resultado") document.body.classList.add("solo-res");
if (demo && DEMOS[demo]) {
  ir("buscar");
  if (params.get("nombre")) $("#nombre").value = params.get("nombre");
  fijarPerfilPorIndices(DEMOS[demo]);
  if (params.get("enviar") !== "0") {
    const perfil = leerPerfil();
    mostrarResultado(evaluar(perfil, PLATILLOS, CFG), perfil, $("#nombre").value);
  }
} else if (location.hash && $(location.hash) && $(location.hash).classList.contains("vista")) {
  ir(location.hash.slice(1));
}
