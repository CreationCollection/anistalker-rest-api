import { AniDatabase, AniAuth, WatchlistDatabase } from "../../../../database/v1/index.js";

import { safeExecute } from '../../../utils/safeUtils.js'

// /user/signIn
export async function userSignIn(req: any, res: any) {
    safeExecute(async () => {
        const token = req.body ? req.body.idToken : null
        const user = await AniAuth.signIn(token)
        if (user) {
            res.json({ status: 200, data: user })
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /user/signOut?token=token
export async function userSignOut(req: any, res: any) {
    safeExecute(async () => {
        const token = req.body ? req.body.token : null
        if (token) {
            const user = await AniAuth.signOut(token)
            res.json({ status: 200, data: user })
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /users/syncReports
export async function getAllSyncReports(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const value = await AniDatabase.getAllSyncReports(token)
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /users/sync
export async function userConfirmSync(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const id = req.body.data.syncId
            const value = await AniDatabase.sync(token, id)
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/create
export async function createWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const syncId = req.body.syncId as number
            const title = req.body.data.title as string
            const privacy = req.body.data.privacy as 'public' | 'private' | 'shared'
            const value = await WatchlistDatabase.createWatchlist(token, title, privacy)
            if (value) {
                await AniDatabase.createSyncReport(token, syncId, value)
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/add
export async function addAnimeToWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const syncId = req.body.syncId as number
            const watchId = req.body.data.watchId as number
            const animeId = req.body.data.animeId as number
            const value = await WatchlistDatabase.addAnimeToWatchlist(token, watchId, animeId)
            if (value) {
                await AniDatabase.createSyncReport(token, syncId, value)
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/remove
export async function removeAnimeFromWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const syncId = req.body.syncId as number
            const watchId = req.body.data.watchId as number
            const animeId = req.body.data.animeId as number
            const value = await WatchlistDatabase.removeAnimeFromWatchlist(token, watchId, animeId)
            if (value) {
                await AniDatabase.createSyncReport(token, syncId, value)
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}


// /watchlist/bundle
export async function getWatchlistBundle(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const value = await WatchlistDatabase.getAllWatchList(token, 'active')
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/archive
export async function getWatchlistArchive(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const value = await WatchlistDatabase.getAllWatchList(token, 'archive')
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/delete
export async function deleteWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const watchId = req.body.data.watchId as number
            const value = await WatchlistDatabase.removeWatchlist(token, watchId)
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/recover
export async function recoverWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const watchId = req.body.data.watchId as number
            const value = await WatchlistDatabase.recoverWatchlist(token, watchId)
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/update
export async function updateWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const token = (req.body) ? req.body.token : null
        if (token) {
            const watchId = req.body.data.watchId as number
            const title = req.body.data.title as string
            const privacy = req.body.data.privacy as 'public' | 'private' | 'shared'
            const value = await WatchlistDatabase.updateWatchlist(token, watchId, title, privacy)
            if (value) {
                res.json({ status: 200, data: value })
            }
            else {
                res.json({ status: 400, error: ["Invalid token"] })
            }
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// /watchlist/share/:watchId
export async function shareWatchlist(req: any, res: any) {
    safeExecute(async () => {
        const watchId = req.params.watchId as number
        const value = await WatchlistDatabase.generateWatchlistLink(watchId)
        if (value) {
            res.json({ status: 200, data: value })
        }
        else {
            res.json({ status: 400, error: ["Invalid token"] })
        }
    }, res)
}

// watchlist Url handling here in future