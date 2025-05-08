import { Router } from "express";
import { RegisterAssetsController } from "../controller/register-assets-controller.js";

export const assetsRouter = Router()
const registerAssetsController = new RegisterAssetsController()

assetsRouter.post("/upload", registerAssetsController.postFile)

assetsRouter.post("/", registerAssetsController.postAssets)
assetsRouter.get("/assets", registerAssetsController.indexAssets)
assetsRouter.get("/download", registerAssetsController.downloadAssets)