import { AxiosError } from "axios";
import { Response } from "express"

export async function safeExecute(exec: () => Promise<any>, res: Response) {
    try {
        await exec()
    }
    catch (err: any) {
        if (err instanceof AxiosError) {
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