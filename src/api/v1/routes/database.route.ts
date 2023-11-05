import express, { Request, Response } from "express";
import * as controller from "../controllers/database/database.controller.js"

export const databaseRoute = express.Router()

databaseRoute.post('/users/signIn', controller.userSignIn)
databaseRoute.post('/users/signOut', controller.userSignOut)
databaseRoute.post ('/users/syncReports', controller.getAllSyncReports)
databaseRoute.post('/users/sync', controller.userConfirmSync)
databaseRoute.post('/watchlist/create', controller.createWatchlist)
databaseRoute.post('/watchlist/add', controller.addAnimeToWatchlist)
databaseRoute.post('/watchlist/remove', controller.removeAnimeFromWatchlist)
databaseRoute.post('/watchlist/update', controller.updateWatchlist)
databaseRoute.post('/watchlist/delete', controller.deleteWatchlist)
databaseRoute.post('/watchlist/recover', controller.recoverWatchlist)
databaseRoute.post('/watchlist/bundle', controller.getWatchlistBundle)
databaseRoute.post('/watchlist/archive', controller.getWatchlistArchive)
databaseRoute.post('/watchlist/share/:watchId', controller.shareWatchlist)
