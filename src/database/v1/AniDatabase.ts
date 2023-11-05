import { initializeApp, cert, deleteApp } from 'firebase-admin/app';

import path from 'path';
import { Database, getDatabase } from 'firebase-admin/database';
import { AniAuth } from './AniAuth.js';


export class AniDatabase {
    private static app = initializeApp({
        credential: cert(path.resolve("src/database/v1/serviceAccountKey.json")),
        databaseURL: "https://redline-anistalker-default-rtdb.asia-southeast1.firebasedatabase.app/"
    })
    static database: Database = getDatabase(this.app)

    static disposeDatabase() {
        deleteApp(this.app)
    }

    static async setLastEpisode(token: string, animeId: number, episode: number): Promise<any> {
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const historyRef = this.database.ref(`users/${userId}/history/${animeId}`)
            await historyRef.set(episode)
        }
    }

    static async createSyncReport(token: string, id: number, data: any): Promise<any> {
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const syncRef = this.database.ref(`users/${userId}/syncReport/${id}`)
            await syncRef.set(data)
        }
        else return null
    }

    static async sync(token: string, id: number): Promise<any> {
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const syncReport = this.database.ref(`users/${userId}/syncReport/${id}`)
            const data = await syncReport.get()
            await syncReport.remove()
            return data
        }
        else return null
    }

    static async getAllSyncReports(token: string): Promise<any> {
        const userId = await AniAuth.getUserId(token)
        if (userId) {
            const syncRef = this.database.ref(`users/${userId}/syncReport`)
            return await syncRef.get()
        }
        return null
    }
}