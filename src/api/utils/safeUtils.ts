import { AxiosError } from "axios";
import { Response } from "express"
import { AniError, AniErrorCode } from "../../aniutils/AniError.js";

export async function safeExecute(exec: () => Promise<any>, res: Response) {
    try {
        await exec()
    }
    catch (err: any) {
        if (err instanceof AniError) {
            if (err.code == AniErrorCode.NOT_FOUND) {
                res.status(404).json({
                    status: err.code,
                    data: {},
                    error: err.message
                });
            }
            else {
                res.status(400).json({
                    status: err.code,
                    data: {},
                    error: err.message
                });
            } 
            console.log(err.message)
        }
        else if (err instanceof AxiosError) {
            res.status(err.status || 500).json({
                status: 400,
                data: {},
                error: err.message
            });
            console.log(err.message)
        } else {
            res.status(500).json({
                status: 500,
                data: {},
                error: ["Internal Server Error"],
            });
            console.log(err)
        }
    }
}