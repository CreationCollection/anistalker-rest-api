import express, { Request, Response } from "express"
import animeRoute from "./api/v1/routes/anime.route.js"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req: Request, res: Response) => {
    res.send("Congratulations! You have reached the home page!")
})

app.use('/anime', animeRoute.route)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})