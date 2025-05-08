import { Router } from 'express'
import { LogsController } from "../controller/logs-controller.js"
import { userAcess } from "../middlewares/userAcess.js"
import { authentication } from "../middlewares/authentication.js"

export const logsRouter = Router()
const logsController = new LogsController()

logsRouter.use(authentication)
logsRouter.get("/:type", userAcess(["admin"]), logsController.index)
logsRouter.delete("/:type", userAcess(["admin"]), logsController.remove)