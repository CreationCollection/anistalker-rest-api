import { Timestamp } from "firebase-admin/firestore";
import { AniDatabase, AniAuth } from "./index.js";
import { ZoroInformer } from "../../services/providers/anime/informers/ZoroInformer.js";

export class WatchlistDatabase {
    static createWatchlist = async (
        token: string,
        title: string,
        privacy: "public" | 'shared' | 'private'
    ): Promise<any> => {
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const user = await AniAuth.getUsername(userId)
            const watchId = Timestamp.now().toMillis()

            const watchlistRef = AniDatabase.database.ref(`watchlist_collection/${watchId}`)
            const userWatchlistRef = AniDatabase.database.ref(`users/${userId}/watchlist/active`)

            const watchlist = {
                id: watchId,
                title,
                privacy,
                owner: user,
                series: [],
                following: 0,
            }

            userWatchlistRef.child(watchId.toString()).set(true)
            watchlistRef.set(watchlist)

            return watchlist
        }
        return null
    }

    static addWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const promises: Promise<any>[] = [
            new Promise<any>(async (resolve) => {
                userId = await AniAuth.getUserId(token)
                resolve(userId)
            }),
            new Promise<any>(async (resolve) => {
                watchlist = await this.getWatchlist(watchId)
                resolve(watchlist)
            })
        ]
        await Promise.all(promises)

        if (userId && watchlist) {
            const userRef = AniDatabase.database.ref(`users/${userId}/watchlist/active`)
            await userRef.child(watchId.toString()).set(true)

            return watchlist
        }
        return null
    }

    static removeWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniAuth.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && !watchlist.archive) {
            const userRef = AniDatabase.database.ref(`users/${userId}/watchlist`)
            const data = await userRef.child(`active/${watchId}`).get()
            if (data.exists()) {
                await Promise.all([
                    data.ref.remove(),
                    userRef.child(`archive/${watchId}`).set(true),
                    AniDatabase.database.ref(`watchlist_collection/${watchId}/archive`).set(true)
                ])
                return true
            }
        }
        return false
    }

    static recoverWatchlist = async (token: string, watchId: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniAuth.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && watchlist.archive) {
            const userRef = AniDatabase.database.ref(`users/${userId}/watchlist`)
            const data = await userRef.child(`archive/${watchId}`).get()
            if (data.exists()) {
                await Promise.all([
                    data.ref.remove(),
                    userRef.child(`active/${watchId}`).set(true),
                    AniDatabase.database.ref(`watchlist_collection/${watchId}/archive`).set(false)
                ])
                return watchlist
            }
        }
        return null
    }

    static addAnimeToWatchlist = async (token: string, watchId: number, anime: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any | null = null
        let validAnime: boolean = false

        const userIdVerify = AniAuth.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)
        const animeVerify = ZoroInformer.verifyAnimeId(anime)

        const result = await Promise.all([userIdVerify, watchlistVerify, animeVerify])
        userId = result[0]
        watchlist = result[1]
        validAnime = result[2]

        if (validAnime && watchlist && userId && !watchlist.archive) {
            const watchlistRef = AniDatabase.database.ref(`watchlist_collection/${watchId}/series/${anime}`)
            const username = await AniAuth.getUsername(userId)
            if (watchlist.owner == username || watchlist.privacy == 'public') {
                let data = await watchlistRef.get()
                if (!data.exists()) {
                    await watchlistRef.set(username)
                    return true
                }
            }
        }
        return false
    }

    static removeAnimeFromWatchlist = async (token: string, watchId: number, anime: number): Promise<any> => {
        let userId: string | null = null
        let watchlist: any | null = null
        let validAnime: boolean = false

        const userIdVerify = AniAuth.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)
        const animeVerify = ZoroInformer.verifyAnimeId(anime)

        const result = await Promise.all([userIdVerify, watchlistVerify, animeVerify])
        userId = result[0]
        watchlist = result[1]
        validAnime = result[2]

        if (validAnime && watchlist && userId && !watchlist.archive) {
            const watchlistRef = AniDatabase.database.ref(`watchlist_collection/${watchId}/series/${anime}`)
            const data = await watchlistRef.get()

            if (data.exists()) {
                const username = await AniAuth.getUsername(userId)
                if (watchlist.owner == username ||
                    (watchlist.privacy == 'public' && data.val() == username)) {
                    await watchlistRef.remove()
                    return true
                }
            }
        }
        return false
    }

    static updateWatchlist = async (
        token: string,
        watchId: number,
        title: string,
        privacy: 'public' | 'shared' | 'private'
    ): Promise<any> => {
        let userId: string | null = null
        let watchlist: any = null

        const userVerify = AniAuth.getUserId(token)
        const watchlistVerify = this.getWatchlist(watchId)

        const result = await Promise.all([userVerify, watchlistVerify])
        userId = result[0]
        watchlist = result[1]

        if (userId && watchlist && !watchlist.archive) {
            const watchlistRef = AniDatabase.database.ref(`watchlist_collection/${watchId}`)
            await watchlistRef.update({
                title,
                privacy
            })

            return (await watchlistRef.get()).val()
        }
        return null
    }

    static generateWatchlistLink = async (watchId: number): Promise<string | null> => {
        const watchKey = await this.encodeWatchlist(watchId)
        if (watchKey) {
            return "https://demoLink.firebase.app/watch?key=" + watchKey
        }
        return null
    }

    static extractWatchId = async (watchUrl: string): Promise<number | null> => {
        try {
            const watchKey = new URL(watchUrl).searchParams.get('key')
            if (watchKey) {
                return await this.decodeWatchlist(watchKey)
            }
        }
        catch (error: any) {

        }

        return null
    }

    static encodeWatchlist = async (watchId: number): Promise<string | null> => {
        const watchlist = await this.getWatchlist(watchId)
        if (watchlist) {
            const watchLinkRef = AniDatabase.database.ref('watchlist_links')
            const existingKey = await watchLinkRef.orderByValue().equalTo(watchId).get()
            
            if (existingKey.exists()) {
                return Object.keys(existingKey.val())[0]
            }

            const linkRef = watchLinkRef.push()
            linkRef.set(watchlist.id)
            return linkRef.key
        }
        return null
    }

    static decodeWatchlist = async (watchKey: string): Promise<number | null> => {
        const ref = AniDatabase.database.ref(`watchlist_links/${watchKey}`)
        const watchData = await ref.get()
        if (watchData.exists()) {
            return watchData.val()
        }
        return null
    }

    static getWatchlist = async (watchId: number): Promise<any> => {
        const ref = AniDatabase.database.ref(`watchlist_collection/${watchId}`)
        const value = await ref.get()
        return value.val()
    }

    static getAllWatchList = async (token: string, type: 'active' | 'archive'): Promise<any[]> => {
        const list: any[] = []
        const watchIds = await this.getWatchlistIds(token, type)
        
        let count = 0
        let activeTask = 0
        const taskList: Promise<any>[] = []
        while (count < watchIds.length) {
            if (activeTask >= Math.min(watchIds.length, 8)) {
                await Promise.any(taskList)
            }
            const watchId = watchIds[count++]
            activeTask++
            taskList.push(this.getWatchlist(watchId).then(v => {
                list.push(v)
                activeTask--
            }))
        }
        await Promise.all(taskList)

        return list
    }

    static getWatchlistIds = async (token: string, category: 'active' | 'archive'): Promise<number[]> => {
        const list: number[] = []
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const ref = AniDatabase.database.ref(`users/${userId}/watchlist/${category}`)
            const value = await ref.get()
            if (value.exists()) {
                Object.keys(value.val()).forEach(v => {
                    list.push(parseInt(v))
                })
            }
        }

        return list
    }
}