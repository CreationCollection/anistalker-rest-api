export class AniError extends Error {
    constructor(public code: AniErrorCode, public message: string) {
        super(message);
        this.name = 'AniError';
    }
    static getMessage(code: AniErrorCode): string {
        switch (code) {
            case AniErrorCode.CANCELLED:
                return 'Cancelled by User';
            case AniErrorCode.BAD_REQUEST_BODY:
                return 'Request Body has wrong values or no values';
            default:
                return 'Unknown Error';
        }
    }

    static getErrorCode(exception: Error): AniErrorCode {
        if (exception instanceof Error && exception.constructor === ReferenceError) {
            return AniErrorCode.NOT_FOUND;
        } else if (exception instanceof Error && exception.constructor === TypeError) {
            return AniErrorCode.TIMEOUT;
        } else {
            return AniErrorCode.UNKNOWN;
        }
    }

    static build(code: AniErrorCode): AniError {
        const message = AniError.getMessage(code);
        return new AniError(code, message);
    }

    static buildWithMessage(code: AniErrorCode, message: string): AniError {
        return new AniError(code, AniError.getMessage(code));
    }

    static buildWithException(exception: Error): AniError {
        const code = AniError.getErrorCode(exception);
        const message = AniError.getMessage(code);
        return new AniError(code, message);
    }
}

export enum AniErrorCode {
    UNKNOWN = 0,
    TIMEOUT = -1,
    CANCELLED = -2,
    NOT_FOUND = -3,
    BAD_REQUEST_BODY = -4,
    BAD_VALUE = 1
}
