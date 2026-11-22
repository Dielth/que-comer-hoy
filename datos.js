/*
 * datos.js — "Base de datos" del sistema (Módulo Pre-cargado)
 *
 * Diseño relacional (ver diagrama en el reporte):
 *   CARACTERISTICA(id, clave, nombre, tipo, ...)   -> 15 filas
 *   PLATILLO(id, nombre, emoji, descripcion)       -> 20 filas
 *   VALOR(platillo_id, caracteristica_id, valor)   -> 20 x 15 = 300 filas, valor en [0,1]
 *
 * Aquí VALOR se guarda como la matriz "valores" dentro de cada platillo
 * (posición i = característica con id i+1).
 *
 * Estos valores pertenecen al SISTEMA; el usuario nunca los ve ni los captura.
 */

// Etiquetas por defecto del deslizador (5 niveles -> 0, .25, .5, .75, 1)
const NIVELES = [0, 0.25, 0.5, 0.75, 1];

const CARACTERISTICAS = [
  { id: 1,  nombre: "Picante",            pregunta: "¿Qué tanto picante se te antoja?",
    tipo: "slider", extremos: ["😌", "🥵"],
    etiquetas: ["Nada de picante", "Un toquecito", "Normalito", "Bien picoso", "Que me haga llorar"] },
  { id: 2,  nombre: "Dulce",              pregunta: "¿Se te antoja algo dulce?",
    tipo: "slider", extremos: ["🧂", "🍰"],
    etiquetas: ["Nada dulce", "Apenas dulce", "Más o menos", "Bastante dulce", "¡Puro postre!"] },
  { id: 3,  nombre: "Rapidez",            pregunta: "¿Qué tan rápido lo quieres tener?",
    tipo: "select",
    opciones: [
      { texto: "No tengo prisa, aunque tarde", valor: 0 },
      { texto: "Puedo esperar un ratito",      valor: 0.25 },
      { texto: "Que no tarde demasiado",       valor: 0.5 },
      { texto: "Rapidito, por favor",          valor: 0.75 },
      { texto: "¡Ya, tengo hambre!",           valor: 1 } ] },
  { id: 4,  nombre: "Económico",          pregunta: "¿Qué tan barato lo quieres?",
    tipo: "select",
    opciones: [
      { texto: "Hoy me doy un lujo",          valor: 0 },
      { texto: "Gasto lo que sea necesario",  valor: 0.25 },
      { texto: "Un precio normal",            valor: 0.5 },
      { texto: "Que no salga caro",           valor: 0.75 },
      { texto: "Lo más barato posible",       valor: 1 } ] },
  { id: 5,  nombre: "Saludable",          pregunta: "¿Qué tan sano quieres comer hoy?",
    tipo: "slider", extremos: ["🍔", "🥗"],
    etiquetas: ["Hoy no me importa", "Un poco sano", "Equilibrado", "Bastante sano", "Lo más sano posible"] },
  { id: 6,  nombre: "Llenador",           pregunta: "¿Qué tan hambriento estás?",
    tipo: "slider", extremos: ["🙂", "😋"],
    etiquetas: ["Solo un bocadillo", "Algo ligero", "Hambre normal", "Mucha hambre", "¡Me comería un buey!"] },
  { id: 7,  nombre: "Caliente",           pregunta: "¿Lo quieres calientito?",
    tipo: "select",
    opciones: [
      { texto: "Mejor frío o fresco",    valor: 0 },
      { texto: "Tibio, a temperatura ambiente", valor: 0.25 },
      { texto: "Me da igual",            valor: 0.5 },
      { texto: "Calientito",             valor: 0.75 },
      { texto: "Humeando de caliente",   valor: 1 } ] },
  { id: 8,  nombre: "Con carne",          pregunta: "¿Qué tanta carne quieres?",
    tipo: "slider", extremos: ["🥬", "🥩"],
    etiquetas: ["Nada de carne", "Poquita", "Algo de carne", "Bastante carne", "¡Muchísima carne!"] },
  { id: 9,  nombre: "Queso y lácteos",    pregunta: "¿Qué tanto queso te late?",
    tipo: "slider", extremos: ["🚫", "🧀"],
    etiquetas: ["Nada de queso", "Un poquito", "Normal", "Bastante queso", "¡Queso hasta en el postre!"] },
  { id: 10, nombre: "Verduras",           pregunta: "¿Qué tantas verduras o fruta quieres?",
    tipo: "slider", extremos: ["🍟", "🥦"],
    etiquetas: ["Ninguna", "Muy pocas", "Algunas", "Varias", "Todas las que haya"] },
  { id: 11, nombre: "Frito o grasoso",    pregunta: "¿Se te antoja algo frito o grasosito?",
    tipo: "select",
    opciones: [
      { texto: "Nada frito, por favor",  valor: 0 },
      { texto: "Casi nada de grasa",     valor: 0.25 },
      { texto: "Un poquito no hace daño", valor: 0.5 },
      { texto: "Sí, grasosito",          valor: 0.75 },
      { texto: "¡Bien frito y grasoso!", valor: 1 } ] },
  { id: 12, nombre: "Tradicional mexicano", pregunta: "¿Qué tan mexicano lo quieres?",
    tipo: "slider", extremos: ["🌍", "🇲🇽"],
    etiquetas: ["De cualquier parte del mundo", "Poco tradicional", "Me da igual", "Bien mexicano", "¡Tradición de la abuela!"] },
  { id: 13, nombre: "Para compartir",     pregunta: "¿Con quién vas a comer?",
    tipo: "select",
    opciones: [
      { texto: "Solo para mí",                   valor: 0 },
      { texto: "Casi solo, aunque comparta algo", valor: 0.25 },
      { texto: "Con una persona",                valor: 0.5 },
      { texto: "Con un grupito",                 valor: 0.75 },
      { texto: "Con toda la banda",              valor: 1 } ] },
  { id: 14, nombre: "Para llevar",        pregunta: "¿Dónde lo vas a comer?",
    tipo: "select",
    opciones: [
      { texto: "Sentado y con calma",            valor: 0 },
      { texto: "En mesa, aunque sea rápido",     valor: 0.25 },
      { texto: "Donde se pueda",                 valor: 0.5 },
      { texto: "Casi caminando",                 valor: 0.75 },
      { texto: "Caminando, con una mano libre",  valor: 1 } ] },
  { id: 15, nombre: "Novedoso",           pregunta: "¿Qué tan aventurero te sientes?",
    tipo: "slider", extremos: ["🏠", "🚀"],
    etiquetas: ["Lo de siempre", "Algo conocido", "Me da igual", "Algo distinto", "¡Quiero probar algo nuevo!"] }
];

