import { CrudFile } from "../services/CrudFile.js"
import { env } from "../config/env.js"
import { compare, hash } from "bcrypt"
import { z } from "zod"
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/token.js"
import CryptoJS from "crypto-js";

/**
 * Controlador responsável pela autenticação de usuários locais
 * e pela emissão de tokens de acesso ao GLPI.
 */

export class LoginController {

  /**
   * Realiza a autenticação de um usuário interno do sistema com base em um arquivo JSON.
   * 
   * @param {import('express').Request} request - Requisição HTTP contendo `user` e `password` no corpo.
   * @param {import('express').Response} response - Resposta com status de sucesso ou falha na autenticação.
   * 
   * @returns {Promise<void>}
   */

  async create(request, response){
    const data = await new CrudFile({ path: env.LOGIN })._Read()
    const dataJson = JSON.parse(data)

    const { user, password, role } = dataJson

    const roleHash = await hash(role, 8)
    const comparePassword = await compare(request.body.password, password)

    if(!user.includes(request.body.user)){
      return response.status(401).json({ message: "Usuario não cadastrado no sistema." })
    }
   
    if(user.includes(request.body.user) && comparePassword){
      const token = jwt.sign({ sub: roleHash }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })

      request.headers = {
        role: roleHash
      }
      return response.status(200).json({ token })
    }
    return response.status(401).json({ message: "Usuario e senha incorretos." })        
  }

  /**
   * Gera um token JWT para autenticação em serviços externos, como o GLPI.
   * 
   * @param {import('express').Request} request - Requisição contendo `user` e `password` no corpo.
   * @param {import('express').Response} response - Resposta com token JWT gerado.
   * 
   * @returns {Promise<void>}
   * 
   * @throws {z.ZodError} - Se `user` ou `password` estiverem ausentes.
   */

  async createGlpi(request, response){
    const userSchema = z.object({
      user: z.string().min(1, { message: "Informe usuario e senha do GLPI." }),
      password: z.string().min(1, { message: "Informe usuario e senha do GLPI." })
    })

    const user = userSchema.parse(request.body)
   
    const tokenGlpi = jwt.sign({ sub: { 
      user: CryptoJS.AES.encrypt(user.user, jwtConfig.secret).toString(),
      password: CryptoJS.AES.encrypt(user.password, jwtConfig.secret).toString()
    } }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn })

    response.status(200).json({ tokenGlpi })
  }
}