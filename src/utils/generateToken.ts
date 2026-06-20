import jwt from 'jsonwebtoken';
import { Response } from 'express';

export const generateToken = (userId: string, res : Response) =>{
    const payload = {id: userId};
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || "30d") as any,
    });

    res.cookie("jwt",token,{
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: (1000 * 60 * 60 * 24) * 7

    })

    return token;

};
