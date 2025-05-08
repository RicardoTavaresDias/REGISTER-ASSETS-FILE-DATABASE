/**
   * Remove acentos e converte para minúsculas para facilitar comparações.
   * @param {string} [text] Texto a ser normalizado.
   * @returns {string} Texto sem acentos e em minúsculas.
   */

export function normalizeText(text){
  return text.toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")               // remove acentos
  .replace(/[^a-z0-9\s]/gi, "")                                   // remove caracteres especiais
  .replace(/\b([1-9])\b/g, "0$1")                                 // remove zeros à esquerda, exceto 11 a 100
  .replace(/\s+/g, " ")                                           // remove espaços extras
  .trim();
}