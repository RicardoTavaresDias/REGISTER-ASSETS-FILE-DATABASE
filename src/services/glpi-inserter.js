import { Validatorglpi } from "./Validator-glpi.js"
import { listEquipment } from "../lib/listEquipment.js"

/**
 * Classe responsável por inserir e atualizar ativos no sistema GLPI via automação com Puppeteer.
 */

export class GlpiInserter {

  /**
   * @param {string} user - Identificação do usuário para login no GLPI.
   */

  constructor(user) {
    this.user = user
    this.page = null
  }

  /**
     * Inicializa o navegador e faz login no GLPI utilizando a classe Validatorglpi.
     * Armazena a página resultante em `this.page`.
     */

  async _initBrowser(){
    const validatorglpi = new Validatorglpi()
    const page = await validatorglpi.initBrowser()
    this.page = page
    validatorglpi._user(this.user)
    await validatorglpi.loginGlpi(this.page)
  }

  /**
   * Acessa e seleciona a estrutura de unidades no GLPI.
   * @param {string} value - Nome ou identificador da unidade a ser selecionada na árvore do GLPI.
   * @returns {Promise<{ message: string }|undefined>} - Mensagem de erro ou undefined se sucesso.
   * @throws {Error} - Em caso de falhas no carregamento da árvore de unidades.
   */

  async treeStructureGlpi(value){
    this.units = value

    try {
      await this.page.waitForSelector("#global_entity_select", { timeout: 10000 })
      await this.page.click("#global_entity_select")

      await this.page.waitForSelector(".jstree-closed", { timeout: 10000 })
      await this.page.click(".jstree-icon")

      await this.page.waitForSelector(".jstree-children", { timeout: 10000 })
      
      const result = await this.page.evaluate((units) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => { 
            const elements = [...document.querySelectorAll(".jstree-children .jstree-anchor")]
            if(elements.length === 0){
              resolve("Não foi carregado as unidades no glpi, tente novamente.")
              return
            }

            const unit = elements.filter(value => value.innerText.includes(units))[0]
            if(!unit){
              resolve("Nenhuma unidade encontrado.")
              return
            }

            unit.click()
            resolve(false);
          }, 1000)
        })
      }, this.units)

      // retorna somente, se tiver retorno resolve com string
      if(result){
        this.page.browser().close()
        return { message: result }
      }

      await this.page.waitForSelector("#ui-tabs-1", { timeout: 10000 })
      .catch(() => { 
        this.page.screenshot({ path: './src/logs/files_puppeteer/after_tree_structure_glpi.png' })
        throw new Error("Não foi carregado as unidades no glpi, tente novamente.") 
      })
      
    }catch(error){
      this.browser.close()
      throw new Error(error.message)
    }
  }

  /**
   * Atualiza o setor dos ativos já cadastrados no GLPI com base em dados fornecidos.
   * @param {object[]} dataUpdate - Dados contendo equipamentos e informações de setores.
   *   - objeto com {sector, idSector, equipment e serie} para ser atualizado cadastro.
   *   - [ {computer}, {monitor}, {printer}, {others} ]
   *
   * @throws {Error} - Em caso de falha na navegação ou carregamento da página de criação.
   */

  async updateSectorGlpi(dataUpdate){
    try {
      const dataEquipment = listEquipment(dataUpdate)

      for(const key in dataEquipment){
        const items = dataEquipment[key]
        for(const item of items.data){
          
          await this.page.goto(items.path + item.serie + items.base, { timeout: 35000 })

          await this.page.waitForSelector(".tab_bg_2 td a", { timeout: 10000 })
          .catch(() => { 
            throw new Error("Número de serie não encontrado no glpi, verifica o número de serie corretamente para atualização.") 
          })

          await this.page.evaluate(() => {
            document.querySelectorAll('.tab_bg_2 td a')[0].click()
          })

          await this.page.waitForSelector(`[name="name"]`, { timeout: 10000 })
          .catch(() => { 
            throw new Error("Pagina de ativos no glpi não foi carregado corretamente, tente novamente.") 
          })

          await this.page.evaluate((item) => {
            document.querySelectorAll(`.select2-hidden-accessible`)[3]
              .innerHTML = `<option value=${item.id} title="${item.sector} - ">${item.sector}</option>`

            //document.querySelector(".submit").click()
          }, { sector: item.sector, id: item.idSector })

          await this.page.waitForSelector(`[name="name"]`, { timeout: 10000 })

          // TESTE
          //this.page.screenshot({ path: `./src/logs/files_puppeteer/${key}_${item.serie}.png` })
        }
      }

      //await this.page.waitForNavigation({timeout: 3000})
      
    }catch(error){
      this.page.browser().close()
      throw new Error(error.message)
    }finally{
      this.page.browser().close()
    }
  }

  /**
   * Cadastra novos ativos no GLPI com base nos dados fornecidos.
   * @param {object[]} dataCreate - Dados dos equipamentos a serem criados.
   *   - objeto com {sector, idSector, equipment e serie} para ser criado cadastro.
   *   - [ {computer}, {monitor}, {printer}, {others} ]
   *
   * @throws {Error} - Em caso de falha na navegação ou carregamento da página de criação.
   */

  async registerAssets(dataCreate){
    try {
      const dataEquipment = listEquipment(dataCreate)
      
      for(const key in dataEquipment){
        const items = dataEquipment[key]
        for(const item of items.data){
          await this.page.goto("https://glpi.ints.org.br/front/monitor.form.php?id=1506&withtemplate=2", { timeout: 35000 })

          await this.page.waitForSelector(`[name="name"]`, { timeout: 10000 })
          .catch(() => { 
            throw new Error("Pagina de ativos no glpi não foi carregado corretamente, tente novamente.") 
          })

          await this.page.evaluate((data) => {
            document.querySelector("[name='name']").value = data.serie
            document.querySelectorAll(`.select2-hidden-accessible`)[3]
              .innerHTML = `<option value=${"707"} title="${data.sector} - ">${data.sector + " " + data.idSector}</option>`
            document.querySelector("[name='serial']").value = data.serie

            //document.querySelector(".submit").click()
          }, item )

          await this.page.waitForSelector(`[name="name"]`, { timeout: 10000 })
          .catch(() => { 
            throw new Error("Error no glpi, para cadastrar próximo ativo.") 
          })


          // TESTE
          //this.page.screenshot({ path: `./src/logs/files_puppeteer/${key}_${item.serie}.png` })

        }
      }

      //await this.page.waitForNavigation({timeout: 3000})
      
    }catch(error){
      this.page.browser().close()
      throw new Error(error.message)
    }finally{
      this.page.browser().close()
    }
  }
}