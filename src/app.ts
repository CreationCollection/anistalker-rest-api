import express, { Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"

import animeRoute from "./api/v1/routes/anime.route.js"
// import mangaRoute from "./api/v1/routes/manga.route.js"
// import hentaiRoute from "./api/v1/routes/hentai.route.js"



const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Congratulations! You have reached the home page!")
})

app.use('/anime', animeRoute.route)

// app.use('/manga', mangaRoute)

// app.use('/hentai', hentaiRoute)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

app.on('close', () => {
    console.log("Ended!")
})

