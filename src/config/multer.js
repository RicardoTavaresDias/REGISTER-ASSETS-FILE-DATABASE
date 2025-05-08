import multer from "multer"
import fs from "node:fs"

/**
 * Middleware de upload de arquivos usando Multer.
 *
 * - Salva os arquivos na pasta `tmp/`, criando-a se necessário.
 * - Define o nome do arquivo como `assets.<extensão original>`.
 * - Aceita apenas arquivos `.jpg`, `.jpeg` e `.png`.
 * - Limita o tamanho do arquivo para 100MB.
 *
 * @constant
 * @type {import('multer').Multer}
 */

export const upload = multer({

  storage: multer.diskStorage({
    destination: (request, file, callback) => {
      try {
        if(!fs.existsSync('tmp')){
          fs.mkdirSync('tmp')
        }
        callback(null, 'tmp')
      } catch(error){
        callback(new Error("File server not found"), null)
      }
    },

    filename: (request, file, callback) => {
      callback(null, `assets.${file.originalname.split('.')[1]}`)
    }
  }),

  fileFilter: (request, file, callback) => {
    const filter = [ "image/png", "image/jpg", "image/jpeg" ]
    if(filter.includes(file.mimetype)){
      callback(null, true)
    }else {
      request.errorMessage = "Invalid file type only jpg, jpeg and png"
      callback(null, false)
    }
  }, 
  
  limits: { fileSize: 100 * 1024 * 1024 }

})