import axios from "axios";

import { MasterZoro } from '../MasterZoro.js'
import { query } from "express";
import { AnilistInformer } from "./AnilistInformer.js";
import { GogoInformer } from "./GogoInformer.js";

export class ZoroMap {
    public zoroId: number = 0
    public anilistId: number = 0
    public gogoSub: string | null = ''
    public gogoDub: string | null = ''
}

export class ZoroMapper {
    private static readonly mappingUrl = 'Link will be here'
    private static readonly apiKey = 1309192009

    static async mapZoro(zoroId: number): Promise<ZoroMap> {
        const map: ZoroMap = new ZoroMap()
        map.zoroId = zoroId

        await this.findMapping(zoroId, map)
        return map
        const res = await axios.get(`${this.mappingUrl}/zoro/${zoroId}`, {
            headers: { 'Authorization': this.apiKey }
        })
        const data = res.data
        if (true && data.status == 1) {
            this.findMapping(zoroId, map)
        }
        else {
            map.anilistId = data.anilist
            map.gogoSub = data.gogoSub
            map.gogoDub = data.gogoDub
        }

        return map
    }

    private static async findMapping(zoroId: number, map: ZoroMap) {
        console.log(zoroId)
        const anime = await MasterZoro.getAnimeInfo(zoroId)
        map.anilistId = anime.id.aniId

        const anilistInfo = await AnilistInformer.getAnilistInfo(map.anilistId)
        const gogoId = await GogoInformer.mapAnilistToGogo(anilistInfo)

        map.gogoSub = gogoId?.sub ?? null
        map.gogoDub = gogoId?.dub ?? null
    }
}