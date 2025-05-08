import XLSX from "xlsx";


export class CsvReader {

  /**
   * Lê o arquivo `register_assets.xlsx` e extrai os dados crus da planilha.
   * 
   * @returns {Array<Object>} Array de objetos com as colunas definidas no cabeçalho.
   */

  _ReadCsv(){
    const file = XLSX.readFile("./src/files/register_assets.xlsx")
    const SheetName = file.SheetNames[0]
    const sheet = file.Sheets[SheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { range: 11, header: ["Setor", "Equipamento", "Modelo", "Patrimonio", "F", "Serie"] })

    return data
  }

  /**
   * Lê o arquivo `register_assets.xlsx` e extrai os dados formatados.
   * Ignora as 11 primeiras linhas e retorna objetos com `sector`, `equipment` e `serie`.
   *
   * @returns {Array<{ sector: string, equipment: string, serie: string }>}
   */

  csvData(){
    const data = this._ReadCsv()
    const dataFormat = data.map((value) => {
      if(value.Equipamento){
      return { 
              sector: value.Setor?.trim() || "", 
              equipment: value.Equipamento?.trim() || "", 
              serie: value.Serie?.trim() || ""
            }
      }
      return {
        sector: " ", 
        equipment: " ", 
        serie: " "
      }
  }).filter(value => value.sector !== " " || value.equipment !== " " || value.serie !== " ")

    return dataFormat 
  }
}
