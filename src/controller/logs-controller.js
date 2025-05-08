import { CrudFile } from "../services/CrudFile.js"
import { Paths } from "../utils/Paths.js"

/**
 * Controlador responsável por lidar com operações de leitura e remoção de logs do sistema.
 */

export class LogsController {
  /**
   * Lê e retorna os registros de log armazenados em arquivo.
   *
   * @param {import('express').Request} request - Requisição HTTP contendo o tipo de log em `request.params.type`.
   * @param {import('express').Response} response - Resposta com os registros do log ou uma mensagem de ausência.
   *
   * @returns {Promise<void>}
   */

  async index(request, response){
    const { path }  = Paths({ typeController: "logs", type: request.params.type })
    const data = await new CrudFile({ path: path })._Read()
    
    if(data.toString() === "") return response.status(400).json({ message: "Sem registros disponíveis no log." })
    response.status(200).json(data.toString().split('\n'))
  }

  /**
   * Limpa todos os registros de um log específico, sobrescrevendo o conteúdo com uma string vazia.
   *
   * @param {import('express').Request} request - Requisição HTTP contendo o tipo de log em `request.params.type`.
   * @param {import('express').Response} response - Resposta confirmando a remoção dos logs.
   *
   * @returns {Promise<void>}
   */

  async remove(request, response){
    const { path }  = Paths({ typeController: "logs", type: request.params.type })
    await new CrudFile({ path: path })._Write("")
    response.status(200).json({ message: "Logs removido com sucesso." })
  }
}