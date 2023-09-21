import { Response } from "express"

export function safeExecute(exec: () => void, res: Response) {
    try {
        exec()
    }
    catch (err) {
        if (err instanceof Error) {
            res.statusCode = 501
            res.statusMessage = err.message
            res.json({
                status: 501,
                data: {},
                error: [err.message],
                stack: err.stack
            })
        }
    }
}