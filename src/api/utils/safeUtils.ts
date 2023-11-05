import { Response } from "express"

export async function safeExecute(exec: () => Promise<any>, res: Response) {
    try {
        await exec()
    }
    catch (err: any) {
        if (err instanceof Error) {
            res.status(400).json({
                status: 400,
                data: {},
                error: err.message
            });
            console.log(err.message)
        } else {
            res.status(501).json({
                status: 501,
                data: {},
                error: ["Internal Server Error"],
            });
            console.log(err)
        }
    }
}