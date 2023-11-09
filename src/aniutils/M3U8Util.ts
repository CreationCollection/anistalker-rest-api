import { Parser } from 'm3u8-parser'
import axios from 'axios'

import { AnimeSubtitle, ZoroStreamData } from '../services/models/AnimeModels.js'
import { Video, VideoFile } from '../services/models/VideoModels.js'

export async function formatVideo(master: string, seperated: boolean = false): Promise<Video> {
    let hd = new VideoFile()
    let uhd = new VideoFile()

    let parser = new Parser()
    let val: any;

    let { data } = await axios.get(master)

    parser.push(data)
    parser.end()
    val = parser.manifest

    let promises: (() => Promise<any>)[] = []

    for (let item of val.playlists) {
        let res = item.attributes.RESOLUTION
        let uri: string = item.uri
        let url: string = uri.startsWith('https://') ? uri : master.substring(0, master.lastIndexOf('/') + 1) + uri

        let file: VideoFile

        if (res.height > 1000) file = uhd
        else if (res.height > 700) file = hd
        else continue

        file.url = url

        if (!seperated) {
            continue
        }

        promises.push(async () => {
            let segs = (await axios(url)).data
            parser = new Parser()
            parser.push(segs)
            parser.end()
            val = parser.manifest.segments

            let start: number = 0
            for (let seg of val) {
                let segUrl = uri.startsWith('https://') ? seg.uri : master.substring(0, master.lastIndexOf('/') + 1) + seg.uri
                file.files.push({ length: seg.duration, at: start, file: segUrl })
                start += seg.duration
            }
        })
    }

    await Promise.all(promises.map(p => p()))

    return { master, hd: seperated ? hd : hd.url, uhd: seperated ? uhd : uhd.url }
}