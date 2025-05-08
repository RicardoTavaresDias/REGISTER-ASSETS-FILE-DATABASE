import fs from "node:fs"
import { pagination } from "../utils/pagination.js"
import { normalizeText } from "../lib/normalizeText.js"

/**
 * Abstrair operações de leitura, escrita e remoção de dados em arquivos JSON locais.
 * 
 * @typedef {Object} objectPath
 * @property { 'suggestions' | 'logs' } path caminho do arquivo
 * @property { 'equipment' | 'sector' | 'units' } [type] Tipo do elemento. Só presente em suggestions.
 */ 

 /**
 * @typedef {Object} RequestBody
 * @property { string } name schema request body
 * @property { number } [id] schema request body
 */

export class CrudFile {
  constructor (objectPath){
    this.objectPath = objectPath
  }

  async _Read(){
    try {
      return await fs.promises.readFile(this.objectPath.path, "utf-8")
    }catch(error){
      throw new Error( error.message )
      
    }
  }

  async _Write(data){
    try {
      return fs.promises.writeFile(this.objectPath.path, data)
    }catch(error){
      throw new Error( error.message )
    }
  }
  
  _GetPagination(page, limitPage, data){
    const { results, totalPage } = pagination(page, limitPage, data)
    return { totalPage: totalPage, results }
  }

  async readFile(){
    const data = await this._Read()
    return JSON.parse(data)
  }

  async addWriteFile(requestBody){
    const data = await this._Read()
    const dataJson = JSON.parse(data)

    const mapDataJson = dataJson.map(value => value[this.objectPath.type])
    const existsDataJson = requestBody.data.filter(value => mapDataJson.includes(value.name))
    
    if(existsDataJson.length){
      throw new Error("Item já foi adicionado na lista.")
    }

    for(const items of requestBody.data){
      this.objectPath.type !== "sector" ?
        dataJson.push({ [this.objectPath.type]: items.name }) :
          dataJson.push({ id: items.id, [this.objectPath.type]: items.name })
    }
    
    await this._Write(JSON.stringify(dataJson, null, 1))
    return { message: `Item adicionado com sucesso no ${this.objectPath.type}` }
  }


  async removeWriteFile(RequestBody){
    const data = await this._Read()
    const dataJson = JSON.parse(data)

    const namesBody = RequestBody.data.map(value => value.name)
    const remove = dataJson.filter(value => 
      !normalizeText(String(namesBody)).includes(normalizeText(value[this.objectPath.type]))
    )
    
    if(remove.length === dataJson.length){
      throw new Error("Item não encontrado na base.")
    }
    
    await this._Write(JSON.stringify(remove, null, 1))
    return { message: "Item removido com sucesso." }
  }
}