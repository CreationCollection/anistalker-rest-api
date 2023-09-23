import { Response } from "express"

export async function safeExecute(exec: () => Promise<any>, res: Response) {
    try {
        await exec()
    }
    catch (err: any) {
        if (err instanceof Error) {
            res.status(501).json({
                status: 501,
                data: {},
                error: [err.message]
            });
        } else {
            res.status(500).json({
                status: 500,
                data: {},
                error: ["Internal Server Error"],
            });
        }
    }
}