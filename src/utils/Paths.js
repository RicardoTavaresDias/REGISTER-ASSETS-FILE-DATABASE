import { env } from "../config/env.js"

/**
 * Mapea dinâmico de caminhos de arquivo chamada da classes
 * 
 * @typedef {Object} Element
 * @property {'suggestions' | 'logs'} typeController Tipo da função que está chamando: 'suggestions' ou 'logs'.
 * @property {'equipment' | 'sector' | 'units' | 'error'} type Tipo do elemento.
 */

/**
 * Retorna o caminho e tipo dependendo do tipoController.
 * @param {Element} element Objeto contendo informações de tipo e controle.
 * @returns {{ path: string, type?: string }} Objeto contendo o caminho do arquivo (`path`) e, quando aplicável, o tipo de dado (`type`).
 */

export function Paths(element){
  const map = {
    suggestions: {
      equipment: { path: env.EQUIPMENT, value: element },
      sector: { path: env.SECTOR, value: element },
      units: { path: env.UNITS, value: element }
    },
    logs: {
      error: { path: env.LOGERROR },
      equipment: { path: env.LOGEQUIPMENT },
      sector: { path: env.LOGSECTOR },
      units: { path: env.LOGUNITS }
    }
  }

  if (!map[element.typeController][element.type]) throw new Error("Tipo inválido: equipment, sector ou units")

  // Removendo typeController
  const { path, value } = map[element.typeController][element.type] || ""
  const { type } = value || ""
    
  return  value ? { path, type } : { path } 
}