import { Request, Response, NextFunction } from "express";

//checks if the zod accepts the inputs (go to authValidators.ts)

export const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const error = result.error.issues.map((err: any) => err.message).join(", ");

            return res.status(400).json({ message: error });
        }

        //contains datas modified and verified by zod
        req.body = result.data;

        next();

    }

}