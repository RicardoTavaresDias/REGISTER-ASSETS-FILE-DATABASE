import { Router } from "express";
import { SuggestionsSearch } from "../controller/suggestions-search-controller.js"
import { userAcess } from "../middlewares/userAcess.js"
import { authentication } from "../middlewares/authentication.js"

const suggestionsSearch = new SuggestionsSearch()
export const suggestionsRouter = Router()

suggestionsRouter.get('/:type', suggestionsSearch.index)

suggestionsRouter.use(authentication)
suggestionsRouter.post('/:type', userAcess(["admin"]), suggestionsSearch.create)
suggestionsRouter.delete('/:type', userAcess(["admin"]), suggestionsSearch.remove)