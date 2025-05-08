/**
 * @property {number} page pagina atual.
 * @property {number} limit total de mostragem por pagina.
 * @typedef {Object} data database encontrado para mostragem
 * @returns {{ results: any[], totalPage: number }} Resultado da busca paginada
 */

export const pagination = (page, limit, data) => {
  const startIndex = (page - 1) * limit
  const endIndex = page * limit

  const results = {}

  if(endIndex < data.length){
    results.next = {
      page: page + 1,
      limit: limit
    }
  }

  if(startIndex > 0){
    results.prev = {
      page: page - 1,
      limit: limit
    }
  }
  results.result = data.slice(startIndex, endIndex)
  const totalPage = Math.ceil(data.length / limit)

  return {
    results,
    totalPage
  }
}