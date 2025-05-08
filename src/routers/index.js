import { assetsRouter } from './assets-router.js'
import { suggestionsRouter } from './suggestions-router.js'
import { logsRouter } from './logs-router.js'
import { loginRouter } from './login-router.js'
import { assetsImportGlpiRouter } from './assets-import-glpi-router.js'
import { Router } from 'express'

export const routers = Router()

routers.use("/", assetsRouter)
routers.use("/suggestions", suggestionsRouter)
routers.use("/log", logsRouter)
routers.use("/login", loginRouter)
routers.use("/import-glpi", assetsImportGlpiRouter)