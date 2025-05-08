import { CrudFile } from "./CrudFile.js"

/**
 * Gera um relatório de ativos classificados em três grupos:
 * 
 * 1. Ativos encontrados no GLPI.
 * 2. Ativos pendentes que precisam ser cadastrados no GLPI.
 * 3. Ativos que precisam ter o setor atualizado no GLPI.
 *
 * O relatório é formatado em texto tabular e salvo no arquivo:
 * `./src/files/pendentes-para-cadastro.txt`
 *
 * @param {Object} dataValidator - Objeto contendo listas de classificação dos ativos.
 * @param {Array<{ sector: string, equipment: string, serie: string }>} dataValidator.existsAssets 
 *   Lista de ativos que foram encontrados no GLPI.
 * @param {Array<{ sector: string, equipment: string, serie: string }>} dataValidator.doesNotExistsAssets 
 *   Lista de ativos ainda não cadastrados no GLPI.
 * @param {Array<{ sector: string, equipment: string, serie: string }>} dataValidator.updateAssets 
 *   Lista de ativos cujo setor precisa ser atualizado no GLPI.
 *
 * @returns {Promise<void>} Promessa que resolve após o arquivo ser escrito com sucesso.
 */

export async function manualReviewLogger(dataValidator){
  const crudFileTxt = new CrudFile({ path: "./src/files/pendentes-para-cadastro.txt" })
  const crudFile = new CrudFile({ path: "./src/files/pendentes-para-cadastro.json" })

  let output = "\n\nCadastros encontrados no glpi. \n\n"
  output += "+------------------------------------------+-----------------+--------------------+\n"
  output += "|                  SETOR                   |   EQUIPAMENTO   |     N° SERIE       |\n"
  output += "+------------------------------------------+-----------------+--------------------+\n"

  for(const item of dataValidator.existsAssets){
    output += `| ${item?.sector?.padEnd(40, " ")} | ${item?.equipment?.padEnd(15, " ")} | ${item?.serie?.padEnd(18, " ")} |\n`
    output += "+------------------------------------------+-----------------+--------------------+\n"
  }


  output += "\n\nCadastros pedentes para ser cadastrado no GLPI. \n\n"
  output += "+--------------------------------+-----------------+--------------------+\n"
  output += "|              SETOR             |   EQUIPAMENTO   |     N° SERIE       |\n"
  output += "+--------------------------------+-----------------+--------------------+\n"

  for(const item of dataValidator.doesNotExistsAssets ){
    output += `| ${item?.sector?.padEnd(30, " ")} | ${item?.equipment?.padEnd(15, " ")} | ${item?.serie?.padEnd(18, " ")} |\n`
    output += "+--------------------------------+-----------------+--------------------+\n"
  }


  output += "\n\nCadastros para atualizar setor no GLPI . \n"
  output += "SETOR DA PLANILHA => SETOR DO GLPI. \n\n"
  output += "+------------------------------------------+-----------------+--------------------+\n"
  output += "|                  SETOR                   |   EQUIPAMENTO   |     N° SERIE       |\n"
  output += "+------------------------------------------+-----------------+--------------------+\n"

  for(const item of dataValidator.updateAssets ){
    output += `| ${item?.sector?.padEnd(40, " ")} | ${item?.equipment?.padEnd(15, " ")} | ${item?.serie?.padEnd(18, " ")} |\n`
    output += "+------------------------------------------+-----------------+--------------------+\n"
  }

  await crudFile._Write( JSON.stringify({
     updateAssets: dataValidator.updateAssets,
     doesNotExistsAssets: dataValidator.doesNotExistsAssets,
     updateAssets: dataValidator.updateAssets
  }, null, 2))

  await crudFileTxt._Write(output)
}