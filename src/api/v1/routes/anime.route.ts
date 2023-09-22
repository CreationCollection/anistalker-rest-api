import express, { Request, Response } from "express";
import controller from "../controllers/anime/index.js"

const route = express.Router()

// /search/:query?sort&season&type&status&score
// /filter?sort&season&type&status&score
// /:animeId
// /:animeId/episodes
// /episode/:episodeId/video?server&download&token
// /episode/:episodeId/servers

route.get(['/'], (req: Request, res: Response) => {
    res.statusCode = 200
    res.statusMessage = "Nothing here, call either '/search', '/filter', or pass the anime id after this"
    res.send("Nothing here, call either '/search', '/filter', or pass the anime id after this")
})
route.get('/episode/:id', (req: Request, res: Response) => {
    res.statusCode = 200
    res.statusMessage = "Nothing here, call either video or server after this."
    res.send("great going, now call either '/video' or '/server' for get some detail about this episode")
})

route.get('/search/:query', controller.search)

route.get('/filter', controller.filter)

route.get('/category/:category', controller.searchByCatagory)

route.get('/genre/:genre', controller.searchByGenre)

route.get('/spotlight', controller.getSpotlightAnime)

route.get('/:animeId', controller.animeInfo)

route.get('/:animeId/episodes', controller.animeEpisodes)

route.get('/episode/:epId/servers', controller.animeEpisodeServers)

route.get('/episode/:epId/video', controller.animeEpisodeVideo)

route.use((req: Request, res: Response) => {
    res.statusCode = 404
    res.statusMessage = "you are lost"
    res.send("😨Oh no you are lost, quick, back to for what you have come for!")
})

export default { route }