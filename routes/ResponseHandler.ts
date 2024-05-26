import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Response {
        sendSuccess: (statusCode: number, message: string, body?: Record<string, any>) => void;
        sendError: (statusCode: number, message: string) => void;
    }
}

const ResponseHandler = (req: Request, res: Response, next: NextFunction) => {
    // Function to send success response
    res.sendSuccess = (statusCode: number, message: string, body?: Record<string, any>) => {
        const response = {
            statusMessage: 'Success',
            message: message,
            statusCode: statusCode,
            body: body,
            timeStamp: new Date().getTime()
        };
        res.status(statusCode).json(response);
    };

    // Function to send error response
    res.sendError = (statusCode: number, message: string) => {
        const response = {
            statusMessage: 'Error',
            message: message,
            statusCode: statusCode,
            timeStamp: new Date().getTime()
        };
        res.status(statusCode).json(response);
    };

    return next();
};

export default ResponseHandler;
