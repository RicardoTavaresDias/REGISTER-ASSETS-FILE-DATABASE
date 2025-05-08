import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/token.js"

export function authentication(request, response, next){

  const authent = request.headers['authorization'];
  
  if (!authent) {
    return response.status(401).json({ message: "Realizar autenticação" });
  }

  // Extraindo string adm do authent
  /*
    const base64Credentials = authent.split(" ")[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const stringCredentials = credentials.split(":")[0]

    if(!stringCredentials){
      return response.status(401).json({ message: "Realizar Autenticação" })
    }
  */

  const token = authent.split(" ")[1]
  
  try {
    const role = jwt.verify(token, jwtConfig.secret)

    request.headers = {
      role: role.sub
    }
    
    return next()
  }catch(error){
    if(error.name === "TokenExpiredError"){
      return response.status(401).json({ message: "Token expirado, realizar login." })
    }
    
    return response.status(401).json({ message: "Token inválido." })
  }
}

export function authenticationGlpi(request, response, next){

  const authent = request.headers['authorization']
  
  if(!authent){
    return response.status(401).json({ message: "Realizar autenticação" });
  }

  const token = authent.split(" ")[1]

  try {
    const user = jwt.verify(token, jwtConfig.secret)
  
    request.headers = user.sub
    
    return next()
  }catch(error){
    if(error.name === "TokenExpiredError"){
      return response.status(401).json({ message: "Token expirado, realizar login." })
    }
    
    return response.status(401).json({ message: "Token inválido." })
  }
}