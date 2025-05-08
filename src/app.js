import express from 'express'
import "express-async-errors"
import cors from 'cors'
import { routers } from './routers/index.js'
import { ErrorHandling } from "./middlewares/ErrorHandling.js"

export const app = express()

app.use(cors())
app.use(express.json())
app.use(routers)

app.use(ErrorHandling)





