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

    static async createSyncReport(id: number, data: any): Promise<any> {
        const syncRef = this.database.ref(`syncReport/${id}`)
        await syncRef.set(data)
    }

    static async sync(id: number): Promise<any> {
        const syncReport = this.database.ref(`syncReport/${id}`)
        return await syncReport.get()
    }
}