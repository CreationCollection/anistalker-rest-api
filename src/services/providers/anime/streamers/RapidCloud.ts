import axios, { AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { Parser } from 'm3u8-parser'

import { AnimeSubtitle, ZoroStreamData } from '../../../models/AnimeModels.js'
import { Video, VideoFile } from '../../../models/VideoModels.js'

export class RapidCloud {
    protected serverName = 'RapidCloud';

    private readonly fallbackKey = 'c1d17096f2ca11b7';
    private readonly host = 'https://rapid-cloud.co';
    private readonly consumetApi = 'https://api.consumet.org';
    private readonly enimeApi = 'https://api.enime.moe';

    static extract = async (videoUrl: string, seperateFiles: boolean = false): Promise<ZoroStreamData> => {
        try {
            const id = videoUrl.split('/').pop()?.split('?')[0];
            const options = {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            };

            let host = videoUrl.split('//').pop()?.split('/')[0]
            let res = await axios.get(`https://${host}/embed-2/ajax/e-1/getSources?id=${id}`,
                options
            );

            let {
                data: { sources, tracks, intro, outro, encrypted },
            } = res;

            let decryptKey: any;

            // decryptKey = (await axios.get('https://github.com/enimax-anime/key/blob/e6/key.txt', { responseType: 'text' })).data

            // decryptKey = load(decryptKey)("textarea#read-only-cursor-text-area").text()

            if (!decryptKey) {
                decryptKey = (await axios.get('https://raw.githubusercontent.com/theonlymo/keys/e1/key', { responseType: 'json' })).data;
            }

            let file = ''
            try {
                if (!decryptKey) {
                    throw new Error()
                }
                if (encrypted) {
                    const sourcesArray = sources.split('');
                    let extractedKey = '';

                    for (const index of decryptKey) {
                        for (let i = index[0]; i < index[1]; i++) {
                            extractedKey += sources[i];
                            sourcesArray[i] = '';
                        }
                    }

                    decryptKey = extractedKey;
                    sources = sourcesArray.join('');

                    const decrypt = CryptoJS.AES.decrypt(sources, decryptKey);
                    file = JSON.parse(decrypt.toString(CryptoJS.enc.Utf8))[0].file;
                }
            } catch (err) {
                throw new Error('Cannot decrypt sources. Perhaps the key is invalid.');
            }

            let result = new ZoroStreamData()

            result.video = await this.formatVideo(file, seperateFiles)

            if (intro?.end > intro?.start) {
                result.introStart = intro.start
                result.introEnd = intro.end
            }

            if (outro?.end > outro?.start) {
                result.outroStart = outro.start
                result.outroEnd = outro.end
            }

            result.subtitles = tracks.map((s: any) => {
                let sub = new AnimeSubtitle()
                sub.url = s.file
                sub.lang = s.label ?? ''
                return sub
            }).filter((s: any) => s.url)

            return result;
        } catch (err) {
            throw err;
        }
    };

    private static async formatVideo(master: string, seperated: boolean = false): Promise<Video> {
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
}

export default RapidCloud;
