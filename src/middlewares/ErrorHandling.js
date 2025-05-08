import { ZodError } from "zod";
import { LogRegisterAssets } from "../services/log-RegisterAssets.js";

export function ErrorHandling(error, request, response, next) {
  if(error instanceof ZodError){
    LogRegisterAssets({ error: error.issues[0].message })
    return response.status(400).json({ message: error.issues[0].message }) 
  }

  if(error instanceof Error){
    LogRegisterAssets({ error: error.message })
    return response.status(400).json({ message: error.message })
  }

  LogRegisterAssets({ error: error.message })
  response.status(500).json({ message: 'Error interno servidor!', error: error.message})
}