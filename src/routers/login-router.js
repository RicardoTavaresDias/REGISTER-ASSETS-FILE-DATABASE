import { Router } from "express"
import { LoginController } from "../controller/login-controller.js"

export const loginRouter = Router()
const loginController = new LoginController()

loginRouter.post("/", loginController.create)
loginRouter.post("/glpi", loginController.createGlpi)