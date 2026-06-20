import { Request, Response, NextFunction } from "express";
import jwt from  "jsonwebtoken";
import { prisma } from "../config/db.js";

interface AuthenticatedRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req : AuthenticatedRequest, res: Response, next:   NextFunction) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if(!token){
        return res.status(401).json({error: "Not authorized - no token provided"});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any; 
        
        const user = await prisma.user.findUnique({
            where: {id: decoded.id },
            select:{
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true, 
            }
        });

        if (!user){
             return res.status(401).json({error: "User no longer exists"});
        }

        req.user = user;
        next();
    }catch (err : any){
         return res.status(401).json({error: "Token verification failed", message: err.message});
    }
};