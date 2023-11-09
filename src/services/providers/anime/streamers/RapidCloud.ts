import axios, { AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { Parser } from 'm3u8-parser'

import { AnimeSubtitle, ZoroStreamData } from '../../../models/AnimeModels.js'
import { Video, VideoFile } from '../../../models/VideoModels.js'
import { formatVideo } from '../../../../aniutils/M3U8Util.js'

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
                decryptKey = (await axios.get('https://raw.githubusercontent.com/enimax-anime/key/e6/key.txt', { responseType: 'json' })).data;
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

            result.video = await formatVideo(file, seperateFiles)

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
}

export default RapidCloud;
