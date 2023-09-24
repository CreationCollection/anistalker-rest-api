import { Router } from "express";

import controller from '../controllers/hentai/hentaiServer.controller.js'

const hentaiRoute = Router()

hentaiRoute.get('/search/:query', controller.search)

hentaiRoute.get('/trending/:time', controller.getTrending)

hentaiRoute.get('/random', controller.getRandom)

hentaiRoute.get('/category', controller.getTags)

hentaiRoute.get('/category/:category', controller.getVideoByCategory)

hentaiRoute.get('/video/:slug', controller.getVideo)

export default hentaiRoute