// Orden de valores:  1 Picante, 2 Dulce, 3 Rapidez, 4 Económico, 5 Saludable,
// 6 Llenador, 7 Caliente, 8 Con carne, 9 Queso, 10 Verduras, 11 Frito,
// 12 Tradicional, 13 Compartir, 14 Para llevar, 15 Novedoso
const PLATILLOS = [
  { id: 1,  nombre: "Tacos al pastor",         emoji: "🌮", descripcion: "Tortillas con carne de cerdo adobada, piña, cebolla y cilantro.",
    valores: [0.5, 0.1, 0.9, 0.8, 0.3, 0.6, 1.0, 1.0, 0.1, 0.2, 0.2, 1.0, 0.5, 0.9, 0.1] },
  { id: 2,  nombre: "Enchiladas verdes",       emoji: "🫔", descripcion: "Tortillas bañadas en salsa verde, rellenas de pollo y cubiertas de crema y queso.",
    valores: [0.6, 0.0, 0.4, 0.6, 0.4, 0.8, 1.0, 0.6, 0.7, 0.3, 0.3, 1.0, 0.3, 0.1, 0.2] },
  { id: 3,  nombre: "Pozole rojo",             emoji: "🍲", descripcion: "Caldo con maíz cacahuazintle y carne, con lechuga, rábano y limón.",
    valores: [0.5, 0.0, 0.2, 0.5, 0.6, 0.9, 1.0, 0.7, 0.0, 0.5, 0.0, 1.0, 0.4, 0.0, 0.2] },
  { id: 4,  nombre: "Hamburguesa",             emoji: "🍔", descripcion: "Pan con carne de res, queso, jitomate y lechuga.",
    valores: [0.1, 0.2, 0.7, 0.5, 0.2, 0.9, 0.9, 0.9, 0.7, 0.3, 0.5, 0.1, 0.2, 0.8, 0.2] },
  { id: 5,  nombre: "Pizza",                   emoji: "🍕", descripcion: "Masa horneada con salsa de tomate y mucho queso derretido.",
    valores: [0.1, 0.1, 0.5, 0.5, 0.2, 0.8, 0.9, 0.5, 1.0, 0.4, 0.3, 0.0, 1.0, 0.7, 0.3] },
  { id: 6,  nombre: "Sushi",                   emoji: "🍣", descripcion: "Rollos de arroz con pescado, alga y verduras.",
    valores: [0.2, 0.1, 0.4, 0.2, 0.7, 0.5, 0.0, 0.4, 0.2, 0.5, 0.1, 0.0, 0.8, 0.5, 0.9] },
  { id: 7,  nombre: "Ensalada César con pollo", emoji: "🥗", descripcion: "Lechuga fresca con pollo a la plancha, crutones y aderezo.",
    valores: [0.0, 0.1, 0.7, 0.5, 0.9, 0.4, 0.1, 0.6, 0.5, 0.9, 0.1, 0.0, 0.2, 0.3, 0.3] },
  { id: 8,  nombre: "Sopa de verduras",        emoji: "🥣", descripcion: "Caldo caliente con zanahoria, calabacita, chayote y papa.",
    valores: [0.0, 0.1, 0.4, 0.6, 1.0, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0, 0.4, 0.2, 0.0, 0.1] },
  { id: 9,  nombre: "Quesadillas",             emoji: "🧀", descripcion: "Tortillas de maíz o harina rellenas de queso fundido.",
    valores: [0.2, 0.0, 0.8, 0.8, 0.3, 0.6, 0.9, 0.3, 1.0, 0.2, 0.4, 1.0, 0.5, 0.9, 0.0] },
  { id: 10, nombre: "Tamales",                 emoji: "🫓", descripcion: "Masa de maíz envuelta en hoja, rellena de salsa y carne.",
    valores: [0.3, 0.2, 0.6, 0.6, 0.3, 0.7, 1.0, 0.6, 0.2, 0.2, 0.1, 1.0, 0.5, 0.7, 0.1] },
  { id: 11, nombre: "Hot dog",                 emoji: "🌭", descripcion: "Salchicha en pan con cebolla, jitomate, mostaza y cátsup.",
    valores: [0.2, 0.1, 0.9, 0.8, 0.1, 0.6, 0.8, 0.8, 0.3, 0.1, 0.5, 0.2, 0.2, 1.0, 0.1] },
  { id: 12, nombre: "Burrito",                 emoji: "🌯", descripcion: "Tortilla de harina grande con carne, frijoles, arroz y queso.",
    valores: [0.3, 0.0, 0.7, 0.6, 0.4, 0.9, 0.8, 0.8, 0.5, 0.4, 0.3, 0.5, 0.1, 0.9, 0.2] },
  { id: 13, nombre: "Ramen",                   emoji: "🍜", descripcion: "Fideos en caldo caliente con huevo, carne y verduras.",
    valores: [0.4, 0.0, 0.5, 0.4, 0.4, 0.8, 1.0, 0.6, 0.0, 0.4, 0.0, 0.0, 0.1, 0.0, 0.9] },
  { id: 14, nombre: "Chilaquiles",             emoji: "🍳", descripcion: "Totopos en salsa con crema, queso, cebolla y pollo o huevo.",
    valores: [0.6, 0.0, 0.5, 0.6, 0.3, 0.8, 1.0, 0.4, 0.7, 0.1, 0.5, 1.0, 0.3, 0.0, 0.0] },
  { id: 15, nombre: "Hot cakes",               emoji: "🥞", descripcion: "Esponjosos y dulces, con miel, mantequilla o fruta.",
    valores: [0.0, 1.0, 0.6, 0.6, 0.2, 0.6, 0.9, 0.0, 0.2, 0.0, 0.2, 0.2, 0.4, 0.2, 0.1] },
  { id: 16, nombre: "Churros con chocolate",   emoji: "🍩", descripcion: "Masa frita con azúcar y canela, con chocolate caliente.",
    valores: [0.0, 1.0, 0.7, 0.7, 0.0, 0.4, 0.8, 0.0, 0.0, 0.0, 0.9, 0.6, 0.6, 0.8, 0.1] },
  { id: 17, nombre: "Esquites",                emoji: "🌽", descripcion: "Granos de elote en vasito con mayonesa, queso, chile y limón.",
    valores: [0.6, 0.2, 0.9, 1.0, 0.4, 0.4, 0.9, 0.0, 0.6, 0.1, 0.1, 1.0, 0.1, 1.0, 0.0] },
  { id: 18, nombre: "Tacos de pescado",        emoji: "🐟", descripcion: "Pescado empanizado con col, pico de gallo y salsa cremosa.",
    valores: [0.4, 0.0, 0.6, 0.5, 0.7, 0.5, 0.7, 0.3, 0.1, 0.4, 0.6, 0.5, 0.3, 0.9, 0.5] },
  { id: 19, nombre: "Fruta con yogurt",        emoji: "🍓", descripcion: "Fruta de temporada con yogurt natural y granola.",
    valores: [0.0, 0.8, 0.8, 0.7, 0.9, 0.3, 0.0, 0.0, 0.3, 0.3, 0.0, 0.1, 0.2, 0.7, 0.2] },
  { id: 20, nombre: "Pasta Alfredo",           emoji: "🍝", descripcion: "Pasta en salsa cremosa de queso parmesano, con pollo.",
    valores: [0.0, 0.0, 0.5, 0.5, 0.3, 0.9, 1.0, 0.3, 0.9, 0.2, 0.0, 0.0, 0.4, 0.1, 0.4] }
];

// Parámetros del sistema
const UMBRAL_CONFIANZA = 0.65;   // coincidencia mínima (Σmin / Σusuario) para considerar el resultado confiable
const MARGEN_EMPATE    = 0.85;   // otros platillos con ≥ 85 % de la suma del mejor también se muestran
const MIN_CARACTERISTICAS = 3;   // mínimo de características con valor > 0 para poder recomendar
const MAX_ALTERNATIVAS = 3;

if (typeof module !== "undefined") {
  module.exports = { NIVELES, CARACTERISTICAS, PLATILLOS, UMBRAL_CONFIANZA, MARGEN_EMPATE, MIN_CARACTERISTICAS, MAX_ALTERNATIVAS };
}
