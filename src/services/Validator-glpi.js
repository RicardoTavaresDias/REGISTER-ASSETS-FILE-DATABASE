import puppeteer from 'puppeteer'
import { env } from "../config/env.js"
import { listEquipment } from "../lib/listEquipment.js"
import { normalizeText } from '../lib/normalizeText.js'
import CryptoJS from "crypto-js";
import { jwtConfig } from "../config/token.js"

/**
 * Classe responsável por validar ativos no GLPI via web scraping.
 */

export class Validatorglpi{

  /**
   * @param {Object[]} data - Lista de dados dos equipamentos a validar.
   */

  constructor(data){
    this.data = data
    this.existsAssets = []
    this.doesNotExistsAssets = []
    this.updateAssets = []
  }

  /**
   * Define o usuário que será utilizado para login no GLPI.
   * @param {{user: string, password: string}} user - Credenciais do usuário.
   */

  _user(user){
    this.user = user
  }

   /**
   * Inicializa o navegador Puppeteer.
   * @returns {Promise<puppeteer.Page>} Página do navegador.
   */

  async initBrowser(){
    this.browser = await puppeteer.launch({ headless: false })
    const page = await this.browser.newPage()

    return page
  }

  /**
   * Realiza o login no GLPI utilizando Puppeteer e credenciais criptografadas.
   * 
   * As credenciais (`this.user.user` e `this.user.password`) devem estar criptografadas com AES.
   * Elas são descriptografadas em tempo de execução com `CryptoJS` antes de serem utilizadas no formulário de login.
   * 
   * @param {import('puppeteer').Page} page - Página Puppeteer já inicializada.
   * 
   * @throws {Error} Lança erro caso as credenciais estejam incorretas ou a entidade GLPI não carregue.
   * 
   */

  async loginGlpi(page){
    await page.goto(env.GLPIINITIAL, { timeout: 35000 })
    await page.type("#login_name", CryptoJS.AES.decrypt(this.user.user, jwtConfig.secret).toString(CryptoJS.enc.Utf8))
    await page.type("#login_password", CryptoJS.AES.decrypt(this.user.password, jwtConfig.secret).toString(CryptoJS.enc.Utf8))
    await page.type("#dropdown_auth1", "DC-SACA")
    await page.click(`[type="submit"]`)

    await page.waitForSelector(".tab_cadrehov", { timeout: 10000 })
    .catch(async () => {
        const loginError = await page.evaluate(() => {
        return document.querySelector('[class="center b"]')?.textContent
      })
  
      if(loginError){
        page.browser().close()
        throw new Error(loginError + " no GLPI.")
      }

      page.browser().close()
      throw new Error("Elemento de entidade não carregou após login no Glpi.") 
    })
  }

  
  /**
   * Acessa a página de um ativo e retorna seus dados do GLPI.
   * @param {puppeteer.Page} page - Página atual.
   * @param {string} url - URL da página do ativo no GLPI.
   * @returns {Promise<string[]>} Dados coletados [serie, setor].
   */

  async assetsGlpiRegisterWeb(page, url){
    await page.goto(url, { timeout: 35000 })
    const dataGlpi = await page.evaluate(() => {

      // Procura a posição da tabela para extrair dados corretos, tabela muda de index.
      const tableBaseHtml = [...document.querySelectorAll('.tab_cadrehov tr th')]
      
      const searchSeriesTable = tableBaseHtml.filter((value) => value.textContent.includes("Número de série"))[0]
      const searchLocationTable = tableBaseHtml.filter((value) => value.textContent.includes("Localização"))[0]
        
      const indexNumberSeriePosition = tableBaseHtml.indexOf(searchSeriesTable)
      const indexNumberLocationPosition = tableBaseHtml.indexOf(searchLocationTable)

      const existsGlpi = [
        document.querySelectorAll('.tab_bg_2 td')[indexNumberSeriePosition]?.textContent.replace("\t", ""), 
        document.querySelectorAll('.tab_bg_2 td')[indexNumberLocationPosition]?.textContent
      ]
      
      return existsGlpi
    })

    return dataGlpi
  }

   /**
 * Valida se um ativo existe no GLPI comparando número de série e setor.
 * Classifica o ativo em uma das três categorias:
 *
 * 1. `existsAssets`: Quando o número de série e o setor coincidem.
 * 2. `updateAssets`: Quando o número de série confere, mas o setor está diferente.
 * 3. `doesNotExistsAssets`: Quando o número de série não é encontrado no GLPI.
 *
 * Os ativos são armazenados nos arrays correspondentes dentro da instância atual.
 *
 * @param {string[]} dataGlpi - Dados retornados da página do GLPI:
 *   - `dataGlpi[0]`: Número de série do ativo encontrado.
 *   - `dataGlpi[1]`: Setor atual do ativo no GLPI.
 *
 * @param {{ sector: string, equipment: string, serie: string }} item - 
 *   Ativo a ser validado, com os dados esperados.
 *
 * @returns {void}
 */

  async glpiAssetValidation(dataGlpi, item){
    if(dataGlpi[0] === item.serie){
      if(normalizeText(String(item.sector)) === normalizeText(String(dataGlpi[1]))){
        this.existsAssets.push(
          { 
            sector: item.sector,
            equipment: item.equipment, 
            serie: item.serie 
          }) 
      }else {
        this.updateAssets.push(
          {
            sector: dataGlpi[1] ? item.sector + " => " + dataGlpi[1] : 
            (item.sector !== "" && dataGlpi[1] === "") ?
              "n/a => " + item.sector : item.sector, 
            equipment: item.equipment, 
            serie: item.serie 
          }
        )
      }
    }else {
      this.doesNotExistsAssets.push(
        { sector: item.sector, equipment: item.equipment, serie: item.serie }
      )
    }
  }

  /**
   * Executa todo o processo de validação dos ativos no GLPI.
   * @returns {Promise<{existsAssets: Object[], doesNotExistsAssets: Object[]}>} Resultado da validação.
   */
 
  async glpiAssets(){    
    const dataEquipment = listEquipment(this.data)

    try {
      const page = await this.initBrowser()
      await this.loginGlpi(page)

      for(const key in dataEquipment){
        const items = dataEquipment[key]
        
        for(const item of items.data){
          const url = items.path + item.serie + items.base
          const dataGlpi = await this.assetsGlpiRegisterWeb(page, url)
          this.glpiAssetValidation(dataGlpi, item)
        }
      }

      page.browser().close()

      return {
        existsAssets: this.existsAssets,
        doesNotExistsAssets: this.doesNotExistsAssets,
        updateAssets: this.updateAssets
      }

    }catch(error){
      this.browser.close()
      throw new Error(error.message)
    }
  }
}



