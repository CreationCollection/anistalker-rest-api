import axios from "axios";
import { Video } from "../../../models/VideoModels.js";
import { load } from "cheerio";

import CryptoJS from "crypto-js";
import { formatVideo } from "./StreamFormater.js";

export class GogoCdn {
    private static readonly keys = {
        key: CryptoJS.enc.Utf8.parse('37911490979715163134003223491201'),
        secondKey: CryptoJS.enc.Utf8.parse('54674138327930866480207815084989'),
        iv: CryptoJS.enc.Utf8.parse('3134003223491201'),
    };

    static async extract(videoUrl: string, seperateFiles: boolean = false): Promise<Video> {
        const url = new URL(videoUrl)

        const res = await axios.get(url.href)
        const $ = load(res.data)

        const encyptedParams = await this.generateEncryptedAjaxParams(
            $,
            url.searchParams.get('id') ?? '' as string
        )

        const encryptedData = await axios.get(
            `${url.protocol}//${url.hostname}/encrypt-ajax.php?${encyptedParams}`,
            {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }
        );

        const decryptedData = await this.decryptAjaxData(encryptedData.data.data);
        if (!decryptedData.source) throw new Error('No source found. Try a different server.');

        return formatVideo(decryptedData.source_bk[0].file, seperateFiles);
    }

    private static generateEncryptedAjaxParams = async ($: cheerio.Root, id: string): Promise<string> => {
        const encryptedKey = CryptoJS.AES.encrypt(id, this.keys.key, {
            iv: this.keys.iv,
        });

        const scriptValue = $("script[data-name='episode']").attr('data-value') as string;

        const decryptedToken = CryptoJS.AES.decrypt(scriptValue, this.keys.key, {
            iv: this.keys.iv,
        }).toString(CryptoJS.enc.Utf8);

        return `id=${encryptedKey}&alias=${id}&${decryptedToken}`;
    };

    private static decryptAjaxData = async (encryptedData: string): Promise<any> => {
        const decryptedData = CryptoJS.enc.Utf8.stringify(
            CryptoJS.AES.decrypt(encryptedData, this.keys.secondKey, {
                iv: this.keys.iv,
            })
        );

        return JSON.parse(decryptedData);
    };
}