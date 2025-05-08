import Tesseract from "tesseract.js";
import XLSX from "xlsx";
import ExcelJS from "exceljs";
import multer from "multer";
import path from "node:path";
import { env } from "../config/env.js"
import { z } from "zod"
import { CrudFile } from "../services/CrudFile.js";

import { upload } from "../config/multer.js";
import { LogRegisterAssets } from "../services/log-RegisterAssets.js";

/**
 * Controller responsável pelo gerenciamento de ativos via upload de arquivos de imagem ou Excel.
 * Realiza leitura OCR com Tesseract, manipulação de planilha com ExcelJS e leitura com XLSX.
 */

export class RegisterAssetsController {

  /**
   * Realiza o upload de um arquivo de imagem e extrai o número de série (SN) usando OCR (Tesseract.js).
   *
   * @param {import('express').Request} request - Requisição HTTP com o arquivo em `multipart/form-data`.
   * @param {import('express').Response} response - Resposta com o SN reconhecido ou erro.
   *
   * @returns {void}
   */

  postFile(request, response) {
    try {
      upload.single("file")(request, response, async (error) => {
        if (error instanceof multer.MulterError) {
          LogRegisterAssets({ error: error.message })
          return response.status(422).json({ message: error.message });      
        } else if (error) {
          LogRegisterAssets({ error: error.message })
          return response.status(500).json({ message: error.message });
        }

        if (request.errorMessage) {
          LogRegisterAssets({ error: request.errorMessage })
          return response.status(422).json({ message: request.errorMessage }); 
        }

        const result = await Tesseract.recognize(
          `./tmp/${request.file.filename}`,
          "por"
        );

        return response.status(200).json({
          // message: "Upload completed successfully!",
          message: "Leitura realizado da imagem!",
          file: request.file,
          SN:
            // Extrai no texto somente palavra que começa BR
            result.data.text.match(/\bBR\w*/i) &&
            result.data.text.match(/\bBR\w*/i)[0],
        });
      });
    } catch (error) {
      console.log(error);
      LogRegisterAssets({ error: error })
    }
  }

  /**
   * Insere os dados de ativos (equipamento, número de série, setor) em uma planilha Excel.
   *
   * @param {import('express').Request} request - Requisição contendo os dados no corpo da requisição.
   * @param {import('express').Response} response - Resposta confirmando o registro na planilha ou erro.
   *
   * @returns {Promise<void>}
   */

  async postAssets(request, response) {
    try {
      const mapUnits = await new CrudFile({ path: env.UNITS })._Read()

      const bodySchema = z.object({
        serie: z.string().optional(),
        equipment: z.string().optional(),
        sector: z.string().optional(),
        units: z.string().refine(value => mapUnits.includes(value), {
          message: "Unidade inválida"
        })
      })

      const { serie, equipment, sector, units } = bodySchema.parse(request.body)

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(env.XLSX);
      const sheet = workbook.getWorksheet(units.replace("/", " "));

      const xlsxFile = XLSX.readFile(env.XLSX);
      const xlsxSheetName = xlsxFile.SheetNames = units.replace("/", " ");
      const xlsxSheet = xlsxFile.Sheets[xlsxSheetName];
      const data = XLSX.utils.sheet_to_json(xlsxSheet, { header: 2 });
      
      let rowIndex = data.length + 3;

      for (const item of [request.body]) {
        const row = sheet.getRow(rowIndex); 

        row.getCell(1).value = sector,
        row.getCell(2).value = equipment,
        row.getCell(6).value = serie,

        row.commit()
        rowIndex++;
      }
      
      await workbook.xlsx.writeFile(env.XLSX);
      LogRegisterAssets({ message: request.body })
      response
        .status(200)
        .json({
          message: `SN: e Setor cadastrado com sucesso, na planilha Excel!`,
        });
    } catch (error) {
      console.log(error)
      LogRegisterAssets({ error: error })
      response
        .status(422)
        .json({
          message: "Error ao inserir SN: e Setor na planilha Excel!",
          error: error.message,
        });
    }
  }

   /**
   * Retorna os dados de ativos armazenados na planilha Excel.
   *
   * @param {import('express').Request} request - Requisição HTTP.
   * @param {import('express').Response} response - Resposta com os dados lidos da planilha.
   *
   * @returns {void}
   */

  indexAssets (request, response){
    try {
      const xlsxFile = XLSX.readFile(env.XLSX);
      const sheet = xlsxFile.Sheets["Ativos"];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 2 })
      response.status(200).json(data)
    } catch(error){
      console.log(error)
      LogRegisterAssets({ error: error })
      response.status(422).json({
          message: "Error ao acessar/ler o arquivo .xlsx",
          error: error.message,
      });
    }
  }

    /**
   * Realiza o download da planilha Excel com os registros de ativos.
   *
   * @param {import('express').Request} request - Requisição HTTP.
   * @param {import('express').Response} response - Resposta com o arquivo baixado ou erro.
   *
   * @returns {void}
   */

  downloadAssets(request, response){
    try {
      const pathDonload = path.resolve(env.XLSX)
      response.download(pathDonload, (error) => {
        if(error){
          console.log("Erro no download:", error)
          LogRegisterAssets({ error: error })
          return response.status(404).json({ message: "File not found" })
        }
      })
    } catch(error){
      console.log(error)
      LogRegisterAssets({ error: error })
      response.status(422).json({
          message: "Error ao acessar/ler o arquivo .xlsx",
          error: error.message,
      });
    }
  }
}